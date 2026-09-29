/*
  build.py runs this with tsx from web/, as it runs highlight.ts:
    argv   the path of a lesson.md
    stdout {"html": "<page body>", "data": {title, quiz, variants, reveals}, "rawBlocks": n}
  A dialect error exits non-zero with the reason, so the build stops on it.
*/
import { readFileSync } from "node:fs";
import { renderLesson } from "./lessonMd";

const path = process.argv[2];
if (!path) throw new Error("usage: render-lesson.ts <lesson.md>");
try {
  process.stdout.write(JSON.stringify(renderLesson(readFileSync(path, "utf8"))));
} catch (e) {
  process.stderr.write(`${path}: ${(e as Error).message}\n`);
  process.exit(1);
}
