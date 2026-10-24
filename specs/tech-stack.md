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

- **Candidate data**: `https://cv.tony-m.dev/llms-full.txt`, built and deployed by the `index-cv` repository (`Beefeater84/index-cv`, S3 + CloudFront). Plain text in the llmstxt.org style: summary, projects, skills with evidence. A short index is at `https://cv.tony-m.dev/llms.txt`.
- **LLM**: needed for parsing the vacancy and writing the CV and cover letter. Provider and model not chosen yet.
- **Vacancy pages**: job description pages on the internet, opened with **Playwright** using the user's browser session (ADR `3-local-agent-playwright-user-session`). Text is extracted with per-site parsing rules (ADR `3-site-parsing-rules-from-examples`).
- **Test data (vacancy examples)**: `vacancy-reader/examples/index.yaml` and `vacancy-reader/examples/<site>/<company>-<role>/{expected.md,page.html}`. Layout in `decisions/6-vacancy-reader-module.md`.
- **PDF rendering**: not chosen yet.

## Database Schema

None. The agent works from files and URLs. No database is planned.

## Key Flows

Main flow, from the project diagram:

```
vacancy URL
  → Vacancy reader: fetch the page, parse it
  → { description, requirements, source_url }
  → Writer: + candidate data (llms-full.txt, ~150 KB)
            + CV and cover letter rules
            + CV design sample
  → tailored CV + cover letter
  → PDF creator
  → CV.pdf + cover-letter.pdf
```

## Checks

Run in order, from the repository root. These commands become available after the `vacancy-reader/` module scaffold is created. Tests are added where logic is non-trivial; there is no test command yet.

```bash
cd vacancy-reader && npm ci
npm run typecheck
npm run lint
```

## Smoke Tests

None yet. The planned end-to-end check: run the agent on one real vacancy URL and verify that it produces two PDFs, that the CV follows the design sample, and that every fact in the CV can be found in the candidate data.

## Constraints

- All code, comments, documentation and output in English.
- Candidate data (~150 KB) must fit into the model's context together with the rules and the vacancy, or be pre-filtered.
- Do not commit the candidate's personal data into this repository.
- Do not commit the user's cookies or browser profile.
