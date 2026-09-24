/*
  Colours the lesson pages' code with the app's own highlighter, so a page and the
  app paint code from one palette (CLAUDE.md §4, "Code colour has one source").
  build.py runs it with tsx from web/, where the "@/" alias resolves:
    stdin  {"<source>": "python" | "typescript", ...}
    stdout {"<source>": "<inner html of Shiki's <code>>", ...}
  A source Shiki cannot colour is left out, and the page shows it as plain text.
*/
import { highlightCode } from "../src/lib/content/highlight";

async function main(): Promise<void> {
  let input = "";
  for await (const chunk of process.stdin) input += chunk;
  const jobs = JSON.parse(input) as Record<string, string>;
  const out: Record<string, string> = {};
  for (const [code, lang] of Object.entries(jobs)) {
    const html = await highlightCode(code, lang);
    const inner = html?.match(/<code>([\s\S]*)<\/code>/)?.[1];
    if (inner) out[code] = inner;
  }
  process.stdout.write(JSON.stringify(out));
}

void main();
