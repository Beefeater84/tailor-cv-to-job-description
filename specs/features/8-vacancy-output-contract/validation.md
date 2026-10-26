# Validation: #8 Vacancy output contract for the CV writer

## Tools

- `tsx --test` (node:test), `tsc --noEmit`, `eslint`, ajv (through the project tests), `grep`.

All commands from `vacancy-reader/` unless stated.

## Checklist

- [ ] Dependencies install cleanly — auto: `npm ci`
- [ ] Typecheck passes — auto: `npm run typecheck`
- [ ] Lint passes — auto: `npm run lint`
- [ ] All tests pass — auto: `npm test`
- [ ] The schema file exists and carries version 1.0 — auto: `node -e "const s=require('./contract/vacancy.schema.json'); if(!JSON.stringify(s).includes('1.0')) process.exit(1)"`
- [ ] ajv is an exact-pinned direct dependency — auto: `node -e "const p=require('./package.json'); const v=p.dependencies.ajv; if(!v||/[\^~]/.test(v)) process.exit(1)"`
- [ ] The stored careers-page.com example validates against the schema — auto: `npm test` (the per-example contract test)
- [ ] `vacancy.json` is written for rule and LLM jobs, deterministically, and a contract failure leaves no output files — auto: `npm test` (`src/extract.test.ts`)
- [ ] `expected.md` and `rules/fields.md` are unchanged — auto: `git diff --exit-code origin/staging -- examples/ rules/fields.md`
- [ ] The ADR exists, is accepted and affects the candidate profile contract (#30) — auto (repo root): `grep -q '^Status: accepted' specs/decisions/8-vacancy-output-contract.md && grep -q '#30' specs/decisions/8-vacancy-output-contract.md`
- [ ] `mission.md` defines both terms — auto (repo root): `grep -qi 'vacancy reader' specs/mission.md && grep -qi 'CV reader' specs/mission.md`
- [ ] Module contract docs exist and are linked — auto (repo root): `test -f vacancy-reader/contract/README.md && grep -q 'contract/README.md' vacancy-reader/README.md && grep -q 'contract/README.md' specs/tech-stack.md`
- [ ] `contract/README.md` is clear: input, output location, schema location, fields, versioning, `null`, consumer rules (fallbacks, `extracted_by: llm`) — manual: read `vacancy-reader/contract/README.md`

## Smoke tests

- manual: `cd vacancy-reader && npm run fetch -- <careers-page.com vacancy URL>`, wait with `npm run status -- <job-id>`; open `runs/<job-id>/vacancy.json`: every key present, absent values `null`, `fetched_at` equals the fetch `finishedAt` in `status.json`. Run `npm run extract -- <job-id>` again and check `vacancy.json` has not changed.
