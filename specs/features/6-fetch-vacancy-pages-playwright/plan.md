# Plan: #6 Fetch vacancy pages with Playwright

Issue: Fetch vacancy pages with Playwright (#6) · Approach: https://github.com/Beefeater84/tailor-cv-to-job-description/issues/6#issuecomment-6381606470
Delivery: -
Later: -

The user's browser session is out of scope: Fetcher: use the user's browser session (#16).

## Group 1: Stack and module ADRs, examples move

- Task: #6
- Goal: Record the project stack and the `vacancy-reader/` module as ADRs, and move the vacancy examples into the module unchanged.
- Files:
  - `specs/decisions/6-typescript-node-stack.md` (create): TypeScript on Node 24, npm, Playwright; each pipeline stage is its own top-level module with its own `package.json`; checks are typecheck and lint, tests are added where logic is non-trivial.
  - `specs/decisions/6-vacancy-reader-module.md` (create): the vacancy reader epic lives in one module `vacancy-reader/` (fetch, parse, output contract); examples are the module's evals in `vacancy-reader/examples/`; all other rules of the examples layout carry over unchanged. Supersedes `7-vacancy-examples-layout.md`.
  - `specs/decisions/7-vacancy-examples-layout.md` (change: only the `Status` line, `superseded by 6-vacancy-reader-module.md`)
  - `examples/vacancies/**` → `vacancy-reader/examples/**` (`git mv`, bytes unchanged)
  - `.gitattributes` (change: new examples path)
  - `specs/AGENT.md`, `specs/mission.md`, `specs/tech-stack.md` (change: new paths and ADRs; tech-stack gets language, runtime, checks)
- Reuse: `.claude/templates/sdd/adr.md`; `specs/decisions/7-vacancy-examples-layout.md` — text to carry over into the new layout ADR
- Done when: both ADRs exist with `Status: accepted` (agreed in the approach); `git log --follow` shows the example files moved, not rewritten; no doc outside `specs/features/` and superseded ADR 7 points to `examples/vacancies/`.
- Complexity: normal

## Group 2: Module scaffold

- Task: #6
- Goal: Create the `vacancy-reader/` Node/TypeScript package with typecheck and lint, ready for the fetcher.
- Files: `vacancy-reader/package.json`, `vacancy-reader/package-lock.json`, `vacancy-reader/tsconfig.json`, `vacancy-reader/eslint.config.js`, `vacancy-reader/.gitignore` (`node_modules/`, `runs/`, build output) (create)
- Reuse: -
- Done when: `npm ci`, `npm run typecheck` and `npm run lint` pass in `vacancy-reader/`; Playwright and its Chromium install with a documented command.
- Complexity: normal

## Group 3: Async fetcher, CLI and docs

- Task: #6
- Goal: `fetch <url>` starts a detached job and returns its id at once; the job renders the page in headless Chromium and saves `page.html` and `status.json` under `vacancy-reader/runs/<job-id>/`; `status <id>` and `jobs` report state.
- Files: `vacancy-reader/src/fetch/` (create: page fetching, job storage, worker), `vacancy-reader/src/cli.ts` (create), `vacancy-reader/package.json` (change: scripts `fetch`, `status`, `jobs`), `vacancy-reader/README.md` (create: what the module is, setup, commands, job statuses, `runs/` layout, examples link), `CLAUDE.md` (change: one line pointing to the module README for fetching a vacancy URL given in chat)
- Behaviour:
  - Rendered = `load`, then network idle capped at ~10 s; optional `--wait-for <selector>`; `--headed` flag.
  - Statuses: `queued`, `running`, `succeeded` (2xx), `http_error` (4xx/5xx, HTML still saved), `timeout`, `failed` (navigation or browser error, message in `error`), `crashed` (reported by `status`/`jobs` when the status is `running` but the worker pid is gone).
  - `status.json`: `url`, `finalUrl`, `httpStatus`, `status`, `error`, `startedAt`, `finishedAt`, `pid`.
  - Job id readable and unique: time + site + short random suffix.
  - Invalid URL fails at once, before a job is created.
  - Several `fetch` calls from different sessions do not interfere.
- Reuse: -
- Done when: typecheck and lint pass; fetching the stored example URL ends in `succeeded` with the vacancy text in `page.html`; a bad host ends in `failed`; two parallel fetches both finish.
- Complexity: complex
