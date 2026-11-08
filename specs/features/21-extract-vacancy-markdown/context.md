# Context: #21 Extract a fetched vacancy to Markdown with its site rule

All paths under `vacancy-reader/` unless they start with `specs/` or are `CLAUDE.md`.

## Code map

- `src/cli.ts` — `main(argv): Promise<number>` — the only CLI entry; `parseArgs` (allowPositionals; `wait-for`, `headed`, `timeout`, `help`) and `switch(command)` over `fetch | status | jobs | match | rules:check`; each case returns an exit code; `main().then(code => process.exitCode = code, err => { console.error(msg); exitCode = 1 })`. `USAGE` const lists commands. `checkRules(site): Promise<number>` top-level helper — model for a multi-outcome command. `status` prints `JSON.stringify(job, null, 2)` → new status fields show up automatically. `match`: no rule → `noRuleMessage(site)` to stderr, exit 1.
- `src/fetch/jobs.ts` — `MODULE_ROOT`, `RUNS_DIR = MODULE_ROOT/runs`; `type JobState = "queued"|"running"|"succeeded"|"http_error"|"timeout"|"failed"|"crashed"` (`crashed` computed on read, never stored); `interface FetchOptions { waitFor: string|null; headed: boolean; timeoutMs: number }`; `interface JobStatus { id, url, finalUrl: string|null, httpStatus: number|null, status: JobState, error: string|null, createdAt, startedAt: string|null, finishedAt: string|null, pid: number|null, options: FetchOptions }` = `status.json`; `jobDir(id)` → `runs/<id>`; private `statusPath(id)`; `parseHttpUrl(value): URL`; `makeJobId` → `YYYYMMDD-HHMMSS-<site>-<4hex>`; `createJob(url, options)`; `writeStatus(status)` atomic (temp + rename, Windows EPERM/EACCES/EBUSY retry) — the only way to write status; `readStatus(id)` → stored status or null on ENOENT; private `withCrashCheck`; `getJob(id)` validates id `/^[\w.-]+$/` (path traversal guard) → null on mismatch; `listJobs()` newest first. `RUNS_DIR` is a fixed constant, not injectable yet.
- `src/fetch/start.ts` — `startFetchJob(rawUrl, options): Promise<JobStatus>` — creates the job, spawns detached `node --import tsx src/fetch/worker.ts <id>` (cwd `MODULE_ROOT`), returns while queued. The `fetch` CLI never sees the job finish → the automatic step must live in the worker.
- `src/fetch/worker.ts` — `run(id)`: status `running` (pid, startedAt) → `fetchPage` → `saveHtml(id, html)` writes `runs/<id>/page.html` → final status `succeeded` | `http_error` (≥400, error `HTTP nnn`) | `timeout` (partial html saved) | `failed` → `finishedAt`, `writeStatus`, log `[ts] status: error` to `worker.log` via console.log. Top-level `.catch` writes `failed` as last resort — an extraction error must not reach it. Private `errorMessage(error)` strips VT colour codes.
- `src/site.ts` — `siteKey(url: URL): string` — host without `www.`, lower case.
- `src/match.ts` — `matchUrl(value: string): Promise<UrlMatch { url, site, rulePath: string|null }>` — throws on invalid URL; only stats the rule file.
- `src/rules/load.ts` — `RULES_DIR`, `SITE_KEY_PATTERN`, `rulePath(site)`, `noRuleMessage(site)` → `"no rule for <site>"` (canonical text), `loadRule(site): Promise<SiteRule|null>` (null: no file / bad key; throws plain `Error` if default export is not a rule).
- `src/rules/extract.ts` — `class ExtractionError extends Error`; `extractFields(rule, html, sourceUrl)` throws `ExtractionError`: `Invalid selector "<sel>": <msg>`, `No description text found by "<rule.description>"`, `postprocess returned no description`. Throws inside `postprocess` are not wrapped.
- `src/rules/examples.ts` — `extractDocument(rule: SiteRule, html: string, sourceUrl: string): string` — final normalised Markdown (LF, no trailing whitespace, one final newline), write as is; `site` from `siteKey(new URL(sourceUrl))`; throws `ExtractionError`, `TypeError` on bad URL. Also `readExamples()`, `listExamples(site)`, `runExample(example)` (`todo|pass|fail|error`), `EXAMPLES_DIR`, `EXAMPLES_INDEX`.
- `src/rules/normalize.ts` — `normalizeDocument(text)`, `lineDiff(expected, actual)`, `formatDiff(diff, context = 2)`.
- `src/rules/render.ts` — `renderDocument(fields, { sourceUrl, site })`.
- `src/rules/index.ts` — barrel; `cli.ts` imports rules only from here. New rule exports go here too.
- `rules/careers-page.com.ts` — the only rule; `postprocess` takes the company from `<title>` only when the URL slug confirms it → `sourceUrl` affects output.
- `examples/index.yaml` — one example: `careers-page.com/idelsoft-senior-frontend-performance-engineer/` (`page.html`, `expected.md`), url `https://www.careers-page.com/idelsoft/job/3W3V95WV`.
- `package.json` — scripts `fetch|status|jobs|match|rules:check` = `tsx src/cli.ts <cmd>`; `test` = `tsx --test "src/**/*.test.ts"`; `typecheck` = `tsc --noEmit`; `lint` = `eslint .`.
- `tsconfig.json` — strict, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `allowImportingTsExtensions`; includes `src/**`, `rules/**`; excludes `runs`, `examples`.
- `.gitignore` — `runs/` ignored; tests must not rely on it.

## Patterns to follow

- CLI command — like the `match` case and `checkRules` in `src/cli.ts`; add to `USAGE` and a `package.json` script.
- Standalone module — like `src/match.ts` (header comment line, exported interface + async function, doc comment saying what it throws).
- Job file handling — like `src/fetch/jobs.ts` (one-line `/** */` doc comments, ENOENT via `(error as NodeJS.ErrnoException).code`).
- Tests — like `src/match.test.ts` (header comment listing cases, const fixtures, table-driven `test`) and `src/rules/examples.test.ts` (`assert.fail` with `formatDiff`). Runner `node:test` + `node:assert/strict`, files `src/**/*.test.ts` next to the source.
- Docs — command sections with an "Exit code | Meaning" table, like `match` / `rules:check` in `vacancy-reader/README.md`.

## Conventions

- Exit codes: 0 success; 1 domain failure (not found, no rule, invalid URL, extraction error, uncaught throw); 2 usage (missing arg, unknown command).
- Errors to stderr via `console.error`; no-rule text is always `noRuleMessage(site)`.
- Imports with `.ts` extension; `import type` for types.
- `status.json` written only through `writeStatus`; never store `crashed`. Worker paths from `MODULE_ROOT` / `RUNS_DIR`, never cwd. Worker log lines `[<iso>] message`.
- `http_error` and `timeout` jobs also have `page.html`, but only `succeeded` is extracted (approach).
- Examples are byte-for-byte (`-text`) and must stay unchanged.
- README sections to update: "How the module works", "Available now" / "Planned", Commands, "Job statuses", "`runs/` layout", "`status.json` fields". `rules/README.md`: "Planned", extraction errors. Root `CLAUDE.md`: "Vacancy URLs".
- ADR `10-site-parsing-rule-format`: without a rule there is no extracted document; what happens then is the site-without-a-rule task (#12).

## Gaps found during implementation
