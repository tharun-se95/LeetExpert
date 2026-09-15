/** sessionStorage key recording that this tab has already shown the bloom. */
export const LAMP_BOOT_KEY = "lamp-lit";

/**
 * Inline pre-paint script (rendered first in <body> by app/layout.tsx), the
 * same pattern next-themes uses for the colour theme. It marks the first
 * page of a tab with data-lamp-boot so the header lamp's bloom runs from the
 * very first frame — starting it after hydration would flash lit → dark →
 * bloom.
 *
 * The flag is written BEFORE the attribute is set: if storage can't be
 * written (quota, privacy mode) the lamp stays statically lit rather than
 * blooming on every page load. sessionStorage is per tab by specification,
 * so a new tab blooms again — intended.
 */
export const LAMP_BOOT_SCRIPT = `try{if(!sessionStorage.getItem("${LAMP_BOOT_KEY}")){sessionStorage.setItem("${LAMP_BOOT_KEY}","1");document.documentElement.dataset.lampBoot=""}}catch(e){}`;
