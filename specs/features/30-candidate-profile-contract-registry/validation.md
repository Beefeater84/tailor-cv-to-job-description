# Validation: #30 Candidate profile contract

## Tools

- npm, tsc, eslint, tsx (`node:test`), in `tailor-cv/`

## Checklist

- [ ] Dependencies install — auto: `cd tailor-cv && npm ci`
- [ ] Types check — auto: `cd tailor-cv && npm run typecheck`
- [ ] Lint passes — auto: `cd tailor-cv && npm run lint`
- [ ] Tests pass (example valid; each invalid case rejected; all violations listed) — auto: `cd tailor-cv && npm test`
- [ ] The schema covers every block P-01…P-11 of `tailor-cv/profile-data.md` — manual: compare the schema with the document
- [ ] Every property in the schema has a description — auto: covered by a test, or `manual: read the schema`
- [ ] The example profile is invented, no personal data — manual: read `tailor-cv/contract/examples/profile.example.json`
- [ ] The ADR exists and is accepted — auto: `grep -q "^Status: accepted" specs/decisions/30-candidate-profile-contract.md`
- [ ] `vacancy-reader/` is unchanged — auto: `git diff --quiet staging...HEAD -- vacancy-reader`

## Smoke tests

- Remove `project_id` target from the example (rename a project id) and check that validation names the dangling reference.
