# Context: #37 Extraction status: show pending and never leave it missing

Module root: `vacancy-reader/`. No tests exist for `jobs.ts`, the worker or `cli.ts`; only `src/extract.test.ts` goes through `getJob`/`writeStatus`.

## Code map

- `src/fetch/jobs.ts` — `JobState` (fetch states; `crashed` is never stored, only computed at read time).
- `src/fetch/jobs.ts:33-47` — `interface ExtractionResult { status: "succeeded"|"no_rule"|"failed"; site; rule; file; error; method; has_rule; finishedAt: string }`. No in-progress value, `finishedAt` required.
- `src/fetch/jobs.ts:49-63` — `interface JobStatus { ...; pid: number|null; options; extraction?: ExtractionResult }` ("absent until the step has run").
- `src/fetch/jobs.ts:132-151` — `writeStatus(status, runsDir = RUNS_DIR)`: atomic write (temp file + rename, Windows EPERM/EACCES/EBUSY retry). Writes the whole object, no merge; callers spread the old status.
- `src/fetch/jobs.ts:154-163` — `readStatus(id, runsDir)`: raw read, null on ENOENT.
- `src/fetch/jobs.ts:165-172` — `isPidAlive(pid)` via `process.kill(pid, 0)`, EPERM = alive. Not exported.
- `src/fetch/jobs.ts:175-182` — `withCrashCheck(status, now)`: only for stored `queued`/`running`; dead pid, or no pid and older than `QUEUED_GRACE_MS` → `{...status, status: "crashed"}`. Never looks at `extraction`. Not exported.
- `src/fetch/jobs.ts:185-189` — `getJob(id, runsDir)`: validates the id, readStatus + withCrashCheck. Used by `status`, `extractJob`, `listJobs`.
- `src/fetch/jobs.ts` — `createJob` writes the initial queued status without `extraction`.
- `src/extract.ts:38-141` — `extractJob(id, runsDir = RUNS_DIR, options: ExtractOptions = {}): Promise<ExtractionResult>`. Throws before writing when the job is missing (`Job not found: <id>`) or not succeeded. Inside, all errors are caught and become `failed` (`error instanceof Error ? error.message : String(error)`). Last line: `await writeStatus({ ...job, extraction: result }, runsDir)` with `job` read at the start. Can still throw: the not-found/not-succeeded checks, `removeStale` inside the catch, the final `writeStatus`. `finish(partial)` adds `finishedAt`. `ExtractOptions.model`: undefined = real model, null = no fallback; tests pass a fake.
- `src/fetch/worker.ts:20-73` — `run(id)`: detached worker, stdout/stderr → `runs/<id>/worker.log`. Writes `running` with `pid: process.pid`, then the final fetch status, then on `succeeded` calls `extractJob` in a try/catch that only logs `extraction error: ...`. Local `errorMessage(error)` strips VT codes. The top-level `run(id).catch` writes `failed` as last resort. Runs on import (reads `process.argv[2]`, exits 2 if missing), so it cannot be imported in tests as is.
- `src/fetch/start.ts` — `startFetchJob` spawns `node --import tsx worker.ts <id>` detached.
- `src/cli.ts:94-106` — `status`: `getJob` and prints JSON; exit 1 if not found. `:127-149` — `extract`: maps no_rule/failed to exit 1; throws go to the `main()` handler (stderr, exit 1), nothing written to status.json. Runs `main` on import.
- `src/rules/types.ts:2` — `ExtractionMethod = "rule" | "llm"`.
- `src/extract.test.ts` — the extraction tests (succeeded/rule, idempotent bytes, no_rule, llm success and failures, failing rule, invalid contract, missing finishedAt, not-succeeded refused with `extraction` undefined, unknown job).

Docs: `vacancy-reader/README.md` lines 23-28 (who runs extraction), 86-88 (`npm run status`, crashed), 113-134 (`npm run extract`), 156-166 (job statuses table), 183-209 (status.json fields; 196 "Absent until the step has run", 202 extraction status values, 209 `finishedAt`; line 210 `## Examples (evals)` lacks a blank line before it). `CLAUDE.md` line 22 (vacancy-URL flow: "wait for it if it is not there yet"). `contract/README.md:45` mentions extraction statuses. `specs/decisions/12-llm-fallback-extraction.md:47-48` is an accepted ADR: do not edit.

## Patterns

- Tests: `node:test` via `tsx --test "src/**/*.test.ts"`, `node:assert/strict`, next to the source (`src/<name>.test.ts` or `src/<dir>/<dir>.test.ts`). Copy `src/extract.test.ts`: header comment listing cases `// - case -> outcome`; temp runs dir via `mkdtemp(join(tmpdir(), "vacancy-reader-…-"))` + `after(() => rm(..., { recursive: true, force: true }))`; never the real `runs/`, never the real API (`{ model: null }` or a fake model); test names `"<situation>: <outcome>"`.
- Worker logic to test must live in an exported, importable function (worker.ts runs on import).

## Conventions

- Imports with explicit `.ts` extensions; `import type` for types (`verbatimModuleSyntax`). `strict`, `noUncheckedIndexedAccess`.
- ESLint: `@eslint/js` + typescript-eslint recommended; ignores runs/ and examples/.
- Timestamps: ISO strings from `new Date().toISOString()`. Fetch fields camelCase (`createdAt`, `startedAt`, `finishedAt`); the extraction block also has snake_case `has_rule`.
- Every status write spreads the full previous object. Race: `extractJob` writes from the job it read at the start.
- "Extraction never changes the fetch `status`": tests assert `job.status === "succeeded"` after every extraction.
- `crashed` is computed at read time, never stored (docs: "stored values never include `crashed`").
- worker.log lines: `[<iso>] <message>`. Last-resort writes use `.catch(() => {})`. Missing files: `code === "ENOENT"`.
- CLI exit codes: 0 ok, 1 failure or not found, 2 usage; errors to stderr.
- Docs: plain short sentences, fields in tables. Everything in English.
