// Builds for production and proves /api/test-login is a 404 there, even with
// the flag set. Run from web/: npm run e2e:test-login-prod
//
// The handler also answers 404 when auth is not configured, so a build with no
// auth variables would pass this check whatever NODE_ENV did. Placeholder
// values for all seven make the configuration gate open: the only thing left
// between the request and a session is the production check. They are never
// used to reach anything (the database host does not exist).
import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const AUTH_ENV = {
  DATABASE_URL: "postgres://placeholder:placeholder@db.invalid/placeholder",
  BETTER_AUTH_SECRET: "placeholder-secret-placeholder-secret",
  BETTER_AUTH_URL: "http://localhost:3100",
  GITHUB_CLIENT_ID: "placeholder",
  GITHUB_CLIENT_SECRET: "placeholder",
  GOOGLE_CLIENT_ID: "placeholder",
  GOOGLE_CLIENT_SECRET: "placeholder",
  AUTH_TEST_LOGIN: "1",
};
const env = { ...process.env, ...AUTH_ENV };

const build = spawnSync("npm", ["run", "build"], { stdio: "inherit", env });
if (build.status !== 0) process.exit(build.status ?? 1);

// Not `npx next`: killing npx would leave next itself holding the port.
const nextBin = createRequire(import.meta.url).resolve("next/dist/bin/next");
const server = spawn(process.execPath, [nextBin, "start", "-p", "3100"], { env, stdio: "inherit" });
try {
  let res = null;
  for (let i = 0; i < 60 && !res; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    res = await fetch("http://localhost:3100/api/test-login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "prod-check@example.com" }),
    }).catch(() => null);
  }
  if (!res) throw new Error("server never answered");
  if (res.status !== 404) throw new Error(`expected 404 in production, got ${res.status}`);
  console.log("test-login is 404 in a production build ✓");
} finally {
  server.kill();
}
