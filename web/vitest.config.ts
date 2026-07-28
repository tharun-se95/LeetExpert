import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Exists so tests can import application modules by their `@/` alias — in
 * particular `parseSpec`, which the content tests run over every authored
 * sandbox fence. Without that, the fence validator in the tests and the
 * parser the browser actually uses are two implementations free to drift,
 * and a spec can pass CI while rendering an error card in production.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
