import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Reference solutions are DATA, not modules: the harness reads them as
    // source text and evaluates them, so nothing imports the functions they
    // declare. Linting them as modules yields one unused-var warning per
    // file — noise that trains people to ignore lint output.
    "tests/reference/**",
    // Copied by scripts/copy-pyodide.mjs into public/ (gitignored). Vendored
    // Emscripten output is not our source; linting it floods CI/local with
    // thousands of false positives and can fail on `module` assignment.
    "public/pyodide/**",
  ]),
  {
    rules: {
      // Mount/hydration sync (theme, localStorage, mermaid) is intentional here.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
