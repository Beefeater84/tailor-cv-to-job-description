# What the writer takes from the vacancy, and the vacancy analysis

Status: accepted
Date: 2026-10-31
Issue: Vacancy data the writing rules need (#42)
Affects: vacancy output contract (`8-vacancy-output-contract.md`), vacancy contract fields for location, work format, seniority, compensation (#39), writer design (#34), candidate profile data the writing rules need (#41), validator (#43); vacancy reader, `tailor-cv`

## Context

The writing rules (#29) name in their **Needs** field what they use from the vacancy. Some of it is what the page says (title, text), some is a reading of the text (requirements split into must-have and nice-to-have, keywords, industry, the problems of the role). The vacancy output contract (ADR 8) planned to split the text into responsibilities and requirements as contract fields, and its consumer rules forbade the model's own knowledge of the company. The rules also used the vacancy's location and work format, which the candidate knows better than the page.

## Decision

- **The contract holds what the page says; the vacancy analysis of `tailor-cv` holds the reading of it.** The split into responsibilities and requirements, must-have and nice-to-have, keywords, areas of work, industry and market type, required languages, the technical and AI flags, and the problems of the role are results of the analysis, not contract fields. This replaces the planned split in the consequences of ADR 8.
- **The model's own knowledge is a proposal.** The agent may use what it knows about companies, industries and roles, for example to propose the problems of the role or the industry. A proposal is shown to the candidate and used only after the candidate confirms or corrects it. When the context is too thin, the agent asks the candidate about the company, the product and the team. This keeps ADR 8's "a model never derives it silently" and replaces the consumer rule that forbade the model's own knowledge of the company.
- **One confirmation step.** Before writing, the agent shows the result of the analysis once, with proposals marked, and asks the questions for the missing items.
- **Where the candidate applies, the region and the work format are facts of the candidate profile (#41)**, not of the vacancy.
- **The writer needs no new contract fields.** Seniority is derived in the analysis from the title and the requirements. Location, work format and compensation (#39) serve comparing and filtering vacancies.

The list of items, their sources and what happens when each is missing: `tailor-cv/vacancy-data.md`.

## Consequences

- `vacancy-reader/contract/README.md` drops the planned split and allows the model's own knowledge as a confirmed proposal.
- The rule cards HEADER-01, HEADER-02, HEADER-03, SUM-01, SUM-02, GEN-09 and GEN-13 take these items from the analysis or the profile.
- #39 decides its fields for comparing and filtering only; the writer does not depend on it.
- #41 adds where the candidate applies, the region and the work format to the profile.
- The job family mode (how a group is given, merged and saved) is decided in the writer design (#34).
