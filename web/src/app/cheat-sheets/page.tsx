import type { Metadata } from "next";
import Link from "next/link";
import { DocPage } from "@/components/layout/DocPage";
import { loadStaticPage } from "@/lib/content/load";
import { FAMILIES } from "@/lib/content/manifest";

export const metadata: Metadata = {
  title: "Cheat Sheets",
};

export default function CheatSheetsIndexPage() {
  const doc = loadStaticPage("cheatSheetsIndex");
  return (
    <div>
      <DocPage
        doc={doc}
        pathname="/cheat-sheets"
        eyebrow="Part 4"
        breadcrumbs={[{ label: "Cheat Sheets" }]}
      />
      <div className="print:hidden mx-auto max-w-6xl px-4 pb-12 lg:px-8">
        <div className="grid max-w-[65ch] gap-2 sm:grid-cols-2">
          {FAMILIES.map((f) => (
            <Link
              key={f.id}
              href={`/cheat-sheets/${f.id}`}
              className="rounded-lg border border-border px-4 py-3 text-sm font-medium transition hover:bg-surface"
            >
              {f.number}. {f.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
