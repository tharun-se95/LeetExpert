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
      <nav aria-label="Breadcrumb" className="print:hidden mb-6">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
        <li>
          <Link href="/" className="transition hover:text-foreground">
            Home
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
            {item.href ? (
              <Link href={item.href} className="transition hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground" aria-current="page">
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
