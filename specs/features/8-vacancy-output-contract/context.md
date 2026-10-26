# Context: #8 Vacancy output contract for the CV writer

## Code map

All paths under `vacancy-reader/` unless stated.

- `src/rules/types.ts` — `ExtractionMethod = "rule" | "llm"`; `ExtractedFields { title?, company?, hiring_manager?, tags?: string[], company_description?, description: string }` — the input of the contract builder; shared by rule and LLM paths.
- `src/rules/render.ts` — `DocumentSource { sourceUrl; site; method }`, `renderDocument(fields, source): string` — the `vacancy.md` serializer; front matter key order `source_url, site, extracted_by, title, company, hiring_manager, tags`, body `## Company`, `## Job description`. Do NOT change its output.
- `src/rules/normalize.ts` — `normalizeDocument`, `lineDiff`, `formatDiff`.
- `src/rules/extract.ts` — `extractFields(rule, html, sourceUrl): ExtractedFields`; `class ExtractionError extends Error { override name = "ExtractionError" }`.
- `src/rules/examples.ts` — `readExamples()`, `listExamples(site)` (parse `examples/index.yaml`, checks `schema: 1`), `extractDocument(rule, html, sourceUrl): string`, `runExample(example)`; helpers `isRecord`, `optionalText` (turns a YAML date into `YYYY-MM-DD`). Example has `url`, `path`, `saved_at`.
- `src/rules/examples.test.ts` — one `node:test` test per example from the index; `t.todo` for sites without a rule. Pattern for the per-example contract test.
- `src/rules/index.ts` — barrel of the rules API. `src/rules/load.ts` — `loadRule(site)`, `RULES_DIR`, `SITE_KEY_PATTERN`.
- `src/site.ts` — `siteKey(url)`: host without `www.`, lowercased.
- `src/fallback/fields.ts` — `FIELDS_SCHEMA` (`as const` JSON Schema, `additionalProperties: false`), `parseModelFields(output): ExtractedFields`, `class FallbackError`.
- `src/fallback/index.ts` — `extractWithModel(model, html, source): Promise<string>` → `renderDocument(..., method: "llm")`. Returns the document string only; group 2 needs the fields too (expose them, e.g. return fields + document, without changing the document).
- `src/extract.ts` — `VACANCY_FILE = "vacancy.md"`; `extractJob(id, runsDir = RUNS_DIR, options = {}): Promise<ExtractionResult>` — the one place that writes `vacancy.md` (rule branch and llm branch); on error removes stale `vacancy.md` and writes `extraction: { status: "failed", error }` via `writeStatus`.
- `src/fetch/jobs.ts` — `JobStatus { id, url, finalUrl, httpStatus, status, error, createdAt, startedAt, finishedAt, pid, options, extraction? }`; `ExtractionResult { status, site, rule, file, error, method, has_rule, finishedAt }`; `writeStatus`, `readStatus`, `getJob`, `RUNS_DIR`, `MODULE_ROOT`. `JobStatus.finishedAt` = fetch end, set once by the worker → `fetched_at`. `ExtractionResult.finishedAt` is the extraction time: never use it in the contract.
- `src/fetch/worker.ts` — `run(id)`: fetch, set `finishedAt`, then `extractJob(id)`.
- `src/cli.ts` — `extract` prints `Extraction failed: <error>`, exit 1.
- `src/extract.test.ts` — `extractJob` in a `mkdtemp` runs dir with a fake model; `makeJob()` with fixed `finishedAt: "2026-10-24T10:00:02.000Z"`; asserts `vacancy.md` byte-exact against `expected.md` and an inline LLM document string.
- `src/fallback/fallback.test.ts` — fallback tests offline with a fake model.
- `rules/careers-page.com.ts` — the only rule: `title`, `description`, `postprocess` sets `company` from the `<title>` template.
- `rules/fields.md` — field definitions; only `description` required. Also the LLM prompt: do not change it in this task.
- `examples/index.yaml` — `schema: 1`, `sites.<site>.examples[] { url, path, saved_at, notes }`.
- `examples/careers-page.com/idelsoft-senior-frontend-performance-engineer/{expected.md,page.html}` — the one real example; `saved_at: 2026-10-23`.
- `package.json` — `"type": "module"`, Node >=24, exact version pins; deps `@anthropic-ai/sdk`, `linkedom`, `playwright`, `turndown`, `yaml`; no zod/ajv as direct deps (ajv 6 only transitive via eslint: do not import it). Scripts: `test` = `tsx --test "src/**/*.test.ts"`, `typecheck` = `tsc --noEmit`, `lint` = `eslint .`.
- `tsconfig.json` — strict, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `allowImportingTsExtensions`, `resolveJsonModule: true`; include `src/**/*.ts`, `rules/**/*.ts`; exclude `examples`, `runs`. A `.json` schema outside `src/` can be imported from `src/`.
- `eslint.config.js` — ignores `node_modules/`, `runs/`, `examples/`, `dist/`.

## Contract v1 (agreed in the approach)

- File: `runs/<job-id>/vacancy.json`, `JSON.stringify(value, null, 2)` + `\n`. Schema: `contract/vacancy.schema.json`.
- Key order: `schema_version, source_url, site, extracted_by, fetched_at, title, company, hiring_manager, company_description, tags, description`.
- `schema_version`: `"1.0"` (MAJOR.MINOR). `source_url`: the job's requested `url` (not `finalUrl`). `site`: `siteKey`. `extracted_by`: `rule|llm`. `fetched_at`: ISO date-time from the fetch `finishedAt`.
- All keys required. `title`, `company`, `hiring_manager`, `company_description` (Markdown): string or `null`. `tags`: non-empty string array or `null` (never `[]`). `description`: non-empty Markdown string, never `null`. `additionalProperties: false`.
- No `Date.now()` anywhere in building the contract: same fetch + same rule → same bytes.
- Validation before writing; failure throws a contract error listing the violations → `extraction.status: failed`.

## Patterns to follow

- Schema object and validator style, error class — like `src/fallback/fields.ts`.
- Barrel export — like `src/rules/index.ts`.
- Tests: header comment listing cases, `node:test` + `node:assert/strict`, colocated `src/**/<name>.test.ts`, temp dirs via `mkdtemp(tmpdir())` + `after(rm)` — like `src/extract.test.ts`; per-example loop — like `src/rules/examples.test.ts`.
- ADR — `.claude/templates/sdd/adr.md`, style of `specs/decisions/12-llm-fallback-extraction.md`.

## Conventions

- Imports with explicit `.ts` extensions; `import type` for types (`verbatimModuleSyntax`).
- Exact dependency versions (no `^`); update `package-lock.json` with `npm install`.
- Error classes: `class X extends Error { override name = "X" }`; short plain messages.
- Never edit an accepted ADR. `vacancy.md` / `expected.md` format and `status.json` format stay unchanged.
- Module docs live inside the module (`vacancy-reader/contract/README.md`); `specs/` only holds the ADR, mission terms and one-line links.
- In docs, name a task by meaning with the number in parentheses, e.g. "candidate profile contract (#30)", never a bare `#N`.
- All code, comments and docs in English.

## Gaps found during implementation
