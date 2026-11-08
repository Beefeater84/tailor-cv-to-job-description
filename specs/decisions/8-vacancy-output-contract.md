# Vacancy output contract for the CV writer

Status: accepted
Date: 2026-10-26
Issue: Vacancy output contract for the CV writer (#8)
Affects: CV and cover letter writer (#4), candidate profile contract and CV block registry (#30), research of CV and cover letter best practices (#29), tool for adding vacancy examples (#14), vacancy reader runs page (#18); vacancy reader

## Context

The vacancy reader writes `vacancy.md`: Markdown with YAML front matter, made for a human to read and review. It leaves empty fields out, and its format follows the examples (`expected.md`), not the needs of a program. The writer needs input it can rely on: fixed keys, a clear meaning for a missing value, a version, and a check that fails before a bad vacancy reaches it. The candidate profile (#30) is the writer's second input and needs the same kind of rules.

## Decision

### The vacancy contract

- File: `runs/<job-id>/vacancy.json`, written by the extraction step next to `vacancy.md`, for the rule path and the LLM path. `vacancy.md` stays the human document and does not change.
- Schema: `vacancy-reader/contract/vacancy.schema.json`, a JSON Schema kept in the module. Fields, key order and formats: `vacancy-reader/contract/README.md`.
- v1.0 has `schema_version`, source metadata (`source_url`, `site`, `extracted_by`, `fetched_at`) and the extracted fields (`title`, `company`, `hiring_manager`, `company_description`, `tags`, `description`).
- Every key is present. `null` means no value. `description` is never `null`. `tags` is never `[]`.
- The reader validates the contract strictly before it writes any file. An invalid contract makes the extraction `failed`, and no `vacancy.json` or `vacancy.md` is left.
- Deterministic output: `fetched_at` is the fetch end time, and the file is two-space JSON with a final newline. The same fetch and the same rule give the same bytes.

### Rules for the writer

A value that is missing from the contract is never invented, and a model never derives it silently. With `title` or `company` missing, the writer asks the user. With `hiring_manager`, `company_description` or `tags` missing, it writes without them and does not ask. An `extracted_by: llm` contract is shown to the user once for confirmation before writing. The rules for each field are in `vacancy-reader/contract/README.md`.

### Common rules for writer input contracts

These rules apply to every input contract of the writer: the vacancy contract and the candidate profile (#30).

- JSON, plus a JSON Schema kept in the module that produces it.
- `schema_version` is `MAJOR.MINOR`. A new optional field is a minor version. A breaking change is a major version.
- The producer validates strictly and fails loudly.
- The consumer checks the major version only and ignores unknown keys.
- The contract carries its source metadata (`source_url`, or the source of the data).
- Every field of the version is present. `null` means no value. A missing key means that the field is not in this version.

## Consequences

- The writer (#4) reads `vacancy.json`, not `vacancy.md`, and follows the consumer rules.
- The candidate profile contract (#30) follows the common rules.
- Splitting the vacancy text into responsibilities and requirements comes later as optional minor-version fields, after the research of CV and cover letter best practices (#29).
- The tool for adding vacancy examples (#14) and the vacancy reader runs page (#18) can show `vacancy.json` of a run. `expected.md` stays the reference for rule tests.
- A new field or a changed field of the vacancy needs a change to the schema, the builder and `contract/README.md`, and a version bump.
