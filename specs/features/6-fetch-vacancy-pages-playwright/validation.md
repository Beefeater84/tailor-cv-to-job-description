# Validation: #6 Fetch vacancy pages with Playwright

## Tools

- npm, TypeScript (`tsc --noEmit`), ESLint, Playwright Chromium. Run from `vacancy-reader/`.

## Checklist

- [ ] Dependencies install — auto: `cd vacancy-reader && npm ci && npx playwright install chromium`
- [ ] Typecheck passes — auto: `cd vacancy-reader && npm run typecheck`
- [ ] Lint passes — auto: `cd vacancy-reader && npm run lint`
- [ ] Examples moved with unchanged bytes — auto: `git diff --stat -M origin/staging -- examples vacancy-reader/examples` shows only renames (100% similarity)
- [ ] No stale references to the old path — auto: `git grep -n "examples/vacancies" -- . ':!specs/features/' ':!specs/decisions/7-vacancy-examples-layout.md' ':!.claude/'` prints nothing
- [ ] `runs/` and `node_modules/` are ignored — auto: `git check-ignore vacancy-reader/runs/x vacancy-reader/node_modules/x`
- [ ] ADRs `6-typescript-node-stack.md` and `6-vacancy-reader-module.md` exist with `Status: accepted`; ADR 7 is `superseded by 6-vacancy-reader-module.md` — auto: `grep -H '^Status:' specs/decisions/6-*.md specs/decisions/7-*.md`
- [ ] `fetch` returns a job id at once and the job ends in `succeeded` with the vacancy text in `page.html` — auto: run `npm run fetch -- <URL from vacancy-reader/examples/index.yaml>`, poll `npm run status -- <id>` up to 60 s, then grep `page.html` for a line from the example's `expected.md`
- [ ] Unreachable host ends in `failed` — auto: `npm run fetch -- https://nonexistent.invalid/`, poll `status`
- [ ] Invalid URL is rejected without creating a job — auto: `npm run fetch -- not-a-url` exits non-zero
- [ ] README documents setup, commands, statuses and `runs/` layout — manual: read `vacancy-reader/README.md`

## Smoke tests

- From two terminals, start `npm run fetch` with two different URLs at the same time; `npm run jobs` shows both, and both finish with their own `page.html` and `status.json`.
- In a chat session, give the agent a vacancy URL; it starts `fetch`, later reads `status`, and opens the saved `page.html`.
