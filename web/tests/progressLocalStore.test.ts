// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  anonymousSummary, clearSyncedData, draftAtKey, draftKey, listLocalDrafts,
  readLocalDraft, readOwner, readSyncRecord, removeLocalDraft, writeLocalDraft,
  writeOwner, writeSyncRecord, emptySyncRecord,
} from "../src/lib/progress/localStore";
import { migrateLegacyProgress, readSet, visitedKey } from "../src/components/providers/progressStorage";

const known = (id: string) => id !== "landing-find-pair";

beforeEach(() => localStorage.clear());

describe("drafts", () => {
  it("keeps the existing key format and stores a sibling timestamp", () => {
    expect(draftKey("two-sum", "python")).toBe("dsa:sandbox:two-sum:python");
    writeLocalDraft(localStorage, "two-sum", "python", "code", "2026-09-18T10:00:00.000Z");
    expect(localStorage.getItem(draftAtKey("two-sum", "python"))).toBe("2026-09-18T10:00:00.000Z");
    expect(readLocalDraft(localStorage, "two-sum", "python")).toEqual({
      code: "code", updatedAt: "2026-09-18T10:00:00.000Z", deleted: false,
    });
  });

  it("a legacy draft (no timestamp) reads with updatedAt null", () => {
    localStorage.setItem("dsa:sandbox:two-sum:javascript", "old");
    expect(readLocalDraft(localStorage, "two-sum", "javascript")).toEqual({ code: "old", updatedAt: null, deleted: false });
  });

  it("remove clears both keys", () => {
    writeLocalDraft(localStorage, "two-sum", "python", "c", "2026-09-18T10:00:00.000Z");
    removeLocalDraft(localStorage, "two-sum", "python");
    expect(localStorage.length).toBe(0);
  });

  it("lists only registry sandboxes, ignoring timestamp keys", () => {
    writeLocalDraft(localStorage, "two-sum", "python", "a", "2026-09-18T10:00:00.000Z");
    localStorage.setItem("dsa:sandbox:landing-find-pair:python", "x");
    expect(listLocalDrafts(localStorage, known).map((d) => `${d.sandboxId}:${d.lang}`)).toEqual(["two-sum:python"]);
  });
});

describe("summary", () => {
  it("counts this device's anonymous progress", () => {
    localStorage.setItem("course-progress:dsa", JSON.stringify(["a/b", "a/c"]));
    localStorage.setItem("course-solved:dsa", JSON.stringify(["a/c"]));
    localStorage.setItem("dsa:sandbox:two-sum:python", "x");
    expect(anonymousSummary(localStorage, "dsa", known)).toEqual({ visited: 2, solved: 1, drafts: 1 });
  });
});

describe("clearSyncedData (spec §5.4)", () => {
  it("clears progress, drafts, legacy keys and sync state; keeps preferences", () => {
    const keep = { "dsa:ide:results-tab": "tests", "code-lang": "python", theme: "dark" };
    for (const [k, v] of Object.entries(keep)) localStorage.setItem(k, v);
    localStorage.setItem("course-progress:dsa", "[]");
    localStorage.setItem("course-solved:dsa", "[]");
    localStorage.setItem("dsa-course-progress", JSON.stringify(["arrays/intro"]));
    localStorage.setItem("dsa-course-solved", "[]");
    writeLocalDraft(localStorage, "two-sum", "python", "c", "2026-09-18T10:00:00.000Z");
    writeOwner(localStorage, "u1");
    writeSyncRecord(localStorage, "u1", emptySyncRecord());

    clearSyncedData(localStorage);

    expect(Object.keys({ ...localStorage }).sort()).toEqual(Object.keys(keep).sort());
    expect(readOwner(localStorage)).toBeNull();
  });

  it("after clearing, the legacy migration cannot revive the last learner's progress", () => {
    localStorage.setItem("dsa-course-progress", JSON.stringify(["arrays/intro"]));
    migrateLegacyProgress("dsa");
    clearSyncedData(localStorage);
    migrateLegacyProgress("dsa");
    expect(readSet(visitedKey("dsa")).size).toBe(0);
  });
});

describe("sync record", () => {
  it("is per user and survives a corrupt value", () => {
    const record = { ...emptySyncRecord(), baseRevs: { "two-sum:python": 3 } };
    writeSyncRecord(localStorage, "u1", record);
    expect(readSyncRecord(localStorage, "u1")).toEqual(record);
    expect(readSyncRecord(localStorage, "u2")).toEqual(emptySyncRecord());
    localStorage.setItem("sync:v1:u3", "{not json");
    expect(readSyncRecord(localStorage, "u3")).toEqual(emptySyncRecord());
  });

  it("falls back to the empty record when a field's shape is wrong, but loads a valid partial record", () => {
    localStorage.setItem("sync:v1:u4", JSON.stringify({ marks: "oops" }));
    expect(readSyncRecord(localStorage, "u4")).toEqual(emptySyncRecord());

    localStorage.setItem("sync:v1:u5", JSON.stringify({ baseRevs: { "a:python": "3" } }));
    expect(readSyncRecord(localStorage, "u5")).toEqual(emptySyncRecord());

    localStorage.setItem("sync:v1:u6", JSON.stringify({ baseRevs: { "a:python": 3 } }));
    expect(readSyncRecord(localStorage, "u6")).toEqual({ ...emptySyncRecord(), baseRevs: { "a:python": 3 } });
  });
});
