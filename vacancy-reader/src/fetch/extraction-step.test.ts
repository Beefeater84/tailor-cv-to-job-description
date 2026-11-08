// Worker extraction step in a temporary runs folder (never the real runs/). Cases:
// - succeeded job, no model -> returns the final block, status.json has no running left
// - extractJob throws (job not succeeded) -> extraction written as failed with the error, fetch status unchanged
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { runExtractionStep } from "./extraction-step.ts";
import { getJob, jobDir, runningExtraction, writeStatus } from "./jobs.ts";
import type { JobState, JobStatus } from "./jobs.ts";

const runsDir = await mkdtemp(join(tmpdir(), "vacancy-reader-step-"));
after(() => rm(runsDir, { recursive: true, force: true }));

async function makeJob(id: string, state: JobState): Promise<void> {
  await mkdir(jobDir(id, runsDir));
  const status: JobStatus = {
    id,
    url: "https://no-rule.example/job/1",
    finalUrl: null,
    httpStatus: 200,
    status: state,
    error: null,
    createdAt: "2026-10-24T10:00:00.000Z",
    startedAt: "2026-10-24T10:00:01.000Z",
    finishedAt: "2026-10-24T10:00:02.000Z",
    pid: null,
    options: { waitFor: null, headed: false, timeoutMs: 60_000 },
    extraction: runningExtraction(),
  };
  await writeStatus(status, runsDir);
}

test("extractJob throws: extraction written as failed with the error, fetch status unchanged", async () => {
  await makeJob("throws", "http_error");
  const result = await runExtractionStep("throws", runsDir, { model: null });
  assert.equal(result.status, "failed");
  assert.match(result.error ?? "", /only succeeded jobs/);
  assert.ok(result.finishedAt);
  const job = await getJob("throws", runsDir);
  assert.equal(job?.status, "http_error");
  assert.deepEqual(job?.extraction, result);
});

test("succeeded job: the final block replaces running", async () => {
  await makeJob("ok", "succeeded");
  const result = await runExtractionStep("ok", runsDir, { model: null });
  assert.equal(result.status, "no_rule");
  assert.deepEqual((await getJob("ok", runsDir))?.extraction, result);
});
