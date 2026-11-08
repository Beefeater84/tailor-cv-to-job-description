# Validation: #21 Extract a fetched vacancy to Markdown with its site rule

## Tools

- `node:test` via `tsx --test`, TypeScript (`tsc --noEmit`), ESLint; all run from `vacancy-reader/`.

## Checklist

- [ ] Types check — auto: `cd vacancy-reader && npm run typecheck`
- [ ] Lint passes — auto: `cd vacancy-reader && npm run lint`
- [ ] All tests pass, including the new extraction tests and the example tests — auto: `cd vacancy-reader && npm test`
- [ ] Extraction tests cover success on the stored example, no rule, extraction failure with stale file removed, job not succeeded — auto: `grep -nE "no_rule|failed|succeeded|expected\.md" vacancy-reader/src/extract.test.ts`
- [ ] Tests do not use the real `runs/` folder — auto: `cd vacancy-reader && git status --porcelain --ignored runs` shows no new entries after `npm test` (compare before/after)
- [ ] `extract` without an argument exits 2 — auto: `cd vacancy-reader && npx tsx src/cli.ts extract; test $? -eq 2`
- [ ] `extract` with an unknown job id exits 1 — auto: `cd vacancy-reader && npx tsx src/cli.ts extract no-such-job; test $? -eq 1`
- [ ] `package.json` has the `extract` script and `USAGE` lists it — auto: `grep -n '"extract"' vacancy-reader/package.json && grep -n "extract" vacancy-reader/src/cli.ts`
- [ ] The worker runs extraction after `succeeded` and an extraction error does not change the fetch status — manual: read `vacancy-reader/src/fetch/worker.ts`
- [ ] `examples/` unchanged — auto: `git diff --quiet origin/staging -- vacancy-reader/examples`
- [ ] Docs describe the `extract` command, the automatic step, `vacancy.md`, the `extraction` field, and no longer list running a rule on a fetched job as planned — auto: `grep -n "npm run extract" vacancy-reader/README.md && grep -n "vacancy.md" vacancy-reader/README.md CLAUDE.md`; manual: read the sections in `vacancy-reader/README.md`, `vacancy-reader/rules/README.md`, `CLAUDE.md`

## Smoke tests

- `cd vacancy-reader && npm run fetch -- https://www.careers-page.com/manatal/job/L3X639RW`, then `npm run status -- <job-id>` until final: `status: succeeded`, `extraction.status: succeeded`, `runs/<job-id>/vacancy.md` exists with front matter (`source_url`, `site: careers-page.com`, `title`) and `## Job description`. Then `npm run extract -- <job-id>` exits 0 and rewrites the same file.
- `npm run fetch -- https://example.com/` → after it finishes, `extraction.status: no_rule`, no `vacancy.md`; `npm run extract -- <job-id>` prints `no rule for example.com`, exit 1.
