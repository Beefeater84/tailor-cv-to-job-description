# Context: #22 careers-page.com: company not extracted when the page title has another template

Paths are under `vacancy-reader/` unless they start with `specs/`.

## Code map

- `rules/careers-page.com.ts` — the only site rule. `title: "h1.job-position-break"`, `description: "main div.mt-5 > div.redactor-styles"`; no `company` selector. `postprocess(fields, { document, sourceUrl })` reads `<title>` (whitespace collapsed), matches `TITLE_TEMPLATE = /^.* - (.+?) - Get Hired\b/`, takes slug `new URL(sourceUrl).pathname.split("/")[1]`, adds `company` only when the template value equals `decodeURIComponent(slug)` case-insensitively.
- `src/rules/types.ts` — `ExtractionMethod`; `ExtractedFields { title?, company?, hiring_manager?, tags?: string[], company_description?, description: string }`; `PostprocessContext { document, sourceUrl }`; `SiteRule { description; title?; company?; hiring_manager?; company_description?; tags?; remove?; postprocess? }`; `defineRule` identity helper.
- `src/rules/extract.ts` — `extractFields(rule, html, sourceUrl): ExtractedFields`: linkedom `parseHTML`, removes `script, style, noscript, template` and `rule.remove`, reads description (`ExtractionError` if none), then title, company, hiring_manager, tags, company_description, then `postprocess`. After postprocess only checks `description` is non-blank. Helpers `collapse`, `shortField`, `longField`, `resolveLinks`.
- `src/rules/render.ts` — `renderDocument(fields, source)`; private `frontMatter` uses the `yaml` `Document`, insertion order = output order: `source_url, site, extracted_by, title, company, hiring_manager, tags`; missing fields dropped; `tags` flow list; options `lineWidth: 0, flowCollectionPadding: false`. Then `## Company` (if company_description) and `## Job description`, through `normalizeDocument`.
- `src/rules/normalize.ts` — `normalizeDocument`, `lineDiff`, `formatDiff`.
- `src/rules/index.ts` — barrel; export any new type here.
- `src/rules/examples.ts` — `readExamples()` (requires `schema: 1`, `url`, `path`; optional `saved_at`, `notes`; does not check `count`), `extractDocument`, `runExample` (pass/fail/error/todo).
- `src/rules/examples.test.ts` — one test per example in `index.yaml`; picks up new examples automatically.
- `src/cli.ts` — `checkRules(site)` for `npm run rules:check -- <site>`.
- `src/extract.ts` — `extractJob`: rule branch `extractFields` → `renderDocument` → `writeOutputs` (`buildContract`, `validateContract`, writes `vacancy.md` and `vacancy.json`); LLM branch `extractWithModel`. Since #37 it writes `extraction.status: running` first; final block has `startedAt`, `pid`, `finishedAt`.
- `src/fetch/jobs.ts` — `ExtractionResult` (status, site, rule, file, error, method, has_rule, startedAt, pid, finishedAt); add `unresolved` here for `status.json`.
- `src/contract/build.ts` — `CONTRACT_VERSION = "1.0"`, `buildContract(fields, source)`. Must NOT get an `unresolved` key (decision: contract stays 1.0). `contract/vacancy.schema.json` has `additionalProperties: false`.
- `src/contract/contract.test.ts` — loops over all examples; the new example needs `saved_at` (becomes `fetched_at`); asserts `KEY_ORDER`.
- `src/fallback/fields.ts`, `src/fallback/index.ts` — LLM path, renders through the same `renderDocument`; no unresolved concept; do not change. `rules/fields.md` is the LLM prompt: do not change.
- `src/extract.test.ts` — uses `readExamples().find(e => e.site === "careers-page.com")` (the first example): append Manatal after iDelsoft.
- `examples/index.yaml` — `careers-page.com: count: 1` with the iDelsoft entry (`saved_at: 2026-10-23`, notes "Public page, server-rendered, snapshot fetched without login").
- `examples/careers-page.com/idelsoft-senior-frontend-performance-engineer/expected.md` — `company: iDelsoft`. iDelsoft title: `Senior Frontend Performance Engineer - React (Europe, Remote) - iDelsoft - Get Hired. Work From Anywhere. | Career Page`.
- Manatal page: `runs/20261024-174010-careers-page.com-f771/page.html` (26960 bytes, URL `https://www.careers-page.com/manatal/job/L3X639RW`, title `Senior Platform Engineer - Manatal Co LTD | Career Page`). `runs/` is gitignored. Other runs for checks: `runs/20261024-181218-careers-page.com-05ce` (Product Analyst, Manatal), `runs/20261024-191816-careers-page.com-6f44` (Manatal internship), `runs/20261024-181408-careers-page.com-d784` (`/alljobs/job/L7X8R6RX`, title `... - Remote Career | Career Page`: slug not in title → unresolved).
- Docs: `rules/README.md` sections "Do not guess" (describes the old template+slug rule; "If the template is not found or the slug differs, the rule outputs no `company`"), "How fields are extracted" ("A field whose selector matches nothing… is left out"), "`postprocess`", "The extracted vacancy document" (front matter template, key order), "Examples and tests", "`expected.md`". `contract/README.md` "Absent values" mentions #22. `README.md` status.json extraction table.
- ADRs: `specs/decisions/10-site-parsing-rule-format.md` (accepted, do not edit; "A field that the site does not show is left out of the rule and of the output"), `8-vacancy-output-contract.md`, `12-llm-fallback-extraction.md` (header with `Issue:`/`Affects:`/`Narrows:` lines — copy that header style). Template `.claude/templates/sdd/adr.md`.

## Patterns

- Example: folder `examples/<site>/<company>-<role>/` with `page.html` (unedited byte copy; `.gitattributes` has `vacancy-reader/examples/** -text`) and `expected.md` (LF, one final newline, reviewed against the page — fix the reference to follow the page, never the rule). Append to `index.yaml`, bump `count`. Draft with `npm run rules:check -- <site>`.
- Tests: `node:test` + `node:assert/strict` via `tsx --test "src/**/*.test.ts"`, next to the code; header comment listing scenarios `// - case -> outcome`; temp dirs via `mkdtemp`; test names `"<situation>: <outcome>"`.

## Conventions

- Deterministic output: front matter order = insertion order in `render.ts`; contract order asserted by `KEY_ORDER`.
- Optional fields are omitted from `vacancy.md`, always present as `null` in `vacancy.json`.
- Never write a placeholder value ("unknown"): `unresolved` is a separate key, not a value.
- `og:site_name` ("Manatal") is the platform, never the company source.
- Accepted ADRs are never edited; new ADR file `specs/decisions/22-<slug>.md`.
- Imports with `.ts` extensions, `import type` for types; `strict`, `noUncheckedIndexedAccess`.
- Docs in English, plain short sentences, fields in tables.
