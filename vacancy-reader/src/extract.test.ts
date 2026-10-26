// Extraction step in a temporary runs folder (never the real runs/), with a fake model or none
// (never the real API, never a key from the developer's environment). Cases:
// - succeeded job with the stored careers-page.com example -> vacancy.md equals expected.md, model not used,
//   vacancy.json is a valid contract with fetched_at from the fetch's finishedAt
// - second extract of the same fetch -> the same bytes of vacancy.md and vacancy.json
// - site without a rule and no model -> no_rule, no vacancy.md or vacancy.json
// - site without a rule and a model -> succeeded, method llm, vacancy.md and vacancy.json with extracted_by: llm
// - site without a rule, model fails or answers invalid output -> failed, method llm, stale files removed
// - page without the description -> failed, error recorded, stale files removed, model not used
// - contract that fails validation (bad fetched_at), rule and llm -> failed with the contract error, no files left
// - succeeded job without finishedAt -> failed with a clear error, no files
// - job that is not succeeded -> refused, status unchanged
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { validateContract } from "./contract/index.ts";
import { extractJob } from "./extract.ts";
import type { VacancyModel } from "./fallback/index.ts";
import { getJob, jobDir, writeStatus } from "./fetch/jobs.ts";
import type { JobState, JobStatus } from "./fetch/jobs.ts";
import { formatDiff, lineDiff, readExamples } from "./rules/index.ts";

const runsDir = await mkdtemp(join(tmpdir(), "vacancy-reader-extract-"));
after(() => rm(runsDir, { recursive: true, force: true }));

async function makeJob(
  id: string,
  url: string,
  html: string,
  state: JobState = "succeeded",
  patch: Partial<JobStatus> = {},
): Promise<void> {
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
    ...patch,
  };
  await writeStatus(status, runsDir);
}

const vacancyPath = (id: string) => join(jobDir(id, runsDir), "vacancy.md");
const contractPath = (id: string) => join(jobDir(id, runsDir), "vacancy.json");

/** Writes stale vacancy.md and vacancy.json that a failed or no_rule extraction must remove. */
async function writeStale(id: string): Promise<void> {
  await writeFile(vacancyPath(id), "stale\n", "utf8");
  await writeFile(contractPath(id), "{}\n", "utf8");
}

function assertNoOutputs(id: string): void {
  assert.equal(existsSync(vacancyPath(id)), false, "vacancy.md is left");
  assert.equal(existsSync(contractPath(id)), false, "vacancy.json is left");
}

/** A fake model that returns the given output, or throws it when it is an Error; counts its calls. */
function fakeModel(output: unknown): VacancyModel & { calls: number } {
  const model = {
    calls: 0,
    async extract() {
      model.calls++;
      if (output instanceof Error) throw output;
      return output;
    },
  };
  return model;
}

test("succeeded job with a rule: vacancy.md equals expected.md", async () => {
  const example = (await readExamples()).find((e) => e.site === "careers-page.com");
  assert.ok(example, "careers-page.com example is missing");
  const html = await readFile(join(example.dir, "page.html"), "utf8");
  const expected = await readFile(join(example.dir, "expected.md"), "utf8");
  await makeJob("ok", example.url, html);

  const model = fakeModel({ description: "from the model" });
  const result = await extractJob("ok", runsDir, { model });
  assert.equal(model.calls, 0, "a site with a rule never uses the model");
  assert.equal(result.status, "succeeded");
  assert.equal(result.file, "vacancy.md");
  const actual = await readFile(vacancyPath("ok"), "utf8");
  if (actual !== expected) {
    assert.fail(`vacancy.md differs from expected.md (- expected, + actual):\n${formatDiff(lineDiff(expected, actual))}`);
  }
  const job = await getJob("ok", runsDir);
  assert.equal(job?.status, "succeeded");
  assert.equal(job?.extraction?.status, "succeeded");
  assert.equal(job?.extraction?.method, "rule");
  assert.equal(job?.extraction?.has_rule, true);

  const contract = validateContract(JSON.parse(await readFile(contractPath("ok"), "utf8")));
  assert.equal(contract.source_url, example.url);
  assert.equal(contract.site, "careers-page.com");
  assert.equal(contract.extracted_by, "rule");
  assert.equal(contract.fetched_at, "2026-10-24T10:00:02.000Z");
  assert.ok(contract.description.length > 0);
});

test("second extract of the same fetch writes the same bytes", async () => {
  const example = (await readExamples()).find((e) => e.site === "careers-page.com");
  assert.ok(example, "careers-page.com example is missing");
  await makeJob("again", example.url, await readFile(join(example.dir, "page.html"), "utf8"));
  await extractJob("again", runsDir, { model: null });
  const first = [await readFile(vacancyPath("again")), await readFile(contractPath("again"))];
  const second = await extractJob("again", runsDir, { model: null });
  assert.equal(second.status, "succeeded");
  assert.deepEqual([await readFile(vacancyPath("again")), await readFile(contractPath("again"))], first);
});

test("site without a rule and no model: no_rule and no vacancy.md", async () => {
  await makeJob("norule", "https://no-rule.example/job/1", "<html></html>");
  await writeStale("norule");
  const result = await extractJob("norule", runsDir, { model: null });
  assert.equal(result.status, "no_rule");
  assert.equal(result.site, "no-rule.example");
  assert.equal(result.error, "no rule for no-rule.example");
  assert.equal(result.method, null);
  assert.equal(result.has_rule, false);
  assertNoOutputs("norule");
  assert.equal((await getJob("norule", runsDir))?.status, "succeeded");
});

const NO_RULE_PAGE = "<html><body><main><h1>Data Engineer</h1><p>Build pipelines.</p></main></body></html>";

test("site without a rule and a model: succeeded with method llm", async () => {
  await makeJob("llm", "https://no-rule.example/job/2", NO_RULE_PAGE);
  const model = fakeModel({ title: "Data Engineer", description: "Build pipelines.", extra: "dropped" });
  const result = await extractJob("llm", runsDir, { model });
  assert.equal(model.calls, 1);
  assert.equal(result.status, "succeeded");
  assert.equal(result.site, "no-rule.example");
  assert.equal(result.rule, null);
  assert.equal(result.file, "vacancy.md");
  assert.equal(result.error, null);
  assert.equal(result.method, "llm");
  assert.equal(result.has_rule, false);
  assert.equal(
    await readFile(vacancyPath("llm"), "utf8"),
    [
      "---",
      "source_url: https://no-rule.example/job/2",
      "site: no-rule.example",
      "extracted_by: llm",
      "title: Data Engineer",
      "---",
      "",
      "## Job description",
      "",
      "Build pipelines.",
      "",
    ].join("\n"),
  );
  assert.equal(
    await readFile(contractPath("llm"), "utf8"),
    `${JSON.stringify(
      {
        schema_version: "1.0",
        source_url: "https://no-rule.example/job/2",
        site: "no-rule.example",
        extracted_by: "llm",
        fetched_at: "2026-10-24T10:00:02.000Z",
        title: "Data Engineer",
        company: null,
        hiring_manager: null,
        company_description: null,
        tags: null,
        description: "Build pipelines.",
      },
      null,
      2,
    )}\n`,
  );
  const job = await getJob("llm", runsDir);
  assert.equal(job?.status, "succeeded");
  assert.deepEqual(job?.extraction, result);
});

for (const [name, output, error] of [
  ["model error", new Error("API is down"), /API is down/],
  ["invalid model output", { title: "No description" }, /no description/],
] as const) {
  test(`site without a rule, ${name}: failed with method llm, stale vacancy.md removed`, async () => {
    const id = name.replaceAll(" ", "-");
    await makeJob(id, "https://no-rule.example/job/3", NO_RULE_PAGE);
    await writeStale(id);
    const result = await extractJob(id, runsDir, { model: fakeModel(output) });
    assert.equal(result.status, "failed");
    assert.match(result.error ?? "", error);
    assert.equal(result.rule, null);
    assert.equal(result.file, null);
    assert.equal(result.method, "llm");
    assert.equal(result.has_rule, false);
    assertNoOutputs(id);
    const job = await getJob(id, runsDir);
    assert.equal(job?.status, "succeeded");
    assert.equal(job?.extraction?.status, "failed");
  });
}

test("page without the description: failed, stale vacancy.md removed", async () => {
  await makeJob("bad", "https://www.careers-page.com/idelsoft/job/3W3V95WV", "<html><body>nothing</body></html>");
  await writeStale("bad");
  const model = fakeModel({ description: "from the model" });
  const result = await extractJob("bad", runsDir, { model });
  assert.equal(model.calls, 0, "a failing rule never falls back to the model");
  assert.equal(result.status, "failed");
  assert.match(result.error ?? "", /description/i);
  assertNoOutputs("bad");
  const job = await getJob("bad", runsDir);
  assert.equal(job?.status, "succeeded");
  assert.equal(job?.extraction?.status, "failed");
  assert.equal(job?.extraction?.method, "rule");
  assert.equal(job?.extraction?.has_rule, true);
});

for (const [method, url] of [
  ["rule", "https://www.careers-page.com/idelsoft/job/3W3V95WV"],
  ["llm", "https://no-rule.example/job/4"],
] as const) {
  test(`contract that fails validation (${method}): failed with the contract error, no files left`, async () => {
    const id = `invalid-${method}`;
    const example = (await readExamples()).find((e) => e.site === "careers-page.com");
    assert.ok(example, "careers-page.com example is missing");
    const html = method === "rule" ? await readFile(join(example.dir, "page.html"), "utf8") : NO_RULE_PAGE;
    await makeJob(id, url, html, "succeeded", { finishedAt: "yesterday" });
    await writeStale(id);
    const result = await extractJob(id, runsDir, { model: fakeModel({ description: "Build pipelines." }) });
    assert.equal(result.status, "failed");
    assert.equal(result.method, method);
    assert.equal(result.file, null);
    assert.match(result.error ?? "", /Vacancy contract is invalid[\s\S]*\/fetched_at: must match format "date-time"/);
    assertNoOutputs(id);
    assert.equal((await getJob(id, runsDir))?.extraction?.status, "failed");
  });
}

test("succeeded job without finishedAt: failed with a clear error, no files", async () => {
  await makeJob("nofinish", "https://no-rule.example/job/5", NO_RULE_PAGE, "succeeded", { finishedAt: null });
  const result = await extractJob("nofinish", runsDir, { model: fakeModel({ description: "Build pipelines." }) });
  assert.equal(result.status, "failed");
  assert.match(result.error ?? "", /has no finishedAt/);
  assertNoOutputs("nofinish");
});

test("job that is not succeeded is refused and left unchanged", async () => {
  await makeJob("http", "https://www.careers-page.com/idelsoft/job/3W3V95WV", "<html></html>", "http_error");
  await assert.rejects(extractJob("http", runsDir), /http_error/);
  const job = await getJob("http", runsDir);
  assert.equal(job?.status, "http_error");
  assert.equal(job?.extraction, undefined);
  assertNoOutputs("http");
});

test("unknown job is refused", async () => {
  await assert.rejects(extractJob("missing", runsDir), /Job not found/);
});
