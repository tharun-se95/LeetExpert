import type { Metadata } from "next";
import Link from "next/link";
import { Markdown } from "@/components/md/Markdown";
import { loadAllForPrint } from "@/lib/content/load";
import { PrintAllButton } from "@/components/layout/PrintAllButton";

export const metadata: Metadata = {
  title: "Print / Export PDF",
  description: "Full handbook view optimized for print-to-PDF export.",
};

export default function PrintPage() {
  const docs = loadAllForPrint();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:px-8">
      <div className="print:hidden mb-10 rounded-xl border border-border bg-surface p-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Export the full handbook as PDF
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          This page concatenates every chapter for printing. Use your browser’s
          print dialog and choose <strong>Save as PDF</strong>. Chrome / Edge
          give the cleanest results — enable backgrounds if diagrams look pale.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <PrintAllButton />
          <Link
            href="/"
            className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm transition hover:bg-background"
          >
            Back to overview
          </Link>
        </div>
      </div>

      <header className="mb-12 hidden print:block">
        <p className="text-xs uppercase tracking-wider text-zinc-500">
          DSA Pattern Handbook
        </p>
        <h1 className="mt-1 text-3xl font-semibold">Full print edition</h1>
      </header>

      {docs.map((doc, index) => (
        <section
          key={doc.href}
          className={index === 0 ? "mb-16" : "print-chapter mb-16"}
        >
          <h1 className="mb-6 text-2xl font-semibold tracking-tight">
            {doc.title}
          </h1>
          <Markdown source={doc.markdown} />
        </section>
      ))}
    </div>
  );
}
