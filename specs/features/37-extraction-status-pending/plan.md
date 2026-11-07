# Plan: #37 Extraction status: show pending and never leave it missing

Issue: #37 · Approach: https://github.com/Beefeater84/tailor-cv-to-job-description/issues/37#issuecomment-6713591261
Delivery: -
Later: -

## Group 1: Explicit extraction status in code

- Task: #37
- Goal: `status.json` shows `extraction.status: running` from the moment the fetch succeeds until the extraction ends; every run ends in `succeeded`, `no_rule` or `failed` (also when `extractJob` throws in the worker); a `running` extraction whose process is gone reads as `crashed`.
- Files: `vacancy-reader/src/fetch/jobs.ts` (change: `running` status, `startedAt`, `pid`, nullable `finishedAt`, read-time `crashed` for extraction), `vacancy-reader/src/extract.ts` (change: write `running` at start, keep `startedAt` in the final block), `vacancy-reader/src/fetch/worker.ts` (change: write `succeeded` and `extraction: running` in one write; the post-fetch extraction step moves to an exported, testable function that writes `failed` when extraction throws), a new module for that step if needed (create), `vacancy-reader/src/cli.ts` (change only if the `extract` output needs it), tests next to the code (create/change).
- Reuse: `writeStatus`, `getJob`, `isPidAlive`, `withCrashCheck` in `jobs.ts`; `errorMessage` in `worker.ts`; `makeJob`, `fakeModel` and the temp `runsDir` helpers in `src/extract.test.ts`.
- Done when: tests cover running-during-extraction, the final block with `startedAt` and `finishedAt`, the worker step writing `failed` on a throw, and `crashed` for a dead `pid`; typecheck, lint and tests pass.
- Complexity: normal

## Group 2: Documentation

- Task: #37
- Goal: the docs describe the extraction status lifecycle, and consumers wait for a final status.
- Files: `vacancy-reader/README.md` (change: `status` and `extract` sections, job statuses and `status.json` tables), `CLAUDE.md` (change: the vacancy-URL flow waits until `extraction.status` is final), `vacancy-reader/contract/README.md` (change only if its mention of extraction statuses is now wrong).
- Reuse: existing tables and wording in `vacancy-reader/README.md`.
- Done when: the README says `extraction` is absent only for a fetch that did not succeed, lists `running` and read-time `crashed`, and documents `startedAt`, `pid` and nullable `finishedAt`; the `CLAUDE.md` flow matches.
- Complexity: normal
