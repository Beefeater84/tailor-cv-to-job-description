# Context: #12 Flow for a vacancy from a site without a rule

All paths under `vacancy-reader/` unless noted. Decision: `specs/decisions/12-llm-fallback-extraction.md` (read it first).

## Code map

- `src/extract.ts` — `extractJob(id, runsDir = RUNS_DIR): Promise<ExtractionResult>` — integration point. Throws if job missing / not `succeeded`. `loadRule(site)` null → `removeStale()` + `no_rule` (lines ~39-41): fallback goes here. Else reads `page.html`, `extractDocument`, writes `vacancy.md`. `catch` → `failed`. Always `writeStatus({...job, extraction})`. Local helpers `removeStale` (unlink, ignore ENOENT), `finish` (adds `finishedAt`). Const `VACANCY_FILE = "vacancy.md"`.
- `src/fetch/jobs.ts` — `ExtractionResult { status: "succeeded"|"no_rule"|"failed"; site: string|null; rule: string|null; file: string|null; error: string|null; finishedAt: string }` → add `method`, `has_rule`. `JobStatus { id, url, finalUrl, httpStatus, status, error, createdAt, startedAt, finishedAt, pid, options, extraction? }`. `RUNS_DIR`, `MODULE_ROOT`, `jobDir(id, runsDir)`, `getJob(id, runsDir)`, `writeStatus(status, runsDir)` (atomic temp+rename, Windows retry), `listJobs()` (no runsDir param).
- `src/fetch/worker.ts` — `run(id)`: fetch → `page.html` → final status → if `succeeded`, `extractJob(id)` (lines ~61-71), logs `extraction <status>` to `worker.log`. Extraction errors never change the fetch status. Key must be available here (worker is a detached `node --import tsx` process started by `src/fetch/start.ts`).
- `src/cli.ts` — `main(argv): Promise<number>`, `switch` over `fetch|status|jobs|match|extract|rules:check`, `node:util parseArgs`, exit codes 0/1/2, `USAGE` at top. `extract` case lines ~126-144: `no_rule` prints error, returns 1; success prints `site:`, `rule:`, `file:`.
- `src/rules/render.ts` — `renderDocument(fields: ExtractedFields, source: DocumentSource {sourceUrl, site}): string`. Front matter order `source_url, site, title, company, hiring_manager, tags` (`tags` flow seq, `yaml` Document, `lineWidth: 0`). Sections `## Company` (if `company_description`), `## Job description`. Output via `normalizeDocument`.
- `src/rules/types.ts` — `ExtractedFields {title?, company?, hiring_manager?, tags?, company_description?, description}`, `SiteRule`, `PostprocessContext`, `defineRule`. Field doc comments = base for `rules/fields.md`.
- `src/rules/extract.ts` — `extractFields(rule, html, sourceUrl): ExtractedFields`; linkedom `parseHTML`; private `ALWAYS_REMOVED = "script, style, noscript, template"`, `collapse`, `selectAll`, `shortField`, `resolveLinks` (absolute hrefs), `longField`; `class ExtractionError extends Error` (`override name`).
- `src/rules/markdown.ts` — `elementsToMarkdown(elements: Element[]): string` (turndown, ATX, `-` bullets, fenced code; heading shift so top is `###`; `tidyMarkdown`).
- `src/rules/normalize.ts` — `normalizeDocument(text)`, `lineDiff`, `formatDiff`.
- `src/rules/examples.ts` — `extractDocument(rule, html, sourceUrl)` (= `extractFields` + `renderDocument`, site from URL); `readExamples()`, `listExamples(site)`, `runExample` (`todo|pass|fail|error`), `EXAMPLES_DIR`.
- `src/rules/load.ts` — `RULES_DIR`, `SITE_KEY_PATTERN`, `rulePath(site)`, `noRuleMessage(site)` → `"no rule for <site>"`, `loadRule(site): Promise<SiteRule|null>`.
- `src/rules/index.ts` — barrel re-exporting `src/rules`.
- `src/site.ts` — `siteKey(url: URL): string` (host, lower case, no `www.`).
- `src/match.ts` — `matchUrl(value): Promise<UrlMatch {url, site, rulePath|null}>`.
- `rules/careers-page.com.ts` — the only rule. Example: `examples/careers-page.com/<company>-<role>/{expected.md,page.html}`; `examples/index.yaml`.
- Real no-rule run with JSON-LD `JobPosting`: `runs/20261024-181727-yoailabs.careers-page.com-63fd/` (local only, `runs/` is git-ignored; do not commit it, do not use it in tests).
- `src/extract.test.ts` — temp runs dir (`mkdtemp(tmpdir())`, `after(rm)`), helper `makeJob(id, url, html, state)`; test "site without a rule: no_rule and no vacancy.md" (lines ~60-68) changes with this task.
- `src/rules/examples.test.ts` — one test per example, `t.todo` when no rule.
- Docs: `README.md` ("How the module works", "Planned" line ~32, `extract` section + exit codes ~107-124, "Job statuses", `runs/` layout + `status.json` and `extraction` tables ~160-195); `rules/README.md` ("Do not guess" ~61-63, "Matching a URL to a rule" ~75, "The extracted vacancy document", "Planned" ~150); root `CLAUDE.md` "Vacancy URLs"; `specs/tech-stack.md` (LLM "not chosen yet"); `specs/AGENT.md` topic table.

## Patterns to follow

- New step module over the run folder — like `src/extract.ts` (`runsDir = RUNS_DIR` default param, header comment).
- Pure helper module — like `src/rules/render.ts`, `src/site.ts`.
- Error class — like `ExtractionError` in `src/rules/extract.ts`.
- Tests — like `src/extract.test.ts` (header comment listing cases, temp dir, never the real `runs/`).
- CLI command output / README command section — like `match` / `extract` in `src/cli.ts` and `README.md`.

## Conventions

- TypeScript strict, `noUncheckedIndexedAccess`, `verbatimModuleSyntax` (`import type`), `allowImportingTsExtensions` (imports end in `.ts`). Every exported function has a JSDoc comment.
- Tests: `node:test` + `node:assert/strict`, `*.test.ts` next to the source, run by `tsx --test "src/**/*.test.ts"`. Offline: no network, no API key. The model client must be injectable; tests pass a fake.
- No config module and no env access exist yet. `ANTHROPIC_API_KEY` is the only new env var; load `vacancy-reader/.env` if present (e.g. Node's `process.loadEnvFile`), environment wins. Never read `.env.prod`. `.env` must be git-ignored; `.env.example` is committed with an empty value.
- Model id: `claude-haiku-5-5`. Use the official Anthropic TypeScript SDK (`@anthropic-ai/sdk`); load the `claude-api` skill for current structured-output / SDK usage before writing the client.
- Errors: plain `Error` messages; callers use `error instanceof Error ? error.message : String(error)`. Check `ErrnoException` codes explicitly.
- `status.json` keys camelCase except where the ADR names them (`has_rule` as decided); status values snake_case; front matter keys snake_case.
- Extraction never changes the fetch `status`. `vacancy.md` written only on success; stale one removed otherwise.
- `examples/**` bytes are kept (`.gitattributes`); the only allowed change is adding `extracted_by: rule` to `expected.md`.
- Everything in English. Commits `feat(#12): ...` / `docs(#12): ...` with the `Co-Authored-By` trailer.

## Gaps found during implementation
- Implementers have no Skill tool: the `claude-api` skill is not available to them. SDK usage was taken from the installed `@anthropic-ai/sdk` 1.3.0 type definitions (`resources/messages/messages.d.ts`).
- The ADR is at the repo root: `specs/decisions/12-llm-fallback-extraction.md`, not under `vacancy-reader/`.
