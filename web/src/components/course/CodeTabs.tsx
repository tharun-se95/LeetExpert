"use client";

import { CodeBody, CopyButton } from "@/components/md/CodeBlock";
import { CodeLangMenu } from "@/components/code/CodeLangMenu";
import { useCodeLang } from "@/lib/codeLang";
import { isCodeLangId, resolveCodeLang, type CodeLangId } from "@/lib/codeLanguages";
import type { TabBlock } from "@/lib/content/highlightBlocks";

type LangTab = TabBlock & { language: CodeLangId };

/**
 * A lesson's code in several languages. Every language renders on the server;
 * the block names them in data-code-lang-has and generated CSS shows the one
 * the learner's preference resolves to before paint, so a static page never
 * flashes the wrong language. Copy follows the store, which agrees with the
 * attribute once hydrated.
 */
export function CodeTabs({ tabs }: { tabs: TabBlock[] }) {
  const [preferred] = useCodeLang();
  const panels = tabs.filter((tab): tab is LangTab => isCodeLangId(tab.language));
  if (panels.length === 0) {
    return null;
  }
  const available = panels.map((tab) => tab.language);
  const shown = resolveCodeLang(preferred, available);
  const visible = panels.find((tab) => tab.language === shown) ?? panels[0];

  return (
    <div className="code-surface group my-5" data-code-lang-has={available.join(" ")}>
      <div className="code-surface-header">
        <CodeLangMenu available={available} cssLabels />
        <CopyButton code={visible.code} />
      </div>
      {panels.map((tab) => (
        <CodeBody key={tab.language} code={tab.code} html={tab.html} panel={tab.language} />
      ))}
    </div>
  );
}
