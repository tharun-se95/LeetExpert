import {
  CODE_LANG_ATTRIBUTE,
  CODE_LANG_IDS,
  CODE_LANG_STORAGE_KEY,
  codeLangCss,
} from "@/lib/codeLanguages";

/**
 * Rendered as a plain inline <script> at the top of <body>, right after the
 * lamp's boot script, so it runs while the HTML parses — before any code block
 * below it paints. Only registry ids are copied; anything else leaves no
 * attribute, which resolves as Python, as does a blocked script.
 */
export const CODE_LANG_INIT_SCRIPT = `(function(){try{var v=localStorage.getItem(${JSON.stringify(
  CODE_LANG_STORAGE_KEY,
)});if(${JSON.stringify(CODE_LANG_IDS)}.indexOf(v)!==-1){document.documentElement.setAttribute(${JSON.stringify(
  CODE_LANG_ATTRIBUTE,
)},v)}}catch(e){}})();`;

/** The resolution rules, rendered as an inline <style> right after the script. */
export const CODE_LANG_CSS = codeLangCss();
