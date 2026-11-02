# Context: #30 Candidate profile contract

The repo root holds independent modules (ADR 6): `vacancy-reader/` has code, `tailor-cv/` has docs only until this task. No root package.json; each module has its own. Modules never import each other's code: copy, do not import.

## Code map

- `vacancy-reader/contract/vacancy.schema.json` — draft-07; `$id` `https://github.com/Beefeater84/tailor-cv-to-job-description/vacancy-reader/contract/vacancy.schema.json`; `schema_version` `{"const":"1.0"}`; `description` on every property; nullable as `"type": ["string","null"]` with `minLength: 1`, lists `["array","null"]` with `minItems: 1`; formats `date-time`, `uri`; all keys `required`; `additionalProperties: false`.
- `vacancy-reader/contract/README.md` — sections: Input and output, Fields (vN) table, Absent values, Versioning and validation, Rules for the consumer, Not in the contract.
- `vacancy-reader/src/contract/validate.ts` — `import schema from "../../contract/vacancy.schema.json" with { type: "json" }`, exported as `CONTRACT_SCHEMA`; `new Ajv({ allErrors: true, strict: true, allowUnionTypes: true })`; `addFormats(ajv, ["date-time","uri"])` with the cast `addFormatsModule as unknown as typeof addFormatsModule.default`; `ajv.compile<VacancyContract>(schema)` at module load; `describe(error: ErrorObject): string` → `<path>: unknown key "x"` / `missing key "x"` / `must be "1.0"` / `must be one of [...]`; `validateContract(value: unknown): VacancyContract` throws `ContractError`.
- `vacancy-reader/src/contract/error.ts` — `class ContractError extends Error { override name = "ContractError"; constructor(readonly violations: string[]) }`, message `"Vacancy contract is invalid:\n- …"`.
- `vacancy-reader/src/contract/build.ts` — `CONTRACT_VERSION = "1.0"`; hand-written interface mirroring the schema; `serializeContract` = `JSON.stringify(c, null, 2) + "\n"`.
- `vacancy-reader/src/contract/index.ts` — barrel with a one-line header comment.
- `vacancy-reader/src/contract/contract.test.ts` — `node:test` + `node:assert/strict`; header comment lists the cases; helpers `validContract()`, `assertRejected(value, regex)`.
- `vacancy-reader/package.json` — `"type": "module"`, `"private": true`, `engines.node >= 24`; exact pins: `ajv 8.20.0`, `ajv-formats 3.0.1`; dev: `typescript 6.0.3`, `tsx 4.23.15`, `eslint 10.13.0`, `@eslint/js 10.0.1`, `typescript-eslint 8.72.0`, `@types/node 24.19.2`; scripts `test` = `tsx --test "src/**/*.test.ts"`, `typecheck` = `tsc --noEmit`, `lint` = `eslint .`.
- `vacancy-reader/tsconfig.json` — ES2024, NodeNext, `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `verbatimModuleSyntax`, `allowImportingTsExtensions`, `resolveJsonModule`, `noEmit`.
- `vacancy-reader/eslint.config.js`, `vacancy-reader/.gitignore` — copy, adjust ignores.

## The profile (owner-agreed, approach comment)

- Blocks: `tailor-cv/profile-data.md` P-01…P-11 with their fields; what it lists as computed or not stored is not in the schema.
- Top level: `schema_version`, `meta` (`sources`: list of {id `src-…`, kind (index_cv, file, chat), location (URL or path, nullable), read_at}; `updated_at`), `person` (P-01), `search` (P-02), `contacts` (P-03), `skills` (P-04), `achievements` (P-05), `jobs` (P-06: list of roles with periods, projects inside the job), `projects` (P-07), `languages` (P-08), `education` (P-09: qualifications, certifications), `hobbies` (P-10), `decisions` (P-11).
- The profile is self-contained: all text of jobs, projects, achievements is in the JSON. Ids are strings with prefixes `job-`, `prj-`, `ach-`, `skill-` (others as needed, e.g. `src-`, `dec-`). Links inside the file: achievement → one project (inside a job or outside); skill → evidence ids of jobs/projects; origin → `meta.sources`. JSON Schema checks shapes; code checks unique ids and that every reference exists.
- Origin per unit (job, project, achievement, skill, language, …), not per field: `origin` = { kind: `source_cv` | `candidate` | `agent_confirmed`, source (id in meta.sources, for source_cv), quote (for source_cv), date (for candidate / agent_confirmed) }.
- Dates `YYYY` or `YYYY-MM`; end `present` for a current job.
- Project context and role description: Markdown text. Achievements: units with fields (result, number with context, measure, own contribution vs team, how, AI involvement).
- ADR 8 rules: `schema_version` MAJOR.MINOR (start "1.0"); every field present; `null` for no value; producer validates strictly (`additionalProperties: false`); consumer checks the major version only.
- Stable `$id` under the repo URL + `tailor-cv/contract/profile.schema.json`, no dependency on tailor-cv code, so `index-cv` can produce against it.

## Conventions

- ESM, run with `tsx`, no build; imports with `.ts`; `import type`; exact dependency pins; snake_case JSON keys.
- One-line `//` header comment per file; JSDoc on exports; typed `Error` subclass with `override name`; list every violation.
- Tests `*.test.ts` next to the code, `node:test` + `node:assert/strict`, header comment listing the cases.
- No personal data: the example is an invented candidate (e.g. company `Example Corp`, `example.com` contacts). Never use `llms-full.txt` content.
- Module docs live in the module (`tailor-cv/contract/README.md`); `specs/` only links. Name tasks by meaning: `"<title>" (#N)`. English only.
- Never edit an accepted ADR.
- Commits: `feat(#30): …` / `docs(#30): …` with the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Gaps found during implementation
