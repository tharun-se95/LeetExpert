"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import type { DraftLang, Stash } from "@/lib/progress/types";

// Same lazy editor as the sandbox, so Compare paints from the one code palette
// and the ~185 lessons without a stash never download it for this.
const CodeEditor = dynamic(() => import("@/components/kit/CodeEditor").then((m) => m.CodeEditor), { ssr: false });

// --info-line is grain-safe only on --elevated, which is what this row sits on.
const ROW_BUTTON =
  "py-1 text-sm font-medium text-info underline decoration-info-line underline-offset-4 hover:decoration-info";

function ComparePane({ title, label, code, lang }: { title: string; label: string; code: string; lang: DraftLang }) {
  return (
    <section aria-label={title}>
      <h2 className="font-display text-sm font-bold">{title}</h2>
      <div className="mt-2 overflow-hidden rounded-[length:var(--radius-md)] border border-border bg-code-editor">
        <div className="code-body p-0">
          {/* Fixed height, not min: a long draft scrolls inside its own pane so the two stay side by side. */}
          <CodeEditor value={code} lang={lang} readOnly ariaLabel={label} height="16rem" />
        </div>
      </div>
    </section>
  );
}

/**
 * Compare shows only the learner's own two drafts. Escape and the backdrop
 * just close it: neither copy is chosen, so neither is lost.
 */
export function DraftStashRow({
  stash,
  current,
  lang,
  onUse,
  onDismiss,
}: {
  stash: Stash;
  current: string;
  lang: DraftLang;
  onUse: () => void;
  onDismiss: () => void;
}) {
  const [comparing, setComparing] = useState(false);
  // A stash is either the other device's copy or this device's own, set aside
  // when the other device's replaced it; the wording must say which.
  const own = stash.displaced === true;
  return (
    <div role="status" className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border bg-elevated px-4 py-2">
      <p className="text-sm text-info">
        {own
          ? "Your previous version of this draft was replaced by a newer one and is kept here."
          : "A different version of this draft was saved on another device."}
      </p>
      <div className="flex gap-4">
        <button type="button" className={ROW_BUTTON} onClick={() => setComparing(true)}>
          Compare
        </button>
        <button type="button" className={ROW_BUTTON} onClick={onUse}>
          Use that version
        </button>
        <button type="button" className={ROW_BUTTON} onClick={onDismiss}>
          Dismiss
        </button>
      </div>
      <Dialog
        open={comparing}
        onClose={() => setComparing(false)}
        label="Compare draft versions"
        // The overlay does not scroll, so on a short screen the panel must.
        className="max-h-[80vh] max-w-5xl overflow-y-auto"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <ComparePane title="This editor" label="Code in this editor" code={current} lang={lang} />
          <ComparePane
            title={own ? "Previous version" : "Other device"}
            label={own ? "Code from the previous version" : "Code from the other device"}
            code={stash.deleted ? "" : stash.code}
            lang={lang}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <button type="button" className={ROW_BUTTON} onClick={() => setComparing(false)}>
            Close
          </button>
        </div>
      </Dialog>
    </div>
  );
}
