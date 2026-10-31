# Tech Stack

Each choice below is recorded as an ADR in `specs/decisions/` when it is made, and this file is updated to match.

## Languages & Frameworks

- Language: TypeScript. Runtime: Node 24. Package manager: npm (ADR `6-typescript-node-stack`).
- Browser automation: Playwright, headless Chromium.
- Each pipeline stage is its own top-level module with its own `package.json`. The vacancy reader is `vacancy-reader/` (ADR `6-vacancy-reader-module`).
- Open: agent SDK or framework, and the form of the agent (standalone app, Claude Code skill, hosted service).

## Infrastructure & Deployment

The agent runs locally on the user's machine (ADR `3-local-agent-playwright-user-session`). No hosting or deployment. CI/CD not set up yet.

## Key Dependencies

- **Default source CV**: `https://cv.tony-m.dev/llms-full.txt`, built and deployed by the `index-cv` repository (`Beefeater84/index-cv`, S3 + CloudFront). Plain text in the llmstxt.org style: summary, projects, skills with evidence. A short index is at `https://cv.tony-m.dev/llms.txt`.
- **LLM, vacancy reader**: Anthropic API, Claude Haiku 5.5 (`claude-haiku-5-5`), key `ANTHROPIC_API_KEY` (environment or `vacancy-reader/.env`). Used only as the fallback for a vacancy from a site without a rule (ADR `12-llm-fallback-extraction`).
- **LLM, writer**: needed for writing the CV and cover letter. Provider and model not chosen yet.
- **Vacancy pages**: job description pages on the internet, opened with **Playwright** using the user's browser session (ADR `3-local-agent-playwright-user-session`). Text is extracted with per-site parsing rules (ADR `3-site-parsing-rules-from-examples`): one declarative TypeScript rule per site in `vacancy-reader/rules/<site>.ts`, run on the saved HTML with a static parser (ADR `10-site-parsing-rule-format`). A site without a rule goes to an LLM fallback (ADR `12-llm-fallback-extraction`).
- **Test data (vacancy examples)**: `vacancy-reader/examples/index.yaml` and `vacancy-reader/examples/<site>/<company>-<role>/{expected.md,page.html}`. Layout in `decisions/6-vacancy-reader-module.md`. `expected.md` is the human-reviewed reference extracted vacancy document (Markdown with YAML front matter) that the site rule must reproduce from `page.html` (ADR `10-site-parsing-rule-format`).
- **Contract validation, vacancy reader**: `ajv` and `ajv-formats` check `vacancy.json` against `vacancy-reader/contract/vacancy.schema.json` (ADR `8-vacancy-output-contract`).
- **PDF rendering**: not chosen yet.

## Database Schema

None. The agent works from files and URLs. No database is planned.

## Key Flows

Main flow, from the project diagram:

```
vacancy URL
  → Vacancy reader: fetch the page, parse it
  → vacancy.json (vacancy contract v1, see vacancy-reader/contract/README.md)
  → Writer: + candidate profile (from the source CV, e.g. llms-full.txt ~150 KB, and the candidate's answers in the chat)
            + CV and cover letter rules
            + CV design sample
  → tailored CV + cover letter
  → PDF creator
  → CV.pdf + cover-letter.pdf
```

## Checks

Run in order, from the repository root. Tests are added where logic is non-trivial. `npm test` runs the site rules on all vacancy examples, offline.

```bash
cd vacancy-reader && npm ci
npm run typecheck
npm run lint
npm test
```

## Smoke Tests

None yet. The planned end-to-end check: run the agent on one real vacancy URL and verify that it produces two PDFs, that the CV follows the design sample, and that every fact in the CV can be found in the candidate profile.

## Constraints

- All code, comments, documentation and output in English.
- The candidate profile (the default source CV is ~150 KB) must fit into the model's context together with the rules and the vacancy, or be pre-filtered.
- Do not commit the candidate's personal data into this repository.
- Do not commit the user's cookies or browser profile.
