// Extraction step in a temporary runs folder (never the real runs/). Cases:
// - succeeded job with the stored careers-page.com example -> vacancy.md equals expected.md
// - site without a rule -> no_rule, no vacancy.md
// - page without the description -> failed, error recorded, stale vacancy.md removed
// - job that is not succeeded -> refused, status unchanged
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { extractJob } from "./extract.ts";
import { getJob, jobDir, writeStatus } from "./fetch/jobs.ts";
import type { JobState, JobStatus } from "./fetch/jobs.ts";
import { formatDiff, lineDiff, readExamples } from "./rules/index.ts";

const runsDir = await mkdtemp(join(tmpdir(), "vacancy-reader-extract-"));
after(() => rm(runsDir, { recursive: true, force: true }));

async function makeJob(id: string, url: string, html: string, state: JobState = "succeeded"): Promise<void> {
  await mkdir(jobDir(id, runsDir));
  await writeFile(join(jobDir(id, runsDir), "page.html"), html, "utf8");
  const status: JobStatus = {
    id,
    url,
    finalUrl: url,
    httpStatus: 200,
    status: state,
    error: null,
    createdAt: "2026-10-24T10:00:00.000Z",
    startedAt: "2026-10-24T10:00:01.000Z",
    finishedAt: "2026-10-24T10:00:02.000Z",
    pid: null,
    options: { waitFor: null, headed: false, timeoutMs: 60_000 },
  };
  await writeStatus(status, runsDir);
}

const vacancyPath = (id: string) => join(jobDir(id, runsDir), "vacancy.md");

test("succeeded job with a rule: vacancy.md equals expected.md", async () => {
  const example = (await readExamples()).find((e) => e.site === "careers-page.com");
  assert.ok(example, "careers-page.com example is missing");
  const html = await readFile(join(example.dir, "page.html"), "utf8");
  const expected = await readFile(join(example.dir, "expected.md"), "utf8");
  await makeJob("ok", example.url, html);

  const result = await extractJob("ok", runsDir);
  assert.equal(result.status, "succeeded");
  assert.equal(result.file, "vacancy.md");
  const actual = await readFile(vacancyPath("ok"), "utf8");
  if (actual !== expected) {
    assert.fail(`vacancy.md differs from expected.md (- expected, + actual):\n${formatDiff(lineDiff(expected, actual))}`);
  }
  const job = await getJob("ok", runsDir);
  assert.equal(job?.status, "succeeded");
  assert.equal(job?.extraction?.status, "succeeded");
});

test("site without a rule: no_rule and no vacancy.md", async () => {
  await makeJob("norule", "https://no-rule.example/job/1", "<html></html>");
  const result = await extractJob("norule", runsDir);
  assert.equal(result.status, "no_rule");
  assert.equal(result.site, "no-rule.example");
  assert.equal(result.error, "no rule for no-rule.example");
  assert.equal(existsSync(vacancyPath("norule")), false);
  assert.equal((await getJob("norule", runsDir))?.status, "succeeded");
});

test("page without the description: failed, stale vacancy.md removed", async () => {
  await makeJob("bad", "https://www.careers-page.com/idelsoft/job/3W3V95WV", "<html><body>nothing</body></html>");
  await writeFile(vacancyPath("bad"), "stale\n", "utf8");
  const result = await extractJob("bad", runsDir);
  assert.equal(result.status, "failed");
  assert.match(result.error ?? "", /description/i);
  assert.equal(existsSync(vacancyPath("bad")), false);
  const job = await getJob("bad", runsDir);
  assert.equal(job?.status, "succeeded");
  assert.equal(job?.extraction?.status, "failed");
});

test("job that is not succeeded is refused and left unchanged", async () => {
  await makeJob("http", "https://www.careers-page.com/idelsoft/job/3W3V95WV", "<html></html>", "http_error");
  await assert.rejects(extractJob("http", runsDir), /http_error/);
  const job = await getJob("http", runsDir);
  assert.equal(job?.status, "http_error");
  assert.equal(job?.extraction, undefined);
  assert.equal(existsSync(vacancyPath("http")), false);
});

test("unknown job is refused", async () => {
  await assert.rejects(extractJob("missing", runsDir), /Job not found/);
});
