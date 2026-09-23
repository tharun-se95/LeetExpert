import { Bookmark, Code, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { HeroFloor } from "@/components/landing/HeroFloor";
import { SIGN_IN_COPY } from "@/lib/auth/signInCopy";

const ICONS = { place: Bookmark, code: Code, own: DownloadSimple } as const;

/**
 * The landing's 3D floor of data structures above the three benefits (owner,
 * 2026-09-24: the page follows the landing's design; it animated the landing's
 * old evolving structure, deleted with that backdrop in 7b67b69). The floor is
 * markup and CSS, so this is a server component with no timer to run or stop.
 * Each benefit sits in the landing's icon tile, in the page's family accent.
 * This file must not import the auth client: SignInButtons is the route's only
 * module that does (authChunkBoundary test).
 */
export function SignInStory() {
  return (
    <div>
      {/*
        A wider slice of the landing's floor at a smaller block size: the scene
        is drawn for a ~1200px hero, and a band this size cropped it to a few
        oversized blocks. The floor is laid out in a box 160% of the band and
        scaled by 1/1.6 from its top centre, so it fills the band again showing
        more of the scene; the bottom fades as the landing fades its top edge.
      */}
      <div className="relative h-60 overflow-clip [mask-image:linear-gradient(to_bottom,#000_65%,transparent)]">
        <div className="absolute top-0 left-1/2 h-[160%] w-[160%] origin-top -translate-x-1/2 scale-[0.625]">
          <HeroFloor />
        </div>
      </div>
      <ul className="mt-8 grid gap-6">
        {SIGN_IN_COPY.benefits.map(({ id, title, body }) => {
          const Icon = ICONS[id];
          return (
            <li key={id} className="flex gap-4">
              <span className="landing-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-[length:var(--radius-md)]">
                <Icon aria-hidden weight="bold" className="h-5 w-5 text-accent" />
              </span>
              <div>
                {/* Not a heading: the h1 and the card's h2 own the outline. */}
                <p className="font-display text-base font-bold">{title}</p>
                <p className="mt-1 text-sm text-muted">{body}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
