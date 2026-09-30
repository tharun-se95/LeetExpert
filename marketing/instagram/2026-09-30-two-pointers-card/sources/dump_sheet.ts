// Prints the product's real two-pointers cheatsheet plus the registry counts as JSON.
// Run from web/ (for its tsconfig paths):  npx tsx <this file>  > sheet.json
import { CHEATSHEETS, practiceModuleSlugs } from "../../../../web/src/lib/course/cheatsheets/registry";
import { MODULES } from "../../../../web/src/lib/course/manifest";

const sheet = CHEATSHEETS["two-pointers"];
console.log(JSON.stringify({
  sheet,
  counts: { cheatsheets: Object.keys(CHEATSHEETS).length, practiceModules: practiceModuleSlugs().length, modules: MODULES.length },
}, null, 2));
