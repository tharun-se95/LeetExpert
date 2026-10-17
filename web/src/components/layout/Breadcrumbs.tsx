import Link from "next/link";
import { CaretRight as ChevronRight } from "@phosphor-icons/react/dist/ssr";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbLd } from "@/lib/seo/jsonLd";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <>
      {/* Emitted here, from the same `items`, so the BreadcrumbList markup
          cannot drift from the trail the visitor actually sees. */}
      <JsonLd
        data={breadcrumbLd(
          items.map((item) => ({ name: item.label, path: item.href })),
        )}
      />
      <nav aria-label="Breadcrumb" className="print:hidden mb-6 inline-flex">
        <ol className="inline-flex flex-wrap items-center gap-1.5 rounded-full border border-border/70 bg-surface/40 px-3.5 py-1.5 text-xs text-muted shadow-elevation backdrop-blur-xs">
          <li>
            <Link
              href="/"
              className="transition-colors hover:text-foreground font-medium"
            >
              Home
            </Link>
          </li>
          {items.map((item, i) => (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              <ChevronRight className="h-3 w-3 shrink-0 text-muted/60" aria-hidden />
              {item.href ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-foreground font-medium"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="rounded-full bg-elevated px-2 py-0.5 text-foreground font-semibold shadow-elevation border border-border/60"
                  aria-current="page"
                >
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
