/*
  Prints the course's lessons as JSON for ledger.py, straight from the app's manifest, so
  the ledger can never list a lesson the app does not have or miss one it does.
  Run from web/ (the "@/" alias): node_modules/.bin/tsx lesson-artifacts/manifest-dump.ts
*/
import { MODULES, moduleFamily } from "../src/lib/course/manifest";

const rows = MODULES.flatMap((m) =>
  m.lessons.map((l) => ({
    id: `${m.slug}/${l.slug}`,
    module: m.slug,
    moduleNumber: m.number,
    moduleStatus: m.status,
    type: l.type,
    title: l.title,
    family: moduleFamily(m),
  })),
);
process.stdout.write(JSON.stringify(rows));
