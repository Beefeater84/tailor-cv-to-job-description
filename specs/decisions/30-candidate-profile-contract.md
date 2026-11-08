# Candidate profile contract: one self-contained JSON with ids, origins and two-step validation

Status: accepted
Date: 2026-10-31
Issue: Candidate profile contract (#30)
Affects: CV reader for the index CV (#31), CV reader for an uploaded PDF (#32), profile from the chat (#48), validator (#43), writer design (#34); tailor-cv

## Context

The writer has two inputs: the vacancy contract (`decisions/8-vacancy-output-contract.md`) and the candidate profile. `tailor-cv/profile-data.md` lists what the writing rules need from the profile (blocks P-01 to P-11), but not its format: the ids of jobs, projects and achievements, how the origin of a fact is written, and how the parts link to each other. Several tasks produce the profile: the CV reader for the index CV (#31), the CV reader for an uploaded PDF (#32) and the profile from the chat (#48). The writer (#34) and the validator (#43) read it. All of them need one contract. ADR 8 already sets the common rules for writer input contracts.

## Decision

### Format

- One JSON file per candidate. Schema: `tailor-cv/contract/profile.schema.json` (JSON Schema draft-07). Fields and examples: `tailor-cv/contract/README.md`. Code: `tailor-cv/src/contract/` (`validateProfile`, `ProfileError`, `serializeProfile`).
- The ADR 8 rules apply. `schema_version` is `MAJOR.MINOR` and starts at `"1.0"`. Every key is present. `null` means no value. Unknown keys are rejected (`additionalProperties: false`). The producer validates strictly, and the consumer checks the major version only.
- Top-level keys: `schema_version`, `meta` (sources, updated time), `person` (P-01), `search` (P-02), `contacts` (P-03), `skills` (P-04), `achievements` (P-05), `jobs` (P-06), `projects` (P-07), `period_notes` (P-07), `languages` (P-08), `education` (P-09), `hobbies` (P-10), `decisions` (P-11).
- The profile is self-contained: all the text of jobs, projects and achievements is in the file, not behind a link to the source.
- A job is a list of roles with periods (a promotion is a new role) and the projects inside the job. A job with no named projects gets one implicit project. Projects outside jobs are a separate list. Project context and role description are Markdown. An achievement is a unit with fields: result, number, number context, measure, own or team contribution, own part, how, and AI involvement.
- `period_notes` holds the context notes for periods between jobs that the candidate gives (for example parental leave). A note can exist without a project, so it is not a field of a project.
- The candidate's decisions (P-11) are kept in the profile, because they are facts about the candidate that later CVs reuse.

### Ids and links

- Ids are strings `<prefix>-[a-z0-9]+(-[a-z0-9]+)*`. Prefixes: `src` (source), `job`, `prj` (project inside or outside jobs), `ach`, `skill`, `note`, `dec`. Ids are unique in the whole profile.
- Links are by id: an achievement links to exactly one project; a skill lists its evidence (jobs and projects); an origin of kind `source_cv` links to a source in `meta.sources`; a decision lists the units it covers.

### Origin

- One origin per unit (job, project, achievement, skill, language, qualification, certification, hobby, period note) and one for each of `person`, `search`, `contacts`. There is no origin per field. A decision record has its own date and no origin.
- `origin` = `{ kind, source, quote, date }`. For `source_cv`, `source` and `quote` are filled and `date` is `null`. For `candidate` and `agent_confirmed`, `date` (`YYYY-MM-DD`) is filled and `source` and `quote` are `null`. The schema enforces these pairs.

### Dates and absent values

- Periods are `YYYY` or `YYYY-MM`, and an end can also be `present`. Days are `YYYY-MM-DD` and times are ISO 8601 date-time.
- Lists are `null` or non-empty, never `[]`. Every list block, even the required ones (`jobs`, `achievements`, `skills`), may be `null`: an incomplete profile is valid while the agent asks for the missing facts.

### Validation

- Step 1 is the schema: shapes, the version, id prefixes, date patterns, formats and origin pairs.
- Step 2 is the references, run only when step 1 passes: unique ids, achievement → project, skill → evidence, origin → source, decision → refs.
- A failure lists every violation of the step, with its path.

### Producers outside this repository

The schema has a stable `$id` (`https://github.com/Beefeater84/tailor-cv-to-job-description/tailor-cv/contract/profile.schema.json`) and does not depend on the code of this module. `index-cv` may therefore produce the profile directly, validate it with the schema and repeat the reference checks.

### Not in the profile

The coverage report of a reader, the reader version, the token size and the instructions for the LLM are left to the CV reader for the index CV (#31) and the CV reader for an uploaded PDF (#32). The values `profile-data.md` lists as computed are not stored. Where the profile file is stored is decided in "Profile from the chat" (#48).

## Consequences

- The CV reader for the index CV (#31), the CV reader for an uploaded PDF (#32) and the profile from the chat (#48) write this contract and validate it with `validateProfile` before they write the file.
- The validator (#43) and the writer (#34) read facts only through the profile ids and origins. They check the backing of a skill and the records of the candidate's decisions against it.
- A new field or a changed field needs a change to the schema, the types in `tailor-cv/src/contract/types.ts`, `tailor-cv/contract/README.md` and the example, and a version bump.
- `tailor-cv/` has code now: `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`.
