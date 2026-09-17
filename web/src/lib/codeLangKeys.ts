/**
 * Where the code-language choice lives. Hook-free on purpose: the server
 * layout imports the pre-paint script, which reads these, and a module that
 * imports React hooks cannot sit in a Server Component's graph.
 */
export const CODE_LANG_STORAGE_KEY = "dsa-code-lang";
export const CODE_LANG_ATTRIBUTE = "data-code-lang";
