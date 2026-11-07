# Validation: #22 careers-page.com: company not extracted when the page title has another template

## Tools

- TypeScript (`tsc`), ESLint, `node:test` via `tsx`, `npm run rules:check`; run in `vacancy-reader/`.

## Checklist

- [ ] Typecheck passes — auto: `cd vacancy-reader && npm run typecheck`
- [ ] Lint passes — auto: `cd vacancy-reader && npm run lint`
- [ ] All tests pass — auto: `cd vacancy-reader && npm test`
- [ ] Both careers-page.com examples pass, with `company: iDelsoft` and `company: Manatal` — auto: `cd vacancy-reader && npm run rules:check -- careers-page.com && grep -h "^company:" examples/careers-page.com/*/expected.md`
- [ ] `index.yaml` lists 2 careers-page.com examples and `count: 2` — auto: `grep -n -A3 "careers-page.com:" vacancy-reader/examples/index.yaml`
- [ ] A test shows a field whose selector matches nothing is listed in `unresolved` in the document front matter — auto: `cd vacancy-reader && npm test`
- [ ] A test shows a `postprocess` mark gives `unresolved` (a title without the slug gives `unresolved: [company]`) — auto: `cd vacancy-reader && npm test`
- [ ] A test shows a field the rule does not try is not listed — auto: `cd vacancy-reader && npm test`
- [ ] `extraction.unresolved` is in `status.json` — auto: `cd vacancy-reader && npm test`
- [ ] `vacancy.json` has no new key and stays `1.0` — auto: `git diff staging...HEAD -- vacancy-reader/contract/vacancy.schema.json vacancy-reader/src/contract/build.ts` is empty
- [ ] ADR `specs/decisions/22-*.md` exists, accepted, describes the mechanism — auto: `grep -l "^Status: accepted" specs/decisions/22-*.md`
- [ ] `rules/README.md` documents `unresolved` and the new careers-page.com company logic — auto: `grep -n "unresolved" vacancy-reader/rules/README.md`
- [ ] No accepted ADR other than the new one edited — auto: `git diff --name-only staging...HEAD -- specs/decisions/`
- [ ] `rules/fields.md` and the LLM fallback unchanged — auto: `git diff --name-only staging...HEAD -- vacancy-reader/rules/fields.md vacancy-reader/src/fallback/`

## Smoke tests

- manual: `cd vacancy-reader && npm run extract -- 20261024-181218-careers-page.com-05ce` (Manatal Product Analyst run): `vacancy.md` has `company: Manatal`; `npm run extract -- 20261024-181408-careers-page.com-d784` (alljobs): `vacancy.md` has `unresolved: [company]` and `npm run status` shows `extraction.unresolved`.
