// Runs the rule of each example's site on its stored page.html and compares the result with expected.md.
// An example whose site has no rule yet is reported as todo, not as a failure.
import assert from "node:assert/strict";
import { test } from "node:test";
import { readExamples, runExample } from "./examples.ts";
import { formatDiff } from "./normalize.ts";

for (const example of await readExamples()) {
  test(`${example.site}: ${example.path}`, async (t) => {
    const result = await runExample(example);
    if (result.status === "todo") {
      t.todo(result.message);
      return;
    }
    if (result.status === "error") assert.fail(result.message);
    if (result.status === "fail") {
      assert.fail(`output differs from expected.md (- expected, + actual):\n${formatDiff(result.diff)}`);
    }
  });
}
