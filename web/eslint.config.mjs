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
    // Lesson artifacts (#23): the tooling (gates, renderers, app integration) is linted like any
    // source. Excluded: the build output; the code shown to learners, which is data like
    // tests/reference and is executed in both runtimes by the code gate; and the page fragments
    // (kit/*.js, <lesson>/lesson.js), which share one scope once build.py joins them, so per-file
    // lint can only misread them. tests/lessonArtifactsScript.test.ts lints each page's joined
    // script instead.
    "lesson-artifacts/dist/**",
    "lesson-artifacts/*/code/**",
    "lesson-artifacts/kit/*.js",
    "lesson-artifacts/*/lesson.js",
    // Copied by scripts/copy-pyodide.mjs into public/ (gitignored). Vendored
    // Emscripten output is not our source; linting it floods CI/local with
    // thousands of false positives and can fail on `module` assignment.
    "public/pyodide/**",
    // Built by scripts/build-overviews.mjs (gitignored): generated pages and
    // the vendored motion.js, not our source.
    "public/artifacts/**",
  ]),
  {
    rules: {
      // Mount/hydration sync (theme, localStorage, mermaid) is intentional here.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
