import type { ReactNode } from "react";
import { Markdown } from "@/components/md/Markdown";
import { TableOfContents } from "@/components/md/TableOfContents";
import { Breadcrumbs, type Crumb } from "@/components/layout/Breadcrumbs";
import { PrevNext } from "@/components/layout/PrevNext";
import type { LoadedDoc } from "@/lib/content/load";
import { familyCssVars } from "@/lib/visual/familyTheme";

interface DocPageProps {
  doc: LoadedDoc;
  breadcrumbs: Crumb[];
  pathname: string;
  eyebrow?: string;
  /** PatternLab / explorers rendered above markdown */
  stage?: ReactNode;
  /** Sets data-family + CSS vars on the article */
  familyId?: string;
  /** Collapse long reference markdown under a <details> disclosure */
  markdownInDetails?: {
    summary: string;
  };
}

export function DocPage({
  doc,
  breadcrumbs,
  pathname,
  eyebrow,
  stage,
  familyId,
  markdownInDetails,
}: DocPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl gap-10 px-4 py-8 lg:px-8 lg:py-10">
      <article
        className="min-w-0 flex-1"
        data-family={familyId || undefined}
        style={familyId ? familyCssVars(familyId) : undefined}
      >
        <Breadcrumbs items={breadcrumbs} />
        {eyebrow ? (
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-accent">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-[2rem]">
          {doc.title}
        </h1>
        <p className="mt-2 text-sm text-muted">
          ~{doc.readingMinutes} min read
        </p>
        {stage ? <div className="mt-6 print:hidden">{stage}</div> : null}
        {markdownInDetails ? (
          <details className="mt-8 rounded-xl border border-border bg-surface/40 open:bg-transparent">
            <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-muted transition hover:text-foreground">
              {markdownInDetails.summary}
            </summary>
            <div className="border-t border-border px-4 pb-2 pt-2">
              <Markdown source={doc.markdown} />
            </div>
          </details>
        ) : (
          <div className="mt-8">
            <Markdown source={doc.markdown} />
          </div>
        )}
        <PrevNext pathname={pathname} />
      </article>
      <aside className="print:hidden hidden w-52 shrink-0 xl:block">
        <TableOfContents items={doc.toc} />
      </aside>
    </div>
  );
}
