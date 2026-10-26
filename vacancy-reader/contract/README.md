# Vacancy output contract

The vacancy contract is the machine-readable vacancy that the vacancy reader gives to the next stages, first of all to the CV and cover letter writer (#4). This file describes it. The decision is recorded in `specs/decisions/8-vacancy-output-contract.md`.

## Input and output

- **Input:** the saved `page.html` of a succeeded fetch, plus the site rule (`rules/<site>.ts`), or the LLM fallback for a site without a rule. See [`../README.md`](../README.md) and [`../rules/README.md`](../rules/README.md).
- **Output:** `runs/<job-id>/vacancy.json`. The extraction step (`extractJob`) writes it next to `vacancy.md`, after a successful extraction.
- **Schema:** [`vacancy.schema.json`](vacancy.schema.json) (JSON Schema draft-07). The code is in `src/contract/`: `buildContract`, `validateContract` and `serializeContract`.

`vacancy.md` is the human document. It is not the contract and does not change.

## Fields (v1.0)

Every key is required. The keys come in this order:

| Key | Type | Meaning |
| --- | --- | --- |
| `schema_version` | `"1.0"` | Contract version, `MAJOR.MINOR`. |
| `source_url` | string, URI | The requested vacancy URL (the job's `url`, not the URL after redirects). |
| `site` | string | Site key: the host without `www.`, lowercased. |
| `extracted_by` | `"rule"` or `"llm"` | How the fields were extracted. `llm` is unverified. |
| `fetched_at` | string, ISO date-time | When the fetch ended (`finishedAt` of the fetch in `status.json`). |
| `title` | string or `null` | Job title, plain text, one line. |
| `company` | string or `null` | Hiring company name, plain text, one line. |
| `hiring_manager` | string or `null` | Hiring manager or recruiter, plain text. |
| `company_description` | string or `null` | Text about the employer, Markdown. |
| `tags` | non-empty list of strings, or `null` | Short labels shown for the vacancy. Never `[]`. |
| `description` | non-empty string | The vacancy text, Markdown. Never `null`. |

The meaning of each field, and how it is taken from a page, is in [`../rules/fields.md`](../rules/fields.md). Text values are trimmed. A string value is never empty: an empty value is `null`.

The file is `JSON.stringify(contract, null, 2)` with a final newline. `fetched_at` is the fetch time, not the extraction time, so the same fetch and the same rule always give the same bytes.

## Absent values

- Every key of the version is always present.
- `null` means that the rule or the model got no value. Example: the company is not on the page as a field, and the rule does not take it from the page title (see taking the company from the page title (#22)).
- A missing key means that the field is not in this version.
- `vacancy.md` still leaves empty fields out, because it is not the contract.

## Versioning and validation

- `schema_version` is `MAJOR.MINOR`. A new optional field is a new minor version. A breaking change (a removed or renamed key, a changed type or meaning) is a new major version.
- The reader validates strictly against the schema before it writes anything. An invalid contract fails the extraction loudly: `extraction.status` is `failed`, the error lists every violation, and neither `vacancy.json` nor `vacancy.md` is left in the run folder.
- A consumer checks only the major version. It ignores keys it does not know, which come from a newer minor version.

## Rules for the consumer

These rules are for the CV and cover letter writer (#4). A value that is missing from the contract is never invented, and a model never derives it silently.

- `title` is `null`: ask the user.
- `company` is `null`: ask the user. If the user skips the question, write without naming the company.
- `hiring_manager` is `null`: use a neutral greeting. Do not ask.
- `company_description` is `null`: write without a company paragraph. Do not use the model's own knowledge of the company.
- `tags` is `null`: write without them. Take the skills from `description`.
- `extracted_by` is `llm`: accept the contract, but before writing show the user what was extracted (title, company, the start of the description) once, and ask them to confirm or correct it. The result is unverified. With `rule` there is no question.

## Planned

- Splitting the vacancy text into responsibilities and requirements, as optional fields in a minor version. This waits for the research of CV and cover letter best practices (#29).
