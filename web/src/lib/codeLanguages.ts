/**
 * The code languages a learner can prefer, and how a preference resolves on
 * a surface that lacks it. Hook-free on purpose: the server layout imports the
 * pre-paint script and the generated rules, which read this, and a module that
 * imports React hooks cannot sit in a Server Component's graph.
 * Spec: docs/superpowers/specs/2026-09-14-global-code-language-switch-design.md
 */
export const CODE_LANG_IDS = ["python", "javascript", "typescript"] as const;

export type CodeLangId = (typeof CODE_LANG_IDS)[number];

export const CODE_LANG_LABEL: Record<CodeLangId, string> = {
  python: "Python",
  javascript: "JavaScript",
  typescript: "TypeScript",
};

export const DEFAULT_CODE_LANG: CodeLangId = "python";
export const CODE_LANG_STORAGE_KEY = "dsa-code-lang";
export const CODE_LANG_ATTRIBUTE = "data-code-lang";

/** TypeScript without its types is JavaScript, so each is the other's nearest. */
const NEAREST: Partial<Record<CodeLangId, CodeLangId[]>> = {
  javascript: ["typescript"],
  typescript: ["javascript"],
};

export function isCodeLangId(value: unknown): value is CodeLangId {
  return CODE_LANG_IDS.some((id) => id === value);
}

export function parseCodeLang(value: unknown): CodeLangId {
  return isCodeLangId(value) ? value : DEFAULT_CODE_LANG;
}

/** The preference, its nearest relatives, then every other language — so every surface resolves. */
export function codeLangChain(preferred: CodeLangId): CodeLangId[] {
  const order = [preferred, ...(NEAREST[preferred] ?? []), ...CODE_LANG_IDS];
  return order.filter((id, i) => order.indexOf(id) === i);
}

export function resolveCodeLang<T extends CodeLangId>(preferred: CodeLangId, available: readonly T[]): T {
  for (const id of codeLangChain(preferred)) {
    const hit = available.find((lang) => lang === id);
    if (hit) return hit;
  }
  return available[0];
}

/**
 * The rules that show each server-rendered block's resolved language before
 * paint. A panel for language L is hidden in a block that also has a language
 * earlier than L in the preference's chain. `~=` matching needs no :has(). With
 * no attribute (first visit, blocked script) blocks resolve as python.
 */
export function codeLangCss(): string {
  return CODE_LANG_IDS.map((preferred) => {
    const roots =
      preferred === DEFAULT_CODE_LANG
        ? [`html:not([${CODE_LANG_ATTRIBUTE}])`, `html[${CODE_LANG_ATTRIBUTE}="${preferred}"]`]
        : [`html[${CODE_LANG_ATTRIBUTE}="${preferred}"]`];
    const chain = codeLangChain(preferred);
    const selectors = chain.flatMap((lang, i) =>
      chain
        .slice(0, i)
        .flatMap((earlier) =>
          roots.map((root) => `${root} [data-code-lang-has~="${earlier}"] [data-code-lang-panel="${lang}"]`),
        ),
    );
    return `${selectors.join(",\n")} {\n  display: none;\n}`;
  }).join("\n");
}
