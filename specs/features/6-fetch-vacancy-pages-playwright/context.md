# Context: #6 Fetch vacancy pages with Playwright

## Code map

- No application code exists yet. The repo holds `specs/`, `examples/vacancies/`, `.claude/` (SDD kit, do not touch), `README.md`, `CLAUDE.md`, `.gitattributes`.
- `examples/vacancies/index.yaml` — `schema: 1`, `sites.<site>.count`, `examples[].{url,path,saved_at,notes}`; `path` is relative to the examples root, so it stays valid after the move.
- `examples/vacancies/careers-page.com/idelsoft-senior-frontend-performance-engineer/{expected.md,page.html}` — the only example; its URL in `index.yaml` is the smoke-test URL.
- `.gitattributes` — `examples/** -text`: example bytes must stay unchanged; becomes `vacancy-reader/examples/** -text`.
- `specs/AGENT.md:25`, `specs/mission.md:47`, `specs/tech-stack.md:18` — reference `examples/vacancies/` and ADR 7.
- `specs/tech-stack.md` — "Languages & Frameworks", "Checks", "Key Dependencies" sections say "not chosen yet"; fill them.

## Patterns to follow

- ADR — like `specs/decisions/7-vacancy-examples-layout.md` (header `Status`/`Date`/`Issue`/`Affects`, then Context/Decision/Consequences).
- In ADRs and docs name tasks by meaning: `Fetch vacancy pages with Playwright (#6)`, never a bare `#6`.

## Conventions

- Environment: Windows 11, Node 24.13, npm 11. Run commands from `vacancy-reader/`.
- All code, comments and docs in English.
- ESM (`"type": "module"`), strict TypeScript; run TS directly with `tsx` (no build step needed for the CLI).
- Playwright: `playwright` package, bundled Chromium (`npx playwright install chromium`), headless by default; no persistent profile, no cookies stored.
- The worker must be detached from the caller (`child_process.spawn` with `detached: true`, `stdio` to a log file or ignored, `unref()`), so `fetch` returns while the job runs, and works on Windows.
- `runs/` is gitignored and never committed.
- Do not edit accepted ADRs except their `Status` line.

## Gaps found during implementation
