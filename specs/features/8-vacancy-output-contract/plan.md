# Plan: #8 Vacancy output contract for the CV writer

Issue: #8 · Approach: https://github.com/Beefeater84/tailor-cv-to-job-description/issues/8#issuecomment-6419376012
Delivery: -
Later: -

v1 of the contract: `runs/<job-id>/vacancy.json`, checked against `vacancy-reader/contract/vacancy.schema.json`. Every field of the version is always present; `null` means no value; a missing key means the field is not in this version. `vacancy.md` stays the human document and does not change.

## Group 1: Contract schema, builder and validator

- Task: #8
- Goal: a versioned JSON Schema of the vacancy contract (v1.0) and a module that builds a contract from extracted fields and validates it, checked on the real stored example.
- Files: `vacancy-reader/contract/vacancy.schema.json` (create), `vacancy-reader/src/contract/` (create: builder, validator, error, barrel, test), `vacancy-reader/package.json` and `package-lock.json` (change: ajv, ajv-formats as exact-pinned direct dependencies)
- Reuse: `src/rules/types.ts` — `ExtractedFields`, `ExtractionMethod`; `src/rules/examples.ts` — `readExamples`, `extractDocument`'s rule path for the example test; `src/fallback/fields.ts` — schema and error-class style
- Done when: the stored careers-page.com example (rule on `page.html`, `fetched_at` from `saved_at`) builds a contract that passes the schema; tests cover key order, `null` for absent values (`tags` too), `description` never `null`, and a rejected contract (missing key, extra key, wrong version) failing with a clear error.
- Complexity: complex

## Group 2: Write vacancy.json in the extraction step

- Task: #8
- Goal: `extractJob` writes a validated `vacancy.json` next to `vacancy.md` for both the rule and the LLM path, deterministically.
- Files: `vacancy-reader/src/extract.ts` (change), `vacancy-reader/src/extract.test.ts` (change), `vacancy-reader/src/fallback/fallback.test.ts` (change, only if it asserts the files of a run)
- Reuse: group 1's builder and validator; `JobStatus.finishedAt` of the fetch as `fetched_at`; the existing catch path of `extractJob` (failure → `extraction.status: failed`, stale files removed)
- Done when: tests show `vacancy.json` for a rule job and an LLM job, the same bytes on a second `extract` of the same fetch, `failed` with a contract error and no `vacancy.json`/`vacancy.md` left when validation fails; `status.json` format unchanged.
- Complexity: normal

## Group 3: Contract docs and ADR

- Task: #8
- Goal: the contract is documented inside the module and recorded as an ADR the CV writer (#4) and the candidate profile contract (#30) can rely on.
- Files: `vacancy-reader/contract/README.md` (create), `vacancy-reader/README.md` (change), `vacancy-reader/rules/README.md` (change), `specs/decisions/8-vacancy-output-contract.md` (create), `specs/mission.md` (change), `specs/tech-stack.md` (change), `specs/AGENT.md` (change), `CLAUDE.md` (change)
- Reuse: `.claude/templates/sdd/adr.md`; `specs/decisions/12-llm-fallback-extraction.md` for ADR style
- Done when: `contract/README.md` states the input, where the output and the schema are, the fields, versioning, the meaning of `null`, and the rules for the consumer; the ADR is `accepted` with `Affects` on #4, #30, #29, #14, #18; `mission.md` defines "vacancy reader" and "CV reader"; `specs/` files only link to the module docs.
- Complexity: normal
