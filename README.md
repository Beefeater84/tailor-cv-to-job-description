# Tailor CV

An almost autonomous AI agent that tailors a CV to a job opening.

Give it a link to a job description. It returns two PDFs written for that vacancy: a CV and a cover letter.

> Status: early design. There is no code yet. See [specs/](specs/) for the project constitution.

## What the agent does

1. **Reads the vacancy.** It opens the job description URL and extracts the description and the list of requirements.
2. **Matches it against your CV.** Your full CV is the only source of facts. The agent never invents experience or skills.
3. **Writes a tailored CV and a cover letter.** It brings forward the experience and skills the vacancy asks for and follows a set of writing rules.
4. **Creates the PDFs.** It renders the CV and the cover letter following the CV design sample.

```
vacancy URL
  → Vacancy reader   → description, requirements, source_url
  → Writer           + your full CV
                     + CV and cover letter rules
                     + CV design sample
  → PDF creator      → CV.pdf, cover-letter.pdf
```

## Project docs

- [specs/mission.md](specs/mission.md): vision, business rules, scope, open questions
- [specs/tech-stack.md](specs/tech-stack.md): stack, data flow, checks
- Tasks: [GitHub Issues](https://github.com/Beefeater84/tailor-cv-to-job-description/issues) and the project board
