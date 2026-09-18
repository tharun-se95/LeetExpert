// Two browser contexts = two devices, against `npm run dev` on :3000 with
// AUTH_TEST_LOGIN=1 and DATABASE_URL pointing at a Neon DEVELOPMENT branch
// (never production). Run from web/: npm run e2e:sync
import { chromium } from "playwright-core";

const BASE = process.env.E2E_BASE ?? "http://localhost:3000";
const LESSON_PATH = "/courses/dsa/arrays";
const PROBLEM = "move-zeroes";
const email = `e2e-${Date.now()}@example.com`;

const browser = await chromium.launch({ channel: "chrome" });
const failures = [];
const check = (name, ok) => {
  console.log(`${ok ? "✓" : "✗"} ${name}`);
  if (!ok) failures.push(name);
};
const settle = (ms = 3500) => new Promise((r) => setTimeout(r, ms)); // > 2 s mark debounce
const storage = (page) => page.evaluate(() => ({ ...localStorage }));

async function device(signInAs) {
  const context = await browser.newContext();
  if (signInAs) {
    const res = await context.request.post(`${BASE}/api/test-login`, { data: { email: signInAs } });
    if (res.status() !== 204) throw new Error(`test-login ${res.status()}`);
  }
  return context;
}

async function firstLessonHref(page) {
  await page.goto(`${BASE}${LESSON_PATH}`);
  return page.locator('a[href^="/courses/dsa/arrays/"]').first().getAttribute("href");
}

try {
  // 1. A solves/visits; B sees it.
  const a = await device(email);
  const pa = await a.newPage();
  const lesson = await firstLessonHref(pa);
  await pa.goto(`${BASE}${lesson}`);
  await settle();
  const b = await device(email);
  const pb = await b.newPage();
  await pb.goto(`${BASE}/courses/dsa`);
  await settle(1500);
  const lessonId = lesson.replace("/courses/dsa/", "");
  check("a visit on A reaches B", JSON.parse((await storage(pb))["course-progress:dsa"] ?? "[]").includes(lessonId));

  // 2. Concurrent draft edits: the stash row appears and neither version is lost.
  await pa.goto(`${BASE}/courses/dsa/problems/${PROBLEM}`);
  await pb.goto(`${BASE}/courses/dsa/problems/${PROBLEM}`);
  await settle(2000);
  await pa.locator(".cm-content").first().click();
  await pa.keyboard.type("# from A\n");
  await settle(2500);
  await pb.locator(".cm-content").first().click();
  await pb.keyboard.type("# from B\n");
  await settle(2500);
  const row = pb.getByText("A different version of this draft was saved on another device.");
  check("B shows the stash row", await row.isVisible());
  check("B's editor still holds B's code", (await pb.locator(".cm-content").first().innerText()).includes("# from B"));
  await pb.getByRole("button", { name: "Compare" }).click();
  // The panes are a lazily loaded editor, so wait for A's code to arrive.
  const shownInCompare = await pb
    .getByRole("dialog")
    .locator(".cm-content")
    .filter({ hasText: "# from A" })
    .waitFor({ timeout: 10000 })
    .then(() => true, () => false);
  check("Compare shows A's code", shownInCompare);
  await pb.keyboard.press("Escape");

  // 3. Merge prompt on an existing account: Don't add.
  const c = await device(null);
  const pc = await c.newPage();
  await pc.goto(`${BASE}/courses/dsa/arrays`);
  await pc.goto(`${BASE}${await firstLessonHref(pc)}`);
  await c.request.post(`${BASE}/api/test-login`, { data: { email } });
  await pc.goto(`${BASE}/courses/dsa`);
  const prompt = pc.getByRole("dialog", { name: "Progress on this device" });
  await prompt.waitFor({ timeout: 10000 });
  check("existing account is asked before merging", await prompt.isVisible());
  await pc.getByRole("button", { name: "Don't add" }).click();
  await settle(1500);
  check("Don't add takes ownership", (await storage(pc))["sync:owner"] !== undefined);

  // 4. Offline edits arrive after reconnecting.
  await b.setOffline(true);
  await pb.locator(".cm-content").first().click();
  await pb.keyboard.type("# offline edit\n");
  await settle(2000);
  await b.setOffline(false);
  await pb.evaluate(() => window.dispatchEvent(new Event("online")));
  await settle(3000);
  await pa.reload();
  await settle(2500);
  check("an offline edit arrives after reconnect", (await pa.locator(".cm-content").first().innerText()).includes("# offline edit"));

  // 5. Sign out clears this device, and another open tab reloads signed out.
  const pa2 = await a.newPage();
  await pa2.goto(`${BASE}/courses/dsa`);
  await settle(2500); // the tab must have hydrated to be listening for the broadcast
  await pa.getByRole("button", { name: /^Account menu/ }).click();
  // Resolve to a boolean so a tab that never reloads is a failed check, not an
  // unhandled rejection that escapes once the browser closes.
  const otherTabReloaded = pa2.waitForEvent("load", { timeout: 10000 }).then(() => true, () => false);
  // "Sign out everywhere" also matches a substring, so the name must be exact.
  await pa.getByRole("menuitem", { name: "Sign out", exact: true }).click();
  check("the other tab reloads on sign-out", await otherTabReloaded);
  await settle(1500);
  // Both tabs share one origin's storage, so one read covers the device. The
  // reloaded problem page records its own visit as a signed-out learner would,
  // which is why visited is not required to be absent, only the earlier marks.
  const left = await storage(pa);
  const leftKeys = Object.keys(left).filter((k) => /^(course-solved|dsa:sandbox:|sync:|dsa-course-)/.test(k));
  check("sign-out leaves no synced keys, drafts or solved marks on the device", leftKeys.length === 0);
  check(
    "sign-out clears the marks from before it",
    !JSON.parse(left["course-progress:dsa"] ?? "[]").includes(lessonId),
  );
  check("the other tab shows the signed-out header", await pa2.getByRole("link", { name: "Sign in" }).first().isVisible());
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`${failures.length} check(s) failed`);
  process.exit(1);
}
