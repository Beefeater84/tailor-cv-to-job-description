# Plan: #21 Extract a fetched vacancy to Markdown with its site rule

Issue: Extract a fetched vacancy to Markdown with its site rule (#21) · Approach: https://github.com/Beefeater84/tailor-cv-to-job-description/issues/21#issuecomment-6385764388
Delivery: -
Later: -

Scope: a succeeded fetch job → match its `url` to a site rule → run the rule on `runs/<job-id>/page.html` → `runs/<job-id>/vacancy.md` and an `extraction` result in `status.json`. Runs automatically in the fetch worker after `succeeded`, and on demand with `npm run extract -- <job-id>`. Steps are called directly, no events: each step is a self-contained, idempotent function over the run folder, and `status.json` is the pipeline state. Out of scope: what happens next for a site without a rule (#12), the output contract for the writer (#8), end-to-end orchestration of later stages. No new ADR.

## Group 1: Extraction step, `extract` command, worker hook and tests

- Task: #21
- Goal: A succeeded fetch job gets its extracted vacancy document in the run folder, automatically after the fetch and again on demand, and its status shows the extraction result.
- Files:
  - `vacancy-reader/src/extract.ts` (create): extraction of one job. Reads the job; only `succeeded` jobs are extracted (others are refused with a clear error, nothing written). Site and rule come from the job's original `url`; `source_url` is that `url`. Outcomes recorded in a new `extraction` field of `status.json` — `succeeded` (with the file), `no_rule` (with the site, message `no rule for <site>`), `failed` (with the error; any error from the rule, including a throw in `postprocess`). Writes `vacancy.md` only on success; removes a stale `vacancy.md` on `no_rule` / `failed`. Re-running overwrites the previous result. The fetch `status` is never changed.
  - `vacancy-reader/src/extract.test.ts` (create): offline tests in a temporary runs folder, never the real `runs/`. Stored careers-page.com example `page.html` + its URL → `vacancy.md` equals `expected.md` and `extraction.status` is `succeeded`. Site without a rule → `no_rule`, no `vacancy.md`. Page without the description → `failed` with the error, no `vacancy.md`, stale file removed. Job not `succeeded` → refused, status unchanged.
  - `vacancy-reader/src/fetch/jobs.ts` (change): `extraction` in the job status type; job functions accept an optional runs folder (default stays `RUNS_DIR`) so the step is testable.
  - `vacancy-reader/src/fetch/worker.ts` (change): after a `succeeded` fetch, run the extraction step; its outcome and errors go to `extraction` and `worker.log`, never turn the fetch into `failed`.
  - `vacancy-reader/src/cli.ts` (change): command `extract <job-id>`; prints the site, the rule and the written file. Exit codes: 0 success; 1 job not found, job not succeeded, no rule (`no rule for <site>`), extraction failed; 2 missing argument. `USAGE` updated.
  - `vacancy-reader/package.json` (change): script `extract`.
- Reuse: `src/rules/examples.ts` (`extractDocument`, `readExamples` / `listExamples` for the test); `src/rules/load.ts` (`loadRule`, `noRuleMessage`); `src/site.ts` (`siteKey`); `src/fetch/jobs.ts` (`getJob`, `writeStatus`, `jobDir`); `src/rules/extract.ts` (`ExtractionError`); `src/rules/normalize.ts` (`formatDiff` for test failures).
- Done when: `npm run typecheck`, `npm run lint`, `npm test` pass, including the new extraction tests; `npm run extract` without an argument exits 2, with an unknown job id exits 1.
- Complexity: normal

## Group 2: Documentation

- Task: #21
- Goal: A reader knows from the docs how a fetched vacancy becomes `vacancy.md`, when it happens and what the job status says.
- Files:
  - `vacancy-reader/README.md` (change): "How the module works" steps 3–4 now run on a fetched job; the automatic step after fetch; `### npm run extract -- <job-id>` command section with an example and exit codes; `vacancy.md` in the `runs/` layout; `extraction` in the `status.json` fields table (its statuses and fields); "Available now" / "Planned" lists updated; who calls the steps (worker, CLI; direct calls, `status.json` as pipeline state).
  - `vacancy-reader/rules/README.md` (change): "Planned" no longer lists running a rule on a fetched job; extraction errors described for fetched jobs too.
  - `CLAUDE.md` (change): "Vacancy URLs" — after the job reaches a final status, read `runs/<job-id>/vacancy.md`; read `page.html` only when extraction did not succeed.
- Reuse: style of the `match` and `rules:check` command sections in `vacancy-reader/README.md`.
- Done when: docs match the code (command, output, exit codes, field names, file name); no doc still lists running a rule on a fetched job as planned.
- Complexity: normal
