/**
 * JavaScript sandbox runner.
 *
 * Runs in a Worker: no DOM, and terminable — which is the only reliable way
 * to stop a `while (true)`. The main thread arms a timer before posting and
 * terminates us on expiry.
 *
 * The evaluation loop itself lives in run-cases.js, shared verbatim with the
 * CI reference test. This file is only the worker envelope: receive, run,
 * post back. It never decides pass/fail — the main thread applies the
 * comparison rule, so that rule lives in exactly one place.
 */

importScripts("/sandbox/structures.js", "/sandbox/run-cases.js");

self.onmessage = (event) => {
  const req = event.data;
  const exportName = req.check === "sequence" ? req.cls : req.fnName;

  let target;
  try {
    target = self.SANDBOX_RUN.compile(req.source, exportName);
  } catch (err) {
    self.postMessage({ kind: "fatal", message: self.SANDBOX_RUN.describe(err) });
    return;
  }

  if (typeof target !== "function") {
    self.postMessage({
      kind: "fatal",
      message:
        req.check === "sequence"
          ? `No class named \`${exportName}\` was defined. Keep the given class name — the tests construct it directly.`
          : `No function named \`${exportName}\` was defined. Keep the given function name — the tests call it directly.`,
    });
    return;
  }

  self.postMessage({
    kind: "outcomes",
    outcomes: self.SANDBOX_RUN.runCases(target, req),
  });
};
