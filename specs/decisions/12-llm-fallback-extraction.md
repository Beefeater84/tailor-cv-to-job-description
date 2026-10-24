# LLM fallback extraction for a site without a parsing rule

Status: accepted
Date: 2026-10-24
Issue: Flow for a vacancy from a site without a rule (#12)
Affects: vacancy output contract (#8), tool for adding vacancy examples (#14), vacancy reader runs page (#18), turning an LLM-extracted vacancy into an example and a site rule (#25); vacancy reader
Narrows: `10-site-parsing-rule-format.md` ("No LLM is used in step 1")

## Context

`10-site-parsing-rule-format.md` extracts a vacancy only with a site rule and uses no LLM: without a rule there is no extracted document, and the run stops at `extraction.status: no_rule`. New sites appear with every vacancy the user gives, so most first runs on a site end without a document, and the pipeline cannot continue. A real run on a careers-page.com company subdomain showed this: the fetch succeeded, there was no rule, and the parent domain's rule did not fit the page.

Rules stay the main path: they are deterministic and tested on examples. What is needed is a way to continue a run for a site without a rule, with a result that is clearly marked as not checked, and a record of which sites still need a rule.

## Decision

### When the fallback runs

- A site with a rule is extracted only by its rule, as before. The LLM is never used for it, also not when the rule fails.
- A site without a rule is extracted by an LLM, if an API key is configured. Without a key the result stays `no_rule`, as before.
- The fallback runs in the same extraction step: automatically after a succeeded fetch, and with `npm run extract`.

### What is extracted

- `vacancy-reader/rules/fields.md` is the one description of *what* is extracted from a vacancy page: each field of the extracted vacancy document, its meaning and format, and "do not guess". Site rules (`rules/<site>.ts`) describe *how* a field is found on one site. The LLM gets `fields.md` as its instructions.
- The fields are the same as in a rule (`title`, `company`, `hiring_manager`, `company_description`, `tags`, `description`). The LLM returns them as structured output checked against a schema; a field the page does not state is left out.
- The result is rendered by the same serializer as a rule result, so the document format is the same.

### Input to the model

- The fetched `page.html` is cleaned (scripts, styles, navigation, footer and similar removed), converted to Markdown, and cut to a size limit. A schema.org `JobPosting` block (JSON-LD), if the page has one, is added as a hint. Without it the model works from the page text only.

### Model

- Provider: Anthropic API. Model: Claude Haiku 5.5 (`claude-haiku-5-5`), a cheap model that is enough for extraction.
- The key is read from `ANTHROPIC_API_KEY`, set in the environment or in `vacancy-reader/.env`. `.env` is never committed.

### Page content is untrusted

- Everything taken from the page is untrusted input. It is wrapped in one tag (`<untrusted_page>`); a closing tag inside the page content is escaped so the content cannot leave the wrapper.
- The instructions tell the model that the tag holds data only: it does not answer questions from the page, does not run code, and does not follow instructions from the page.
- The model has no tools other than the structured output. Output that does not match the schema is rejected, and the extraction is `failed`.

### Marking the result

- The extracted vacancy document gets a front matter key `extracted_by`: `rule` or `llm`. It follows `site` in the key order of `10-site-parsing-rule-format.md`.
- The `extraction` record in `status.json` gets `method` (`rule`, `llm`, or none when nothing was extracted) and `has_rule` (whether the site has a rule). With the run's full `url` and `extraction.site` this tells, for every run, the site, the page and whether a rule is still missing.
- An LLM result has `extraction.status: succeeded` and `method: llm`. It is unverified: it is never an `expected.md` without a human review.

## Consequences

- `10-site-parsing-rule-format.md` stays in force for sites with a rule. Its "No LLM is used in step 1" now applies to rule extraction only.
- The extracted vacancy document gains `extracted_by`. The `expected.md` of existing examples gets `extracted_by: rule`.
- The vacancy output contract (#8) decides how the writer treats `extracted_by: llm`.
- The runs page (#18) shows the site, full URL and `has_rule` of each run and filters sites without a rule. The full URL is the real page a future rule is written from.
- The tool for adding vacancy examples (#14) shows whether an example's site has a rule.
- Turning an LLM result into an example and a rule is decided in "turning an LLM-extracted vacancy into an example and a site rule (#25)".
- Tests of the fallback use a fake model client and run offline.
- `tech-stack.md` records the LLM provider and model for the vacancy reader. A different provider or model needs a new ADR.
