# Vacancy data the writing rules need

What the writer needs from a vacancy, based on the **Needs** field of the rule cards in [`rules/`](rules/README.md). It is the checklist of the vacancy analysis step: for each item, where it comes from, whether the tailored CV needs it, and what happens when it is missing. Task: "Vacancy data the writing rules need" (#42). The decisions behind it are in `specs/decisions/42-vacancy-analysis-input.md`.

Terms (source CV, candidate profile, tailored CV) are defined in `specs/mission.md`.

## Principles

- **The contract holds what the page says; the analysis holds the reading of it.** The vacancy reader fills `vacancy.json` (see `../vacancy-reader/contract/README.md`). Everything that interprets the text (requirements split into must-have and nice-to-have, keywords, the industry, the problems of the role) is a result of the vacancy analysis step of `tailor-cv`, not a contract field.
- **The agent's own knowledge is a proposal.** The agent may use what it knows about companies, industries and roles: for example, a battery company hiring an AI engineer most likely needs a lot of time-series data logged. Such a proposal is shown to the candidate and used only after the candidate confirms or corrects it. When the agent lacks the context for a proposal (the company, the product, the team), it asks the candidate for that context.
- **One confirmation step.** Before writing, the agent shows the candidate the result of the analysis once, with its proposals marked as proposals, and asks the questions for the missing items. The candidate confirms or corrects it. Facts about the candidate from the answers go into the candidate profile.
- **The candidate's plans are the candidate's.** Where the candidate is looking for work, the region and the work format are facts of the candidate profile (#41), not of the vacancy: the candidate knows what they apply for, and may plan to move.

## Items

Each item: what it is, the rules that use it, where it comes from, whether the tailored CV needs it, and what happens when it is missing.

### V-01 — Job title
- Rules: HEADER-03, SUM-01
- From: contract field `title`
- Required: yes
- Missing: ask the candidate (consumer rule of the contract).

### V-02 — Seniority
- Rules: HEADER-03
- From: analysis, from the title and the requirements. If the vacancy reader gets a seniority field ("Vacancy contract: fields for location, work format, seniority, compensation" (#39)), the analysis takes it from there.
- Required: no, the title line gets weaker without it
- Missing: the agent proposes the level, the candidate confirms it.

### V-03 — Vacancy text
- Rules: GEN-13, and the source of every analysis result below
- From: contract field `description`
- Required: yes
- Missing: never; the contract does not allow it.

### V-04 — Company context: the company, its product, the team
- Rules: SUM-01, SUM-02, GEN-13
- From: contract field `company_description` and the vacancy text; the agent's own knowledge as a proposal
- Required: no, but V-09 and V-13 depend on it
- Missing: the agent asks the candidate what the company does and what the team works on.

### V-05 — Requirements, must-have and nice-to-have
- Rules: GEN-02, GEN-03, GEN-08, GEN-12, SKILL-01, EXP-02, PROJ-01, EDU-01 (a required degree or certification is a requirement)
- From: analysis, from the vacancy text. The split follows the vacancy's own words ("required", "nice to have", "a plus"); a requirement the vacancy does not mark is must-have.
- Required: yes; without it most rules have nothing to work on
- Missing: never fully, the vacancy text always has requirements; the candidate checks the split in the confirmation step.

### V-06 — Responsibilities
- Rules: EXP-05, SKILL-02, GEN-13
- From: analysis, from the vacancy text
- Required: no
- Missing: the rules use the requirements only.

### V-07 — Keywords
- Rules: GEN-09, GEN-12, SKILL-01
- From: analysis: the skills, tools, competencies and job titles of the requirements, in the vacancy's wording. They include the industry, the market type and the required languages.
- Required: yes
- Missing: never; they come from V-05.

### V-08 — Areas of work
- Rules: SKILL-02
- From: analysis, from the requirements and responsibilities
- Required: no
- Missing: the competencies section is built from the skills only.

### V-09 — Industry and market type (B2B, B2C)
- Rules: SUM-02
- From: analysis, from V-04 and the vacancy text; the agent's own knowledge as a proposal
- Required: no, but a missing industry can lead to an automatic rejection (SUM-02, weight 0.8)
- Missing: the agent proposes it, the candidate confirms it. If neither knows, SUM-02 is skipped.

### V-10 — Required languages
- Rules: SKILL-03
- From: analysis, from the requirements
- Required: no
- Missing: SKILL-03 adds no language. Not asked.

### V-11 — Technical role
- Rules: HEADER-02 (GitHub profile)
- From: analysis, from the title and the requirements
- Required: no
- Missing: never; the analysis always says yes or no.

### V-12 — Role about AI or automation
- Rules: EXP-05
- From: analysis, from the requirements and responsibilities
- Required: no
- Missing: never; the analysis always says yes or no.

### V-13 — Problems the role is hired to solve
- Rules: GEN-13
- From: analysis: one to three problems, from the vacancy text, V-04 and the agent's knowledge of such companies and roles. All of them are proposals.
- Required: no (GEN-13, weight 0.7)
- Missing: when the context is too thin for a proposal, the agent asks the candidate about the company, the product and the team (V-04). The candidate confirms or corrects the problems.

## Not needed by the tailored CV

- `company`, `hiring_manager`: the tailored CV names no company (GEN-02). They are for the cover letter, which has no rules yet.
- Compensation: no rule uses it.
- Location and work format of the vacancy: HEADER-01 and GEN-09 take where the candidate applies, the region and the work format from the candidate profile (#41).
- `tags`: input to the analysis, not used by a rule directly.

## Vacancy contract fields

- Used now: `title`, `description`, `company_description`; `tags` as input to the analysis.
- New fields the writer needs: none. Seniority is derived in the analysis (V-02); a seniority field would only make it more reliable. Location, work format and compensation (#39) serve comparing and filtering vacancies, not the writer.
- The split of the vacancy text into responsibilities and requirements is done in the analysis (V-05, V-06), not as contract fields.

## Not decided yet

- **Job family mode** (3–5 vacancies of one role, GEN-02): how the candidate gives the group, how the items are merged, and which artifact the analysis saves for the writer and for a later session. Decided in the writer design (#34), see the open question "Input of the writer" in `rules/general.md`. A starting point: requirements shared by all vacancies first, then the others (GEN-02); keywords and languages as a union; problems merged; the flags by majority; one question to the candidate per group, not per vacancy.
