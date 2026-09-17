import { CODE_LANG_ATTRIBUTE, CODE_LANG_STORAGE_KEY } from "@/lib/codeLangKeys";

/**
 * Rendered as a plain inline <script> at the top of <body>, right after the
 * lamp's boot script, so it runs while the HTML parses — before any code block
 * below it paints. Only "js" needs the attribute: every hide rule keys off an
 * explicit js, so no attribute and "python" render identically, and a blocked
 * script degrades to Python.
 */
export const CODE_LANG_INIT_SCRIPT = `(function(){try{if(localStorage.getItem(${JSON.stringify(
  CODE_LANG_STORAGE_KEY,
)})==="js"){document.documentElement.setAttribute(${JSON.stringify(
  CODE_LANG_ATTRIBUTE,
)},"js")}}catch(e){}})();`;
