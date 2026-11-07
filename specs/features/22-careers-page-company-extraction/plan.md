# Plan: #22 careers-page.com: company not extracted when the page title has another template

Issue: #22 · Approach: https://github.com/Beefeater84/tailor-cv-to-job-description/issues/22#issuecomment-6713879447
Delivery: -
Later: -

## Group 1: Unresolved fields in rule extraction

- Task: #22
- Goal: a rule can mark a field it tried to extract but could not confirm as unresolved, and the extracted vacancy document and `status.json` show it.
- Files: `vacancy-reader/src/rules/types.ts` (change: optional `unresolved` list of field names on the extracted fields), `vacancy-reader/src/rules/extract.ts` (change: a field with a selector in the rule that matched nothing is unresolved; `postprocess` may add fields), `vacancy-reader/src/rules/render.ts` (change: `unresolved` key in the front matter after `tags`, only when non-empty), `vacancy-reader/src/extract.ts` and `vacancy-reader/src/fetch/jobs.ts` (change: `extraction.unresolved` in `status.json`), tests next to the code, `specs/decisions/22-unresolved-fields-in-rules.md` (create, `Status: accepted`), `vacancy-reader/rules/README.md` (change), `vacancy-reader/README.md` (change: `extraction.unresolved` in the status table).
- Reuse: `frontMatter` insertion order in `render.ts`; `extractFields` in `src/rules/extract.ts`; test helpers in `src/extract.test.ts` and `src/rules/*.test.ts`.
- Done when: tests show a selector with no match and a `postprocess` mark both give `unresolved` in the document and in `extraction.unresolved`; a field the rule does not try is not listed; the contract `vacancy.json` stays `1.0` with no new key; existing examples pass unchanged; the ADR and `rules/README.md` describe the mechanism.
- Complexity: normal

## Group 2: careers-page.com company from the title and the Manatal example

- Task: #22
- Goal: the careers-page.com rule finds the URL company slug as a whole word in the page title, takes it as the title spells it, and marks `company` unresolved when it is not found.
- Files: `vacancy-reader/rules/careers-page.com.ts` (change), `vacancy-reader/examples/careers-page.com/manatal-senior-platform-engineer/page.html` (create: byte copy of `vacancy-reader/runs/20261024-174010-careers-page.com-f771/page.html`), `.../expected.md` (create, reviewed against the page), `vacancy-reader/examples/index.yaml` (change: second entry after iDelsoft, `count: 2`, `saved_at: 2026-10-24`), `vacancy-reader/contract/README.md` (change: the "Absent values" mention of #22), `vacancy-reader/rules/README.md` (change: "Do not guess" example).
- Reuse: slug parsing and title lookup already in the rule; `npm run rules:check -- careers-page.com` to draft and check `expected.md`.
- Done when: `npm run rules:check -- careers-page.com` passes 2 of 2 with `company: iDelsoft` and `company: Manatal`; a test or check shows a page whose title lacks the slug (for example the `alljobs` run) gives `unresolved: [company]`; typecheck, lint, tests pass.
- Complexity: normal
