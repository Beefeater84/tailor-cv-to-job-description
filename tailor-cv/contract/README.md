# Candidate profile contract

The candidate profile is the only source of facts about the candidate for the CV writer and the validator. This file describes its machine-readable form. What each block holds and which writing rules use it is in [`../profile-data.md`](../profile-data.md) (P-01 to P-11). The decision is recorded in `specs/decisions/30-candidate-profile-contract.md`.

## Input and output

- **Producers:** the CV reader for the index CV (#31), the CV reader for an uploaded PDF (#32) and the profile from the chat (#48). The `index-cv` repository may also write the profile directly (see "External producers").
- **Consumers:** the writer (writer design (#34)) and the validator (#43).
- **Schema:** [`profile.schema.json`](profile.schema.json) (JSON Schema draft-07), `$id` `https://github.com/Beefeater84/tailor-cv-to-job-description/tailor-cv/contract/profile.schema.json`.
- **Example:** [`examples/profile.example.json`](examples/profile.example.json), an invented candidate.
- **Code:** `src/contract/`: `validateProfile`, `ProfileError`, `serializeProfile`, `PROFILE_VERSION`, `PROFILE_SCHEMA` and the TypeScript types (`CandidateProfile` and its parts).

Where the profile file is stored is decided in "Profile from the chat" (#48).

## Fields (v1.0)

Every key is required. The top level:

| Key | Block | Type | Holds |
| --- | --- | --- | --- |
| `schema_version` | - | `"1.0"` | Contract version, `MAJOR.MINOR`. |
| `meta` | - | object | `sources`: the documents and chats the profile was read from (`id` `src-…`, `kind` `index_cv` / `file` / `chat`, `location`, `read_at`); `updated_at`. |
| `person` | P-01 | object | `name`, `title`, `level`, `origin`. |
| `search` | P-02 | object | `target_roles`, `apply_locations`, `relocation`, `region`, `work_formats`, `current_city`, `time_zone`, `origin`. |
| `contacts` | P-03 | object | `phone`, `email`, `linkedin`, `github`, `origin`. |
| `skills` | P-04 | list or `null` | `id` `skill-…`, `name`, `kind`, `evidence` (ids of jobs and projects), `origin`. |
| `achievements` | P-05 | list or `null` | `id` `ach-…`, `project` (one project id), `result`, `number`, `number_context`, `measure`, `contribution` (`own` / `team`), `own_part`, `how`, `ai_involved`, `origin`. |
| `jobs` | P-06 | list or `null` | `id` `job-…`, `company`, `industry`, `market_types`, `roles` (`title`, `period`, `description`, `duties`), `projects` (`id` `prj-…`, `name`, `context`, `role`, `period`, `origin`), `origin`. |
| `projects` | P-07 | list or `null` | Projects outside jobs: `id` `prj-…`, `name`, `kind` (`own`, `open_source`, `study`, `vacancy_task`), `context`, `period`, `result`, `link`, `origin`. |
| `period_notes` | P-07 | list or `null` | Context notes for periods between jobs, only when the candidate gives one: `id` `note-…`, `period`, `note`, `origin`. |
| `languages` | P-08 | list or `null` | `name`, `level` (CEFR `A1`…`C2` or `native`), `origin`. |
| `education` | P-09 | object | `qualifications` (`title`, `institution`, `year`, `origin`) and `certifications` (`name`, `issuer`, `year`, `origin`), each a list or `null`. |
| `hobbies` | P-10 | list or `null` | `name`, `relevance`, `origin`. |
| `decisions` | P-11 | list or `null` | `id` `dec-…`, `date`, `kind` (`confirmation` / `override`), `rule` (for example `GEN-12`), `subject`, `warning`, `refs` (ids of the units it covers). |

The description of every field is in the schema. What `profile-data.md` lists as computed (total years, gaps, areas of work, the most recent job) is not stored.

Formats:

- **Ids:** `<prefix>-<lowercase letters, digits and hyphens>`, for example `prj-checkout`. Prefixes: `src`, `job`, `prj`, `ach`, `skill`, `note`, `dec`. Ids are unique in the whole profile. Projects inside jobs and outside jobs share the `prj` prefix.
- **Periods:** `{ "start": "YYYY" | "YYYY-MM", "end": "YYYY" | "YYYY-MM" | "present" }`. The dates of a job come from the periods of its roles.
- **Days** (`origin.date`, `decisions[].date`): `YYYY-MM-DD`. **Times** (`meta`): ISO 8601 date-time.
- **Markdown:** a role `description` and a project `context`. All other text is plain.
- **Origin:** one per unit (a job, a project, an achievement, a skill, a language, …), not per field. `person`, `search` and `contacts` have one origin each.

| `origin.kind` | Meaning | `source` | `quote` | `date` |
| --- | --- | --- | --- | --- |
| `source_cv` | Read from a source in `meta.sources` | id of the source | the place it comes from | `null` |
| `candidate` | An answer of the candidate in the chat | `null` | `null` | the day |
| `agent_confirmed` | A proposal of the agent the candidate confirmed or corrected | `null` | `null` | the day |

The file is `JSON.stringify(profile, null, 2)` with a final newline (`serializeProfile`).

## Links between objects

The profile is self-contained: all the text of jobs, projects and achievements is in the file. Objects link to each other by id:

- an achievement links to exactly one project, inside a job or outside jobs;
- a skill lists the jobs and projects that back it (`evidence`, not printed in the CV);
- an origin of kind `source_cv` links to a source in `meta.sources`;
- a decision lists the units it covers (`refs`).

```json
{
  "meta": {
    "sources": [{ "id": "src-cv-2026", "kind": "index_cv", "location": "https://example.com/cv.pdf", "read_at": "2026-10-20T09:15:00Z" }],
    "updated_at": "2026-10-22T14:05:00Z"
  },
  "jobs": [{
    "id": "job-example-corp",
    "company": "Example Corp",
    "projects": [{ "id": "prj-checkout", "name": "Checkout redesign", "…": "…" }],
    "origin": { "kind": "source_cv", "source": "src-cv-2026", "quote": "Example Corp — Senior Frontend Engineer", "date": null },
    "…": "…"
  }],
  "achievements": [{ "id": "ach-checkout-conversion", "project": "prj-checkout", "result": "Raised checkout conversion", "…": "…" }],
  "skills": [{ "id": "skill-typescript", "name": "TypeScript", "evidence": ["job-example-corp", "prj-checkout"], "…": "…" }]
}
```

The bullets of a job use only the achievements linked to the projects of that job. A project outside jobs shows its achievements in its own entry. The summary may use achievements of any project.

## Absent values

- Every key of the version is always present.
- `null` means no value: the source does not have it and the candidate has not given it yet. A string is never empty and a list is never `[]`: an empty value is `null`.
- A profile with missing facts is valid. Even the required blocks (`jobs`, `achievements`, `skills`) may be `null` while the agent is still asking. The writer asks for what a rule needs (GEN-03) and adds the answer, never fills it in itself.
- A missing key means that the field is not in this version.

## Versioning and validation

- `schema_version` is `MAJOR.MINOR`. A new optional field is a new minor version. A breaking change (a removed or renamed key, a changed type or meaning) is a new major version.
- `validateProfile(value)` checks in two steps and throws `ProfileError` with every violation of the step that failed:
  1. **Schema:** missing and unknown keys, the version, types, enums, id prefixes, date patterns, formats, and which origin keys are filled for each kind.
  2. **References**, only when the schema passes: ids are unique across the whole profile; each `achievements[].project` is an existing project; each `skills[].evidence` id is an existing job or project; each `origin.source` is an existing source; each `decisions[].refs` id is an existing job, project, achievement, skill or period note.
- Messages name the path, for example `/achievements/0/project: unknown project "prj-missing"` or `/skills/0: unknown key "level"`.

## Rules for the producer

- Validate with `validateProfile` (or the schema plus the same reference checks) before writing the file, and fail loudly on a violation.
- Every fact has an origin. A `source_cv` origin quotes the place in the source. Facts from the chat carry the day of the answer.
- Never invent a fact, a number or a date. A fact that is not known is `null` and is asked later.
- A job with no named projects gets one implicit project, so that its achievements still have a link.
- A skill with no evidence is kept only with a decision record (P-11) that confirms it.

## Rules for the consumer

- Check the major version only. Ignore keys you do not know, which come from a newer minor version.
- Use only facts with an origin. Never print ids, evidence, origins or decisions.
- A `null` field a rule needs: ask the candidate (`../profile-data.md`, "Missing" of each block), never fill it in.

## External producers

The schema has a stable `$id` under the repository URL and does not depend on the code of this module. A program outside this repository, for example `index-cv`, can produce the profile directly: it validates against `profile.schema.json` with any JSON Schema draft-07 validator (formats `date`, `date-time`, `email`, `uri`), and repeats the reference checks above. A profile it produces is read like any other.

## Not in the contract

- The coverage report of a reader, the reader version, the token size and instructions for the LLM: these belong to the CV reader for the index CV (#31) and the CV reader for an uploaded PDF (#32), not to the profile.
- Values computed from the profile: total years, gaps between jobs, areas of work, the AI flag when it is not stated, the most recent job.
- Personal details no rule uses (photo, address, date of birth, salary expectations).
