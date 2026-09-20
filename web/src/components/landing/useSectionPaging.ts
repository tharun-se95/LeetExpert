"use client";

import { useEffect } from "react";
import { activeSectionIndex } from "@/components/landing/useSectionReveal";
import { IDLE, stepWheel, travelEnded, type GestureState } from "@/lib/landing/wheelGesture";

export type Paging = "down" | "up" | "native";

/**
 * What one wheel event should do on the landing page.
 * - "down" / "up": move one snap stop.
 * - "native": let the browser scroll — the current section is taller than
 *   the viewport and the reader hasn't reached its edge in that direction.
 *   Not for a stepped section (`data-scroll-steps`: Understand, Build and
 *   Keep from lg, owner 2026-09-20), which is tall only to hold one screen per
 *   feature: there each gesture moves one feature, then on to the next section.
 *
 * Whether the gesture may move *now*, and how fast, is `wheelGesture`'s job.
 */
export function pagingIntent({
  deltaY,
  sectionTop,
  sectionBottom,
  viewport,
  stepped = false,
}: {
  deltaY: number;
  sectionTop: number;
  sectionBottom: number;
  viewport: number;
  stepped?: boolean;
}): Paging {
  const down = deltaY > 0;
  if (stepped) return down ? "down" : "up";
  if (down && sectionBottom > viewport + 2) return "native";
  if (!down && sectionTop < -2) return "native";
  return down ? "down" : "up";
}

/**
 * Whether the wheel, over `target`, would scroll something inside the page
 * rather than the page: a scrollable box between it and `root` that can still
 * move in that direction (the cheatsheet, the problem list, the coach
 * thread). Those scroll first; the page pages once they reach their end.
 */
export function scrollsInside(target: EventTarget | null, deltaY: number, root: Element): boolean {
  for (let el = target instanceof Element ? target : null; el && el !== root; el = el.parentElement) {
    const { overflowY } = getComputedStyle(el);
    if (overflowY !== "auto" && overflowY !== "scroll") continue;
    if (el.scrollHeight <= el.clientHeight + 1) continue;
    const room = deltaY > 0 ? el.scrollHeight - el.clientHeight - el.scrollTop : el.scrollTop;
    if (room > 1) return true;
  }
  return false;
}

/** Shortening a travel always leaves this much glide, so it never snaps shut. */
const MIN_GLIDE_MS = 80;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/**
 * One wheel gesture moves one section on the landing page (from lg, fine
 * pointers only), taking longer for a gentle gesture than for a flick.
 *
 * Measured in Chrome with `snap-mandatory`: a 300px wheel scroll from the top
 * ended back at 0, because the nearest stop to 300px of a 1306px section is
 * the one it left — a mouse-wheel reader felt the page resist. So the wheel is
 * turned into a travel of our own. Keyboard and touch keep the browser's
 * native snapping; reduced motion pages instantly.
 *
 * The travel is a tween we run rather than `behavior: "smooth"` because
 * smooth's duration is fixed and unreadable, and the duration is the point
 * here (owner, 2026-09-20: "it should be scroll speed sensitive").
 */
export function useSectionPaging() {
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const desktop = window.matchMedia("(pointer: fine) and (min-width: 1024px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    let gesture: GestureState = IDLE;
    let frame = 0;
    let travel: { from: number; to: number; began: number; duration: number } | null = null;

    /**
     * Snapping MUST be suspended for the tween, not merely nudged by it.
     * Measured in Chrome at 1440x900: tweening 400px over 300ms with
     * `snap-mandatory` left on, all 20 frames read `scrollTop` back as 0 —
     * the browser reverts every assignment to the current snap point, so the
     * page would not move at all.
     *
     * Restoring it on landing also resolves the residual. The stops are not a
     * whole viewport apart everywhere: measured at 1440x900 they sit at
     * 0, 894, 1794 ... 8994, 9903, 10479, so travelling exactly one viewport
     * overshoots by 6px at the first gap (the header offset) and undershoots
     * by 9px at the second-to-last, and is exact at the other ten. Both are
     * far nearer the next stop than the one left, so the restore corrects
     * them and never snaps back a whole stop — which is what the old
     * `scrollBy` leaned on too.
     */
    const land = () => {
      travel = null;
      gesture = travelEnded(gesture);
      main.style.removeProperty("scroll-snap-type");
    };

    const tick = (now: number) => {
      if (!travel) return;
      const t = Math.min(1, (now - travel.began) / travel.duration);
      main.scrollTop = travel.from + (travel.to - travel.from) * easeOutCubic(t);
      if (t >= 1) return land();
      frame = requestAnimationFrame(tick);
    };

    const startTravel = (dir: 1 | -1, durationMs: number) => {
      const to = main.scrollTop + dir * main.clientHeight;
      if (reduce.matches) {
        main.scrollTop = to;
        gesture = travelEnded(gesture);
        return;
      }
      main.style.setProperty("scroll-snap-type", "none");
      travel = { from: main.scrollTop, to, began: performance.now(), duration: durationMs };
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    };

    const shorten = (durationMs: number) => {
      if (!travel) return;
      const elapsed = performance.now() - travel.began;
      travel.duration = Math.max(elapsed + MIN_GLIDE_MS, Math.min(travel.duration, durationMs));
    };

    const apply = (e: WheelEvent) => {
      e.preventDefault();
      const step = stepWheel(gesture, e.deltaY, performance.now());
      gesture = step.state;
      if (step.action === "start") startTravel(step.dir, step.durationMs);
      else if (step.action === "shorten") shorten(step.durationMs);
    };

    const onWheel = (e: WheelEvent) => {
      // ctrl+wheel is pinch-zoom on trackpads; leave it to the browser.
      if (!desktop.matches || e.ctrlKey || e.deltaY === 0) return;
      // Mid-travel the section under the middle band is changing, so asking
      // pagingIntent again could hand the browser a native scroll that fights
      // the tween. While travelling, the gesture machine alone decides.
      if (gesture.phase === "travel") return apply(e);
      if (scrollsInside(e.target, e.deltaY, main)) return;

      const viewport = main.clientHeight;
      const sections = Array.from(main.querySelectorAll<HTMLElement>("[data-scroll-section]"));
      const boxes = sections.map((el) => el.getBoundingClientRect());
      const at = activeSectionIndex(boxes, viewport / 2);
      const current = boxes[at];
      const intent = pagingIntent({
        stepped: sections[at]?.hasAttribute("data-scroll-steps") ?? false,
        deltaY: e.deltaY,
        sectionTop: current?.top ?? 0,
        sectionBottom: current?.bottom ?? viewport,
        viewport,
      });
      // The browser is about to scroll this section itself: forget the
      // gesture, or its tail would hold the next page move.
      if (intent === "native") {
        gesture = IDLE;
        return;
      }
      apply(e);
    };

    main.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      main.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(frame);
      main.style.removeProperty("scroll-snap-type");
    };
  }, []);
}
