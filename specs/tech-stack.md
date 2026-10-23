# Tech Stack

The project has no code yet. The stack is not chosen. Each choice below is recorded as an ADR in `specs/decisions/` when it is made, and this file is updated to match.

## Languages & Frameworks

Not chosen yet. Open: language, agent SDK or framework, and the form of the agent (standalone app, Claude Code skill, hosted service).

## Infrastructure & Deployment

Not chosen yet. No hosting, CI/CD or environments exist.

## Key Dependencies

- **Candidate data**: `https://cv.tony-m.dev/llms-full.txt`, built and deployed by the `index-cv` repository (`Beefeater84/index-cv`, S3 + CloudFront). Plain text in the llmstxt.org style: summary, projects, skills with evidence. A short index is at `https://cv.tony-m.dev/llms.txt`.
- **LLM**: needed for parsing the vacancy and writing the CV and cover letter. Provider and model not chosen yet.
- **Vacancy pages**: arbitrary job description pages on the internet. Fetching method not chosen yet.
- **Test data (vacancy examples)**: `examples/vacancies/index.yaml` and `examples/vacancies/<site>/<company>-<role>/{expected.md,page.html}`. Layout in `decisions/7-vacancy-examples-layout.md`.
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

None yet. Add the install, typecheck, lint and test commands here when the stack is chosen, one command per line, in run order.

## Smoke Tests

None yet. The planned end-to-end check: run the agent on one real vacancy URL and verify that it produces two PDFs, that the CV follows the design sample, and that every fact in the CV can be found in the candidate data.

## Constraints

- All code, comments, documentation and output in English.
- Candidate data (~150 KB) must fit into the model's context together with the rules and the vacancy, or be pre-filtered.
- Do not commit the candidate's personal data into this repository.
