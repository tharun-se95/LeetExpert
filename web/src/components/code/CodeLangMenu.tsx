"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { CaretDown, Check } from "@phosphor-icons/react";
import { LanguageMark } from "@/components/kit/languageMarks";
import { useCodeLang } from "@/lib/codeLang";
import { CODE_LANG_LABEL, resolveCodeLang, type CodeLangId } from "@/lib/codeLanguages";
import { cn } from "@/lib/utils";

interface CodeLangMenuProps<T extends CodeLangId> {
  /** The languages this surface has, in menu order. */
  available: readonly T[];
  /**
   * Server-rendered surfaces label every language and let the generated CSS
   * show the resolved one, so the label is right at first paint. Client-only
   * surfaces label the store's resolution, matching the code they render.
   */
  cssLabels?: boolean;
  /** "code" sits on the --code-editor canvas; "paper" on the sandbox toolbar. */
  tone?: "code" | "paper";
}

/**
 * The code-language picker on a code surface: a menu button naming the
 * language shown, and a menu of the languages this surface has. Props-only so
 * it renders in tests without the store. The menu is portalled to <body> with
 * fixed positioning because every code surface clips its overflow.
 */
export function CodeLangMenuView<T extends CodeLangId>({
  available,
  preferred,
  onPick,
  cssLabels = false,
  tone = "code",
}: CodeLangMenuProps<T> & {
  preferred: CodeLangId;
  onPick: (id: T, trigger: HTMLElement) => void;
}) {
  const shown = resolveCodeLang(preferred, available);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();
  const noteId = useId();
  const unavailable = preferred !== shown;

  const openMenu = () => {
    setActive(Math.max(0, available.indexOf(shown)));
    setOpen(true);
  };
  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };
  const pick = (id: T) => {
    close(true);
    if (triggerRef.current) onPick(id, triggerRef.current);
  };

  // Placed under the trigger, flipped above it or pulled inside the viewport
  // when there is no room. Written to the element, not state: it is measured
  // after the menu mounts, and nothing else renders from it. Returns false once
  // the trigger has left the screen.
  const place = () => {
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger || !menu) return false;
    const rect = trigger.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return false;
    const margin = 8;
    const gap = 4;
    const left = Math.max(margin, Math.min(rect.left, window.innerWidth - margin - menu.offsetWidth));
    const below = rect.bottom + gap;
    const top =
      below + menu.offsetHeight > window.innerHeight - margin
        ? Math.max(margin, rect.top - gap - menu.offsetHeight)
        : below;
    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
    menu.style.visibility = "visible";
    return true;
  };

  useLayoutEffect(() => {
    if (open) place();
  });

  useEffect(() => {
    if (open) itemRefs.current[active]?.focus({ preventScroll: true });
  }, [open, active]);

  // The page scrolls smoothly, so a click can land mid-scroll: the menu follows
  // its trigger rather than closing, and closes once the trigger is off screen.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: Event) => {
      const target = event.target;
      if (target instanceof Node && (triggerRef.current?.contains(target) || menuRef.current?.contains(target))) {
        return;
      }
      setOpen(false);
    };
    const follow = () => {
      if (!place()) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("scroll", follow, true);
    window.addEventListener("resize", follow);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("scroll", follow, true);
      window.removeEventListener("resize", follow);
    };
  }, [open]);

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMenu();
    }
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = available.length - 1;
    switch (event.key) {
      case "ArrowDown":
        setActive((i) => (i === last ? 0 : i + 1));
        break;
      case "ArrowUp":
        setActive((i) => (i === 0 ? last : i - 1));
        break;
      case "Home":
        setActive(0);
        break;
      case "End":
        setActive(last);
        break;
      case "Enter":
      case " ":
        pick(available[active]);
        break;
      case "Escape":
      case "Tab":
        close(true);
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  const label = (id: CodeLangId) => (
    <>
      <LanguageMark language={id} />
      {CODE_LANG_LABEL[id]}
    </>
  );

  return (
    <span className="inline-flex" data-code-lang-has={cssLabels ? available.join(" ") : undefined}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        data-tone={tone}
        onClick={() => (open ? close(false) : openMenu())}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          "code-lang-label -mx-1.5 min-h-7 rounded-[length:var(--radius-sm)] px-1.5 transition-colors",
          tone === "code" ? "hover:bg-[var(--editor-active-line)]" : "hover:bg-code",
        )}
      >
        <span className="sr-only">Code language: </span>
        {cssLabels ? (
          available.map((id) => (
            <span key={id} data-code-lang-panel={id} className="inline-flex items-center gap-1.5">
              {label(id)}
            </span>
          ))
        ) : (
          <span className="inline-flex items-center gap-1.5">{label(shown)}</span>
        )}
        <CaretDown aria-hidden weight="bold" className="h-3 w-3 opacity-70" />
      </button>
      {open
        ? createPortal(
            <div
              ref={menuRef}
              style={{ position: "fixed", top: 0, left: 0, visibility: "hidden" }}
              className="z-50 min-w-44 overflow-hidden rounded-[length:var(--radius-md)] border border-border bg-elevated py-1 font-sans shadow-elevation"
            >
              {unavailable ? (
                <p id={noteId} className="border-b border-border px-3 pt-1 pb-2 text-xs text-muted">
                  {CODE_LANG_LABEL[preferred]} isn&apos;t available here — showing {CODE_LANG_LABEL[shown]}.
                </p>
              ) : null}
              <div
                role="menu"
                id={menuId}
                aria-label="Code language"
                aria-describedby={unavailable ? noteId : undefined}
                onKeyDown={onMenuKeyDown}
              >
                {available.map((id, i) => {
                  const checked = id === shown;
                  return (
                    <button
                      key={id}
                      ref={(el) => {
                        itemRefs.current[i] = el;
                      }}
                      type="button"
                      role="menuitemradio"
                      aria-checked={checked}
                      tabIndex={-1}
                      onClick={() => pick(id)}
                      className={cn(
                        "flex min-h-11 w-full items-center gap-2 px-3 text-left text-sm transition-colors hover:bg-surface md:min-h-9",
                        checked ? "font-medium text-foreground" : "text-muted hover:text-foreground",
                      )}
                    >
                      <LanguageMark language={id} />
                      <span className="flex-1">{CODE_LANG_LABEL[id]}</span>
                      {checked ? <Check aria-hidden className="h-3.5 w-3.5" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>,
            document.body,
          )
        : null}
    </span>
  );
}

/**
 * Keeps the picker the learner used where it was: every block on the page
 * switches at once and blocks above it change height.
 */
function keepInPlace(el: HTMLElement, before: number) {
  const delta = el.getBoundingClientRect().top - before;
  if (Math.abs(delta) < 1) return;
  for (let node = el.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight) {
      node.scrollBy(0, delta);
      return;
    }
  }
  window.scrollBy(0, delta);
}

export function CodeLangMenu<T extends CodeLangId>(props: CodeLangMenuProps<T>) {
  const [preferred, setPreferred] = useCodeLang();
  return (
    <CodeLangMenuView
      {...props}
      preferred={preferred}
      onPick={(id, trigger) => {
        const before = trigger.getBoundingClientRect().top;
        setPreferred(id);
        requestAnimationFrame(() => keepInPlace(trigger, before));
      }}
    />
  );
}
