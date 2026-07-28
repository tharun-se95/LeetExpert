/**
 * The JavaScript evaluation loop — shared by the browser worker and CI.
 *
 * This file exists to prevent a specific class of bug. The rule is that a
 * case's expected value must be proved by executing a reference solution;
 * but if CI ran its own copy of this loop, CI would be proving the copy, not
 * the thing learners actually run. So `js-runner.js` pulls this in with
 * importScripts and the reference test imports the same file with a `self`
 * shim — one implementation, exercised from both sides.
 *
 * Same rule holds for Python: the reference test extracts the DRIVER string
 * out of `py-runner.js` and executes that, rather than reimplementing it.
 *
 * Deliberately dependency-free and framework-free so both hosts can load it.
 */

(function attach(root) {
  const S = root.SANDBOX_STRUCTURES;

  function jsonSafe(value) {
    try {
      return JSON.parse(JSON.stringify(value === undefined ? null : value));
    } catch {
      return String(value);
    }
  }

  function describe(err) {
    const name = err && err.name ? err.name : "Error";
    const msg = err && err.message ? err.message : String(err);
    return `${name}: ${msg}`;
  }

  /**
   * Builds the learner's export with ListNode/TreeNode already in scope, so a
   * tree problem is solved the way it would be in an interview rather than by
   * first re-declaring the node class.
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
        parts
          .map((p) => (typeof p === "string" ? p : JSON.stringify(jsonSafe(p))))
          .join(" "),
      );
    };
    try {
      return run();
    } finally {
      console.log = native;
    }
  }

  /** Runs every case against an already-compiled target. */
  function runCases(target, req) {
    const { cases, arg, check, shape, returns } = req;
    const isSequence = check === "sequence";
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
          const instance = captureLogs(logs, () => {
            const ctorArgs = JSON.parse(JSON.stringify(testCase.construct ?? []));
            return new target(...ctorArgs);
          });
          opResults = [];
          captureLogs(logs, () => {
            for (const [method, opArgs] of testCase.ops ?? []) {
              if (typeof instance[method] !== "function") {
                throw new Error(`No method \`${method}\` on the class`);
              }
              const cloned = JSON.parse(JSON.stringify(opArgs ?? []));
              opResults.push(jsonSafe(instance[method](...cloned)));
            }
          });
        } else {
          // Fresh copies per case, so one case's mutation cannot leak into
          // the next, then decode each argument into its declared structure.
          const raw = JSON.parse(JSON.stringify(testCase.args));
          const built = raw.map((v, idx) =>
            S.decodeArg(v, (shape && shape[idx]) || "value"),
          );
          S.resolveNodeArgs(built, raw, shape);
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

    return outcomes;
  }

  root.SANDBOX_RUN = { compile, runCases, describe, jsonSafe };
})(typeof self !== "undefined" ? self : globalThis);
