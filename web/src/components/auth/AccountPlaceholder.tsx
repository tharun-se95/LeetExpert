import { cn } from "@/lib/utils";

export const CONTROL_SIZE = "h-11 w-11 md:h-10 md:w-10";

/**
 * The avatar's footprint. Shown while the session loads and while the session
 * chunk downloads, so the header does not shift when either finishes.
 */
export function AccountPlaceholder() {
  return <span data-account-placeholder aria-hidden className={cn("shrink-0", CONTROL_SIZE)} />;
}
