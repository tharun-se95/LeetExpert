/**
 * JavaScript sandbox runner.
 *
 * Runs in a Worker: no DOM, and terminable — which is the only reliable way
 * to stop a `while (true)`. The main thread arms a timer before posting and
 * terminates us on expiry.
 *
 * This file never decides pass/fail. It reports raw outcomes and lets the
 * main thread apply the comparison rule, so that rule lives in one place
 * rather than being reimplemented here and again in Python.
 */

importScripts("/sandbox/structures.js");
const S = self.SANDBOX_STRUCTURES;

/** Strip anything structuredClone can't carry (functions, symbols, cycles). */
function jsonSafe(value) {
  try {
    return JSON.parse(JSON.stringify(value === undefined ? null : value));
  } catch {
    return String(value);
  }
}

function describe(err) {
  return `${err && err.name ? err.name : "Error"}: ${err && err.message ? err.message : String(err)}`;
}

/**
 * Evaluates the learner's source with ListNode/TreeNode already in scope, so
 * a tree problem can be solved the way it would be in an interview rather
 * than by first re-declaring the node class.
 */
function compile(source, exportName) {
  const factory = new Function(
    "ListNode",
    "TreeNode",
    `${source}\n;return typeof ${exportName} !== "undefined" ? ${exportName} : null;`,
  );
  return factory(S.ListNode, S.TreeNode);
}

function captureLogs(logs, run) {
  const native = console.log;
  console.log = (...parts) => {
    logs.push(
      parts.map((p) => (typeof p === "string" ? p : JSON.stringify(jsonSafe(p)))).join(" "),
    );
  };
  try {
    return run();
  } finally {
    console.log = native;
  }
}

self.onmessage = (event) => {
  const { source, fnName, cases, arg, check, shape, returns, cls } = event.data;
  const isSequence = check === "sequence";
  const exportName = isSequence ? cls : fnName;

  let target;
  try {
    target = compile(source, exportName);
  } catch (err) {
    self.postMessage({ kind: "fatal", message: describe(err) });
    return;
  }

  if (typeof target !== "function") {
    self.postMessage({
      kind: "fatal",
      message: isSequence
        ? `No class named \`${exportName}\` was defined. Keep the given class name — the tests construct it directly.`
        : `No function named \`${exportName}\` was defined. Keep the given function name — the tests call it directly.`,
    });
    return;
  }

  const outcomes = [];

  for (let i = 0; i < cases.length; i++) {
    const testCase = cases[i];
    const logs = [];
    let ret = null;
    let argAfter = null;
    let opResults;
    let error = null;

    try {
      if (isSequence) {
        // A class problem is a script: construct, then call in order,
        // recording every return so a failure can name the operation.
        const instance = captureLogs(logs, () => {
          const ctorArgs = JSON.parse(JSON.stringify(testCase.construct ?? []));
          return new target(...ctorArgs);
        });
        opResults = [];
        captureLogs(logs, () => {
          for (const [method, opArgs] of testCase.ops ?? []) {
            if (typeof instance[method] !== "function") {
              throw new Error(`No method \`${method}\` on ${exportName}`);
            }
            const cloned = JSON.parse(JSON.stringify(opArgs ?? []));
            opResults.push(jsonSafe(instance[method](...cloned)));
          }
        });
      } else {
        // Fresh copies per case, so one case's mutation can't leak into the
        // next, then decode each argument into whatever structure it declares.
        const raw = JSON.parse(JSON.stringify(testCase.args));
        const built = raw.map((v, idx) => S.decodeArg(v, (shape && shape[idx]) || "value"));

        const result = captureLogs(logs, () => target(...built));
        ret = jsonSafe(S.encodeResult(result, returns || "value"));
        argAfter = jsonSafe(
          S.encodeResult(built[arg], (shape && shape[arg]) || "value"),
        );
      }
    } catch (err) {
      error = describe(err);
    }

    outcomes.push({ index: i, ret, argAfter, logs, error, opResults });
  }

  self.postMessage({ kind: "outcomes", outcomes });
};
