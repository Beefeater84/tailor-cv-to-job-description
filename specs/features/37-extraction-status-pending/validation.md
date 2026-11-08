# Validation: #37 Extraction status: show pending and never leave it missing

## Tools

- TypeScript (`tsc`), ESLint, `node:test` via `tsx`; run in `vacancy-reader/`.

## Checklist

- [ ] Typecheck passes — auto: `cd vacancy-reader && npm run typecheck`
- [ ] Lint passes — auto: `cd vacancy-reader && npm run lint`
- [ ] All tests pass, including the example rule tests — auto: `cd vacancy-reader && npm test`
- [ ] A test shows `extraction.status: running` with `startedAt` in `status.json` while extraction runs — auto: `cd vacancy-reader && npm test`
- [ ] A test shows the final block keeps `startedAt` and has `finishedAt` — auto: `cd vacancy-reader && npm test`
- [ ] A test shows the post-fetch worker step writes `extraction.status: failed` with the error when extraction throws — auto: `cd vacancy-reader && npm test`
- [ ] A test shows a `running` extraction with a dead `pid` reads as `crashed` through `getJob`, while the stored file keeps `running` — auto: `cd vacancy-reader && npm test`
- [ ] The fetch `status` stays `succeeded` in every extraction outcome — auto: `cd vacancy-reader && npm test`
- [ ] `vacancy-reader/README.md` documents `running`, read-time `crashed`, `startedAt`, `pid`, nullable `finishedAt`, and that `extraction` is absent only when the fetch did not succeed — auto: `grep -n "startedAt" vacancy-reader/README.md`
- [ ] The `CLAUDE.md` vacancy-URL flow waits until `extraction.status` is final — auto: `grep -n "extraction.status" CLAUDE.md`
- [ ] No accepted ADR edited — auto: `git diff --name-only staging...HEAD -- specs/decisions/`

## Smoke tests

- manual: with `ANTHROPIC_API_KEY` set, `cd vacancy-reader && npm run fetch -- <vacancy URL of a site without a rule>`, then `npm run status -- <job-id>` right after `succeeded`: `extraction.status` is `running` with `startedAt`, and later `succeeded` with `finishedAt`.
