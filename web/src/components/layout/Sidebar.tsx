"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildSidebarNav, type NavItem } from "@/lib/content/nav";
import { useProgress } from "@/components/providers/ProgressProvider";
import { FAMILIES } from "@/lib/content/manifest";
import { getFamilyTheme } from "@/lib/visual/familyTheme";

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function familyIdFromNavItem(item: NavItem): string | null {
  if (item.id.startsWith("family-")) return item.id.replace(/^family-/, "");
  if (item.id.startsWith("pattern-")) {
    // pattern-{familyId}-{slug} — family ids contain hyphens
    for (const f of FAMILIES) {
      if (item.id.startsWith(`pattern-${f.id}-`)) return f.id;
    }
  }
  if (item.id.startsWith("cheat-")) {
    const id = item.id.replace(/^cheat-/, "");
    return FAMILIES.some((f) => f.id === id) ? id : null;
  }
  if (item.id.startsWith("practice-")) {
    const id = item.id.replace(/^practice-/, "");
    return FAMILIES.some((f) => f.id === id) ? id : null;
  }
  return null;
}

function NavNode({
  item,
  depth,
  pathname,
}: {
  item: NavItem;
  depth: number;
  pathname: string;
}) {
  const { visited } = useProgress();
  const hasChildren = Boolean(item.children?.length);
  const childActive = item.children?.some(
    (c) =>
      isActivePath(pathname, c.href) ||
      c.children?.some((gc) => isActivePath(pathname, gc.href)),
  );
  const selfActive = pathname === item.href;
  const [open, setOpen] = useState(
    depth === 0 || Boolean(childActive) || selfActive,
  );

  useEffect(() => {
    if (childActive || selfActive) setOpen(true);
  }, [childActive, selfActive, pathname]);

  const familyId = familyIdFromNavItem(item);
  const accent = familyId ? getFamilyTheme(familyId).accent : null;
  const showPip = !hasChildren || depth >= 2;
  const isVisited = visited.has(item.id);

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-0.5 rounded-md",
          depth === 0 && "mt-3 first:mt-0",
        )}
      >
        {hasChildren && depth < 2 ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted hover:bg-surface hover:text-foreground"
            aria-label={open ? "Collapse" : "Expand"}
          >
            {open ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center">
            {showPip ? (
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  !isVisited && "bg-border",
                )}
                style={
                  isVisited
                    ? { background: accent ?? "var(--accent)" }
                    : undefined
                }
                title={isVisited ? "Visited" : "Not visited"}
              />
            ) : null}
          </span>
        )}
        <Link
          href={item.href}
          className={cn(
            "min-w-0 flex-1 truncate rounded-md py-1 pl-1.5 pr-1.5 text-[13px] transition",
            depth === 0 && "font-medium text-foreground",
            depth > 0 && "text-muted hover:text-foreground",
            selfActive && "bg-accent/10 text-foreground",
            !selfActive && "hover:bg-surface",
            accent && depth >= 1 && "border-l-[3px]",
          )}
          style={{
            paddingLeft: depth > 1 ? 8 + (depth - 1) * 6 : undefined,
            ...(accent && depth >= 1
              ? { borderLeftColor: accent }
              : {}),
          }}
        >
          {item.title}
        </Link>
      </div>
      {hasChildren && open ? (
        <div
          className="ml-2 border-l pl-1"
          style={
            accent
              ? {
                  borderLeftWidth: 3,
                  borderLeftColor: `color-mix(in oklab, ${accent} 55%, transparent)`,
                }
              : { borderLeftColor: "var(--border)" }
          }
        >
          {item.children!.map((child) => (
            <NavNode
              key={child.id}
              item={child}
              depth={depth + 1}
              pathname={pathname}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const nav = useMemo(() => buildSidebarNav(), []);

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      <div
        className={cn(
          "print:hidden fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          "print:hidden fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-border bg-background transition-transform lg:static lg:z-0 lg:w-64 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center border-b border-border px-4 lg:hidden">
          <span className="text-sm font-semibold">Navigation</span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Handbook">
          {nav.map((item) => (
            <NavNode key={item.id} item={item} depth={0} pathname={pathname} />
          ))}
        </nav>
      </aside>
    </>
  );
}
