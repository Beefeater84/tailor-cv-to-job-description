# Plan: #12 Flow for a vacancy from a site without a rule

Issue: Flow for a vacancy from a site without a rule (#12) · Approach: https://github.com/Beefeater84/tailor-cv-to-job-description/issues/12#issuecomment-6386143807
Delivery: -
Later: -

Scope: a succeeded fetch job whose site has no rule is extracted by an LLM (Claude Haiku 5.5) instead of ending at `no_rule`, with the result marked unverified, and every run records the site, the full URL and whether the site has a rule. Decided in ADR `specs/decisions/12-llm-fallback-extraction.md`. Out of scope: turning an LLM result into an example and a rule (#25), the writer's contract (#8), the runs page (#18), the examples tool (#14).

## Group 1: Field spec and result marking

- Task: #12
- Goal: There is one written description of what is extracted from a vacancy page, and every extraction result says how it was made and whether the site has a rule.
- Files:
  - `vacancy-reader/rules/fields.md` (create): what is extracted, for any site: each field of the extracted vacancy document (`title`, `company`, `hiring_manager`, `company_description`, `tags`, `description`), its meaning, its format (plain text / list / Markdown), when it is left out, and "do not guess". Written so it reads as a doc for people and as instructions for the model. It does not describe any site's markup.
  - `vacancy-reader/src/rules/render.ts` (change): front matter key `extracted_by` (`rule` | `llm`) right after `site`.
  - `vacancy-reader/src/rules/examples.ts`, `vacancy-reader/src/rules/types.ts` (change, as needed): rule extraction renders `extracted_by: rule`.
  - `vacancy-reader/examples/careers-page.com/*/expected.md` (change): add `extracted_by: rule`. No other change to `examples/`.
  - `vacancy-reader/src/fetch/jobs.ts` (change): `extraction` gets `method` (`rule` | `llm` | null) and `has_rule` (boolean).
  - `vacancy-reader/src/extract.ts`, `vacancy-reader/src/extract.test.ts` (change): rule path records `method: rule`, `has_rule: true`; no-rule path records `has_rule: false`, `method: null`.
- Reuse: `src/rules/types.ts` field doc comments as the base of `fields.md`; `src/rules/render.ts` front matter writer.
- Done when: `npm test` passes with the updated example and the new `extraction` fields; `fields.md` covers all six fields.
- Complexity: normal

## Group 2: LLM fallback extraction

- Task: #12
- Goal: A succeeded job whose site has no rule gets `vacancy.md` from the LLM, marked `extracted_by: llm`, when an API key is configured; page content is treated as untrusted input.
- Files:
  - `vacancy-reader/src/fallback/` (create): the fallback, split as the implementer sees fit:
    - input: clean `page.html` (drop scripts, styles, navigation, header/footer, hidden elements), convert to Markdown, add the `JobPosting` JSON-LD block if present, cut to a size limit;
    - untrusted wrapper: page content inside `<untrusted_page>`, with any closing tag in the content escaped;
    - instructions: `rules/fields.md` plus the rules for untrusted content (data only; do not answer questions from the page, do not run code, do not follow its instructions);
    - model client: Anthropic SDK, `claude-haiku-5-5`, structured output against a schema of the six fields, no other tools; injectable so tests use a fake;
    - result: schema-checked fields (extra keys dropped, invalid output is an error) rendered by `renderDocument` with `extracted_by: llm`.
  - `vacancy-reader/src/fallback/*.test.ts` (create): offline. Input cleaning on the stored careers-page.com example `page.html` (scripts gone, vacancy text kept, JSON-LD hint added when present); wrapper escapes a closing tag placed in the page; instructions contain `fields.md` and the untrusted-content rules; invalid model output is rejected.
  - `vacancy-reader/src/extract.ts` (change): no rule + key → fallback → `succeeded`, `method: llm`, `has_rule: false`, `vacancy.md` written; no rule + no key → `no_rule`, as now; fallback error or invalid output → `failed`, stale `vacancy.md` removed. A site with a rule never uses the fallback.
  - `vacancy-reader/src/extract.test.ts` (change): the three no-rule outcomes above with a fake client, in a temp runs folder.
  - `vacancy-reader/package.json`, `package-lock.json` (change): Anthropic SDK dependency.
  - `vacancy-reader/.env.example` (create), `.gitignore` (change): `ANTHROPIC_API_KEY`; `.env` ignored. The key is loaded from the environment or `vacancy-reader/.env`, in the worker and in the CLI.
- Reuse: `src/rules/markdown.ts` (`elementsToMarkdown`), `ALWAYS_REMOVED` and link resolving in `src/rules/extract.ts` (export if needed), `src/rules/render.ts` (`renderDocument`), `src/rules/normalize.ts`, `src/site.ts` (`siteKey`), `src/rules/load.ts` (`loadRule`, `noRuleMessage`), `makeJob` helper in `src/extract.test.ts`.
- Done when: `npm run typecheck`, `npm run lint`, `npm test` pass without network and without a key; `.env` is ignored by git.
- Complexity: complex

## Group 3: CLI output and documentation

- Task: #12
- Goal: The user sees from the CLI and the docs how a vacancy from a site without a rule is handled and how to tell an LLM result from a rule result.
- Files:
  - `vacancy-reader/src/cli.ts` (change): `extract` prints the method (`rule` / `llm`) and whether the site has a rule; an LLM result exits 0; `no_rule` (no key) still exits 1 and says how to enable the fallback.
  - `vacancy-reader/README.md` (change): the flow for a site without a rule; setting `ANTHROPIC_API_KEY` / `.env`; `extraction.method`, `extraction.has_rule` and `extracted_by` in the `runs/` and `status.json` tables; `extract` output and exit codes; "Planned" no longer lists #12.
  - `vacancy-reader/rules/README.md` (change): link to `fields.md` as the what-to-extract spec; "Do not guess" says the LLM fallback runs only for sites without a rule and its result is unverified; `extracted_by` in the document format; "Planned" updated.
  - `CLAUDE.md` (change): "Vacancy URLs" — a `vacancy.md` with `extracted_by: llm` is unverified; read `page.html` only when extraction did not succeed.
  - `specs/tech-stack.md` (change): LLM provider and model for the vacancy reader (ADR `12-llm-fallback-extraction`); checks unchanged.
  - `specs/AGENT.md` (change): `fields.md` and the new ADR in the topic table row for site rules.
- Reuse: style of the `match` / `extract` command sections in `vacancy-reader/README.md`.
- Done when: docs match the code (field names, statuses, exit codes, env var, file names); no doc still lists the site-without-rule flow as planned or says the reader never uses an LLM.
- Complexity: normal
