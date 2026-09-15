"use client";

import { CodeBody, CopyButton } from "@/components/md/CodeBlock";
import { LanguageMark } from "@/components/kit/languageMarks";
import { codeLangForFence, useCodeLang } from "@/lib/codeLang";
import type { TabBlock } from "@/lib/content/highlightBlocks";

/**
 * A lesson's code in both languages. The header's global switch picks the
 * language; both panels render on the server and CSS shows one before paint
 * (globals.css), so a static page never flashes the wrong language. Copy
 * follows the store, which agrees with the attribute once hydrated.
 */
export function CodeTabs({ tabs }: { tabs: TabBlock[] }) {
  const [lang] = useCodeLang();
  if (tabs.length === 0) {
    return null;
  }
  const visible = tabs.find((tab) => codeLangForFence(tab.language) === lang) ?? tabs[0];

  return (
    <div className="code-surface group my-5">
      <div className="code-surface-header">
        <span className="inline-flex items-center">
          {tabs.map((tab) => (
            <span
              key={tab.language}
              data-code-lang-panel={codeLangForFence(tab.language) ?? undefined}
              className="code-lang-label"
            >
              <LanguageMark language={tab.language} />
              {tab.label}
            </span>
          ))}
        </span>
        <CopyButton code={visible.code} />
      </div>
      {tabs.map((tab) => (
        <CodeBody
          key={tab.language}
          code={tab.code}
          html={tab.html}
          panel={codeLangForFence(tab.language) ?? undefined}
        />
      ))}
    </div>
  );
}
