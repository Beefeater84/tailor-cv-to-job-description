# Plan: #30 Candidate profile contract

Issue: #30 · Approach: https://github.com/Beefeater84/tailor-cv-to-job-description/issues/30#issuecomment-6543517065
Delivery: -
Later: -

## Group 1: Module setup, schema and example

- Task: #30
- Goal: the `tailor-cv/` module can run checks, and the profile schema with a synthetic example that passes it exists.
- Files: `tailor-cv/package.json`, `tailor-cv/package-lock.json`, `tailor-cv/tsconfig.json`, `tailor-cv/eslint.config.js`, `tailor-cv/.gitignore` (create); `tailor-cv/contract/profile.schema.json` (create); `tailor-cv/contract/examples/profile.example.json` (create)
- Reuse: `vacancy-reader/package.json`, `tsconfig.json`, `eslint.config.js`, `.gitignore` — setup; `vacancy-reader/contract/vacancy.schema.json` — schema style
- Done when: `npm ci`, `npm run typecheck`, `npm run lint` pass in `tailor-cv/`; the schema covers P-01…P-11 of `tailor-cv/profile-data.md` with a description on every field; the example is an invented candidate.
- Complexity: complex

## Group 2: Validation code and tests

- Task: #30
- Goal: `validateProfile` checks a profile against the schema and then the references between objects, and lists every violation.
- Files: `tailor-cv/src/contract/` (create: types, validate, error, index, tests)
- Reuse: `vacancy-reader/src/contract/validate.ts`, `error.ts`, `index.ts`, `contract.test.ts` — copied, not imported (ADR 6)
- Done when: tests pass: the example is valid; a missing key, an unknown key, a wrong version, a bad date, a duplicate id, a dangling reference (achievement → project, skill → evidence, origin → source) are each rejected with a clear message; all violations are listed.
- Complexity: normal

## Group 3: Docs and ADR

- Task: #30
- Goal: the contract is documented and recorded, and the project docs point to it.
- Files: `tailor-cv/contract/README.md` (create), `specs/decisions/30-candidate-profile-contract.md` (create), `tailor-cv/README.md`, `tailor-cv/profile-data.md` ("Not decided yet"), `specs/AGENT.md`, `specs/tech-stack.md`, `specs/mission.md` (change)
- Reuse: `vacancy-reader/contract/README.md` — README sections; `specs/decisions/8-vacancy-output-contract.md` — ADR style
- Done when: the README has the field overview, the example of links between objects, absent values, versioning and validation; the ADR (Affects: #31, #32, #48, #43, #34) is `accepted`; `tech-stack.md` lists the checks of `tailor-cv/`; `tailor-cv/README.md` no longer says the module has no code.
- Complexity: normal
