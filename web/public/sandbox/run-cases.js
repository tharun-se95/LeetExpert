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
   * Builds the learner's export with ListNode/TreeNode/Node already in scope,
   * so a tree or graph problem is solved the way it would be in an interview
   * rather than by first re-declaring the node class.
   */
  function compile(source, exportName) {
    const factory = new Function(
      "ListNode",
      "TreeNode",
      "Node",
      `${source}\n;return typeof ${exportName} !== "undefined" ? ${exportName} : null;`,
    );
    return factory(S.ListNode, S.TreeNode, S.Node);
  }

  /**
   * Per-case log ceiling. A `print` inside the main loop is the most ordinary
   * debugging move there is, and problems here state inputs up to n = 1e4 —
   * so without a cap one such line accumulates tens of thousands of strings
   * per case in the worker, long before the UI ever gets a say. Capped here,
   * at the source, rather than trimmed at render time: the memory cost is
   * paid in this array, not in the DOM.
   */
  const LOG_CAP = 500;

  function captureLogs(counter, logs, run) {
    const native = console.log;
    console.log = (...parts) => {
      if (logs.length >= LOG_CAP) {
        counter.dropped += 1;
        return;
      }
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
      const logCount = { dropped: 0 };
      let ret = null;
      let argAfter = null;
      let opResults;
      let aliased = null;
      let error = null;

      try {
        if (check === "roundtrip") {
          // Serialize/Deserialize: the intermediate string is the learner's
          // own design, so asserting on it would mandate one encoding. The
          // only honest claim is that the pair is each other's inverse.
          const raw = JSON.parse(JSON.stringify(testCase.args));
          const input = S.decodeArg(raw[0], (shape && shape[0]) || "value");
          ret = captureLogs(logCount, logs, () => {
            const instance = new target();
            const [encode, decode] = req.roundtrip;
            if (typeof instance[encode] !== "function") {
              throw new Error(`No method \`${encode}\` on the class`);
            }
            if (typeof instance[decode] !== "function") {
              throw new Error(`No method \`${decode}\` on the class`);
            }
            return jsonSafe(
              S.encodeResult(instance[decode](instance[encode](input)), returns),
            );
          });
        } else if (isSequence) {
          const instance = captureLogs(logCount, logs, () => {
            const ctorArgs = JSON.parse(JSON.stringify(testCase.construct ?? []));
            return new target(...ctorArgs);
          });
          opResults = [];
          captureLogs(logCount, logs, () => {
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
          const result = captureLogs(logCount, logs, () => target(...built));
          ret = jsonSafe(S.encodeResult(result, returns || "value"));
          // "Return a deep copy" problems: a returned original serialises
          // exactly like a correct clone, so equality alone cannot separate
          // them. Report the raw observation and let the main thread judge.
          if (returns === "graph") aliased = S.sharesNodes(result, built[0]);
          argAfter = jsonSafe(
            S.encodeResult(built[arg], (shape && shape[arg]) || "value"),
          );
        }
      } catch (err) {
        error = describe(err);
      }

      outcomes.push({
        index: i, ret, argAfter, logs, logsDropped: logCount.dropped,
        error, opResults, aliased,
      });
    }

    return outcomes;
  }

  root.SANDBOX_RUN = { compile, runCases, describe, jsonSafe };
})(typeof self !== "undefined" ? self : globalThis);
