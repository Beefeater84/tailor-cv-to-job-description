# Plan: #10 Site parsing rules: format, how they are written and tested

Issue: Site parsing rules: format, how they are written and tested (#10) · Approach: https://github.com/Beefeater84/tailor-cv-to-job-description/issues/10#issuecomment-6384314888
Delivery: -
Later: -

Decision: `specs/decisions/10-site-parsing-rule-format.md` (accepted). Scope is extraction only: a rule turns a stored `page.html` into the extracted vacancy document (Markdown with YAML front matter). Transformation for the writer is the vacancy output contract (#8). Parsing a live job from `runs/` and matching a URL to a rule belong to matching a vacancy URL to a site rule (#11).

## Group 1: Rule engine

- Task: #10
- Goal: Given a site rule and a page's HTML, produce the extracted vacancy document exactly as the ADR defines it, without a browser or network.
- Files:
  - `vacancy-reader/src/rules/` (create): rule type and `defineRule`; loading the rule of a site from `vacancy-reader/rules/<site>.ts` (no registry); field extraction from static HTML (`remove`, short fields as collapsed text, `tags` as a list, long fields HTML → Markdown with headings shifted so the highest is `###`, `postprocess`); rendering the document (front matter key order, optional fields and `## Company` omitted when missing, LF, no trailing whitespace, one final newline); the normalisation used to compare with `expected.md`; reading `examples/index.yaml`.
  - `vacancy-reader/package.json`, `package-lock.json` (change: a static HTML parser, an HTML → Markdown converter, a YAML library).
  - `vacancy-reader/tsconfig.json` (change: typecheck `rules/**/*.ts`); `vacancy-reader/eslint.config.js` (change only if needed for `rules/`).
- Reuse: `src/fetch/jobs.ts` — `MODULE_ROOT` for module-relative paths, the ENOENT handling pattern; site key = host without `www.`, lowercased (as in `makeJobId`, not exported — extract a shared helper if used).
- Done when: typecheck and lint pass; a missing rule is reported as "no rule for <site>", not a crash; a rule without `description` is a type error.
- Complexity: complex

## Group 2: careers-page.com rule, reference document, tests and `rules:check`

- Task: #10
- Goal: One working rule with a passing offline test on the real example, and the command an agent uses to write and fix rules.
- Files:
  - `vacancy-reader/rules/careers-page.com.ts` (create): the fields the page marks clearly (at least `title` and `description`; `company` and `tags` only if the markup states them; no guessing).
  - `vacancy-reader/examples/careers-page.com/idelsoft-senior-frontend-performance-engineer/expected.md` (change: rewritten as the reference extracted document; checked line by line against the page, not just copied from the rule's output; `page.html` stays byte-identical).
  - Rule tests over `examples/index.yaml` with `node:test` (create, in `src/rules/`); an example whose site has no rule is `todo`.
  - `vacancy-reader/src/cli.ts` (change: `rules:check <site>` prints each example's output and a line diff against `expected.md`, exit code 1 on any mismatch or a missing rule); `vacancy-reader/package.json` (change: scripts `test`, `rules:check`).
- Reuse: `src/cli.ts` — `parseArgs` setup, `USAGE`, numeric exit codes; the group 1 engine.
- Done when: `npm test` passes; `npm run rules:check -- careers-page.com` shows no diff; a changed line in `expected.md` (tried and reverted) makes both fail with a readable diff; `index.yaml` and `page.html` unchanged.
- Complexity: normal

## Group 3: Documentation

- Task: #10
- Goal: An agent can write, test and update a site rule from the docs alone.
- Files:
  - `vacancy-reader/rules/README.md` (create): rule format and fields, output document format, how an agent writes a rule (read `page.html` and `expected.md`, pick selectors, run `rules:check`, stop after 5 failed iterations and show the diff to the user), how a rule is updated when a site changes its layout, how `expected.md` is made and reviewed.
  - `vacancy-reader/README.md` (change: a "How the module works" section near the top — the whole flow step by step: URL → fetch job → `runs/<id>/page.html` → site rule → extracted vacancy document → (later) output contract; what each step reads and writes, where examples and tests fit, what is planned and in which task; Parsing is available; commands `test` and `rules:check`; link to the rules README).
  - `specs/tech-stack.md` (change: Checks gets `npm test`; the test data line mentions the `expected.md` format and the ADR).
  - `specs/AGENT.md` (change: a "Read by topic" row for `vacancy-reader/rules/` → rules README and ADR `10-site-parsing-rule-format`; fix the outdated note that the module README is created later).
- Reuse: style of `vacancy-reader/README.md` (one `###` per command, flags table).
- Done when: the docs match the ADR and the code (field names, command names, iteration limit); no doc says `expected.md` is copied browser text; a reader new to the module understands from `vacancy-reader/README.md` alone how a URL becomes an extracted vacancy document.
- Complexity: normal
