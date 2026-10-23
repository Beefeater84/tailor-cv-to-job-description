# Mission

## Vision

An almost autonomous AI agent that tailors a CV to a specific job opening.
The user gives it a link to a job description. The agent reads the vacancy, matches it against the candidate's full experience, and produces two PDFs: a CV and a cover letter written for that vacancy.

The problem it solves: a generic CV hides the experience that matters for a given role. Rewriting the CV and the cover letter by hand for every application is slow. The agent does this in one run: it brings the relevant experience and skills forward and leaves out what does not matter for the role.

## Target Audience

- Primary user: the candidate (the repository owner), applying for jobs.
- Interaction: the user passes a vacancy URL and receives the PDFs. The interface (CLI, chat, bot, other) is not decided yet.
- Indirect readers of the output: recruiters, hiring managers and ATS systems that read the produced CV and cover letter.

## Core Business Rules

The pipeline has three stages. Each stage is an independent system with its own epic, and stages talk to each other only through defined contracts.

1. **Vacancy reader** (#3)
   - Input: a URL of a job description on the internet.
   - Reads the vacancy page and extracts its text with a parsing rule for the site. Rules are learned from examples (URL + expected text).
   - Output: the vacancy description, the list of requirements, and `source_url` (the original URL).
2. **Writer** (#4)
   - Input: the output of the vacancy reader, plus three fixed sources:
     - **Candidate data**: `llms-full.txt` (~150 KB), the candidate's full CV for AI agents, published by the `index-cv` project at `https://cv.tony-m.dev/llms-full.txt`. It holds the summary, every project with role, period and results, and skills with evidence per project.
     - **Rules** for writing the CV and the cover letter.
     - **CV design sample**: the reference layout the PDF must follow.
   - Output: the tailored CV and the cover letter content. Relevant experience and the skills the vacancy asks for come first.
3. **PDF creator** (#5)
   - Input: the writer's output and the design sample.
   - Output: two PDF files, the CV and the cover letter.

Rules for the content:

- All output (CV, cover letter) and all project files are in English.
- Candidate data is the only source of facts about the candidate. The agent selects, reorders and rephrases. It never invents experience, skills, employers, dates or results that are not in the candidate data.
- Every produced CV keeps `source_url`, so each pair of PDFs can be traced back to its vacancy.

## Key Decisions

- Candidate data source: `llms-full.txt` from `index-cv` (`https://cv.tony-m.dev/llms-full.txt`). Reason: it already holds the full CV, structured for AI agents, and is maintained in a separate repository.
- Pipeline split into three independent systems: reader → writer → PDF creator — one epic each (#3, #4, #5). Reason: each stage has its own input and output and can be built and tested on its own.
- Local agent, web access through Playwright with the user's browser session — see `decisions/3-local-agent-playwright-user-session.md`.
- Per-site parsing rules learned from examples — see `decisions/3-site-parsing-rules-from-examples.md`.
- Language: English for all content and documentation.
- Vacancy examples (URL, expected text, HTML snapshot) are stored in `examples/vacancies/` with one `index.yaml` — see `decisions/7-vacancy-examples-layout.md`.

## Scope

In scope:

- Reading a vacancy from a URL and extracting its description and requirements.
- Writing a tailored CV and a cover letter from the candidate data, the rules and the vacancy.
- Rendering both into PDF using the CV design sample.

Out of scope:

- Editing the candidate data. It is maintained in `index-cv`.
- Submitting applications or contacting employers.
- Searching for vacancies. The agent starts from a URL the user gives it.

## Open Questions

Open questions are tracked in the epics, not here: #3 (vacancy reader), #4 (writer), #5 (PDF creator). A settled question that changes the approach for other tasks becomes an ADR in `specs/decisions/`.

## Constraints

- Candidate data is ~150 KB of text. The writer must fit it, the rules and the vacancy into the model's context, or select the relevant parts first.
- The candidate data is personal data, © Tony Miasoedov. It must not be committed to this repository as test fixtures without the owner's consent.
