# Candidate profile data the writing rules need

What the writer needs from the candidate profile, based on the **Needs**, **Rule**, **Check** and **Limits** fields of the rule cards in [`rules/`](rules/README.md). It is the checklist of the CV reader and of the agent's questions to the candidate: for each block, what it holds, which rules use it, whether the tailored CV needs it, and what happens when it is missing. Task: "Candidate profile data the writing rules need" (#41). The decisions behind it are in `specs/decisions/42-vacancy-analysis-input.md`. The vacancy side is in [`vacancy-data.md`](vacancy-data.md).

Terms (source CV, candidate profile, tailored CV) are defined in `specs/mission.md`.

## Principles

- **The profile is a store of facts, not the sections of the CV.** The blocks hold what is true about the candidate; the tailored CV is built from them by the rules (GEN-08). The order of the blocks does not set the order of the CV; GEN-06 does. The table "Tailored CV section ← profile blocks" below maps one to the other.
- **The profile is the only source of facts.** The agent selects, reorders and rewords; it never invents experience, skills, employers, dates, numbers or results (`specs/mission.md`).
- **Every fact records its origin.** One of three: the source CV, with a quote of the place it comes from; an answer of the candidate in the chat, with the date; a proposal of the agent that the candidate confirmed or corrected, with the date (`specs/decisions/42-vacancy-analysis-input.md`). A fact without an origin is not used.
- **Missing facts are asked, not filled.** When a rule needs a fact the profile does not have, the agent asks the candidate (GEN-03) and adds the answer to the profile before it goes into the CV.
- **The candidate's plans are the candidate's.** Where the candidate is looking for work, the region and the work format are facts of the profile (P-02), not of the vacancy: the candidate knows what they apply for and may plan to move.
- **The candidate decides.** What the candidate confirms against a rule's advice stays, with the warning recorded (GEN-10, P-11).

## Blocks

Each block: the rules that use it, what it holds, whether it is one entry or a list, whether the tailored CV needs it, how often the tailored CV uses it, and what happens when it is missing.

How often: **always** — every tailored CV uses it; **often** — most tailored CVs use it; **per vacancy** — used only when the vacancy asks for it; **service** — not printed, used by the agent and the validator.

### P-01 — Name and current job title
- Rules: GEN-05, GEN-06, HEADER-03, SUM-01 (who the candidate is)
- Holds: the name the candidate uses on a CV; the current or last job title with its level (for example "Senior", "Lead")
- One or list: one
- Required: yes
- How often: always
- Missing: the name is asked. The title and level are taken from the most recent job (P-06) and the agent proposes the level; the candidate confirms it. HEADER-03 never gives a level the jobs do not support.

### P-02 — Search goals and location
- Rules: GEN-05, GEN-09, GEN-14, HEADER-01, HEADER-03, SUM-01 (what role the candidate is looking for)
- Holds: target roles; where the candidate applies (countries, cities, relocation plans); the region of the search (for GEN-09, for example the EU); the work format (on-site, hybrid, remote); the current city and time zone
- One or list: one block; target roles and places are lists
- Required: yes; HEADER-01 has weight 0.8 and GEN-09 needs the region
- How often: always
- Missing: the agent asks once and keeps the answer for later vacancies. The time zone may be proposed from the city and confirmed. The agent never guesses where the candidate wants to work from the vacancy.

### P-03 — Contacts
- Rules: GEN-06, HEADER-02
- Holds: phone, email, LinkedIn profile, GitHub profile; each only when the candidate has it
- One or list: one
- Required: phone and email yes; LinkedIn and GitHub no
- How often: always
- Missing: phone or email: asked. LinkedIn or GitHub: asked once; when the candidate has none, the header goes without it. GitHub matters only for a technical role (`vacancy-data.md` V-11).

### P-04 — Skills
- Rules: GEN-08, GEN-09, GEN-12, SKILL-01, EXP-05 (an AI tool in the skills is backed by a bullet)
- Holds: each skill (software, tool, method, technology) with the ids of the jobs (P-06) and projects (P-06, P-07) where it was used. The ids are evidence for GEN-12 backing and for the validator; they are not printed in the CV.
- One or list: list
- Required: yes
- How often: always
- Missing: a skill the vacancy asks for and the profile lacks is asked about (GEN-03, SKILL-01 step 2); confirmed similar experience is added with its evidence, otherwise it is reported as a gap. A skill with no evidence id may go into a list only with a recorded confirmation (P-11); a must-have skill also needs a bullet or project that uses it (GEN-12).

### P-05 — Achievements
- Rules: GEN-03, GEN-12, GEN-13, SUM-01 (what the candidate has achieved), EXP-02, EXP-04, EXP-05, EXP-06
- Holds: each achievement as a separate unit with an id and a link to exactly one project, inside a job (P-06) or outside one (P-07). For each: the result; the number, if any, with its context (baseline or period, scale such as team, budget or users); what it is measured by; the candidate's own contribution against the team's; how it was achieved; whether it involved AI work.
- One or list: list
- Required: yes; without achievements EXP-02 (weight 0.9) has nothing to work on
- How often: always
- Missing: the agent asks for the result, the candidate's contribution and how it was achieved (GEN-03). A result without a number: the agent suggests the kind of metric and asks for the value, never gives one. A number without context: asked (EXP-04); with no answer the number goes in as it is. A team result without the candidate's role: asked.
- Selection: the summary (SUM-01, GEN-13) may pick achievements from any project. The bullets of a job (EXP-02, EXP-05) pick only achievements linked to that job's projects; a project outside jobs shows its achievements in its own entry (PROJ-01).

### P-06 — Jobs
- Rules: GEN-05, GEN-06, HEADER-03 (job titles), SUM-01 (total years, main duties), SUM-02, SKILL-02 (areas of work), EXP-01, EXP-02, EXP-03, EXP-05 (AI work), PROJ-01 (what the jobs do not show), GAP-01 (dates)
- Holds: each job with an id: company, job title, start and end dates, a short role description, the duties, the industry of the employer and its market type (B2B, B2C). The projects inside the job are part of it, each with an id and its context (product, team, role in the project, period).
- One or list: list
- Required: yes
- How often: always
- Missing: company, title or dates of a job: asked; the agent never estimates dates. A missing role description is proposed from the duties and confirmed. Industry and market type: the agent proposes them from the company and the candidate confirms (SUM-02 weight 0.8). A job with no projects is one implicit project, so its achievements still have a link.

### P-07 — Projects outside jobs
- Rules: PROJ-01, GAP-01, GEN-03 (a project the agent suggests for a requirement with no experience), EXP-05 (AI work shown by a project)
- Holds: each project with an id: name, what it is (own, open source, study, made for a vacancy), dates, the result, a link when there is one. Projects with dates fill the periods between jobs. Optional: a context note for a period between jobs (for example parental leave), only when the candidate gives it.
- One or list: list
- Required: no
- How often: often
- Missing: the agent finds the periods between jobs from the dates (computed, see below) and asks only whether there was a project in that period. A project the candidate names goes in by PROJ-01 and fills the period. The agent does not ask the reason for a gap; the candidate gives a context note only if they want to (GEN-10). The agent never invents a project or a reason. A project it suggests for a missing requirement goes in only after the candidate has done it.

### P-08 — Languages
- Rules: SKILL-03
- Holds: each language with the candidate's level (for example CEFR "C1", or "native")
- One or list: list
- Required: no
- How often: per vacancy
- Missing: when the vacancy names a language (`vacancy-data.md` V-10) and the profile has no level for it, the agent asks. A language the candidate does not have, or has at a lower level, is reported as a gap and never raised.

### P-09 — Education and certifications
- Rules: EDU-01, EDU-02
- Holds: each qualification (degree or equivalent) with the institution and year; each professional certification with the issuer and year
- One or list: list
- Required: no; EDU-01 needs the highest qualification when the candidate has one
- How often: often
- Missing: the highest qualification is asked once. A degree or certification the vacancy requires and the profile lacks is asked about, then reported as a gap.

### P-10 — Hobbies
- Rules: GEN-07
- Holds: each hobby or outside activity, with what makes it relevant or impressive when the candidate states it
- One or list: list
- Required: no
- How often: per vacancy, only when GEN-07 allows it
- Missing: not asked. The CV goes without hobbies.

### P-11 — Records of the candidate's decisions
- Rules: GEN-10, GEN-11, GEN-12
- Holds: each decision with the date and what it covers: a confirmation the rules ask to record (hidden text, GEN-11; a term with no backing in the profile, GEN-12) and each rule the candidate overrode, with the warning the agent gave (GEN-10)
- One or list: list
- Required: no; required for each override or confirmation that happened
- How often: service
- Missing: nothing to ask. The validator treats an override or an unbacked term with no record as a failure of the rule.

## Tailored CV section ← profile blocks

The sections in the order of GEN-06.

| Tailored CV section | Profile blocks |
|---|---|
| Header | P-01, P-02 (location, time zone, where and how the candidate applies), P-03 |
| Summary | P-01, P-02 (role looked for), P-05 (from any project), P-06 (total years, duties, industries and market types) |
| Competencies | P-06 and P-07 (areas of work, computed), backed by P-05 |
| Skills | P-04, P-08 (only a language the vacancy names) |
| Experience | P-06, P-05 (only achievements of that job's projects) |
| Projects | P-07, P-05 (achievements of that project) |
| Education | P-09 |
| Hobbies (only when GEN-07 allows) | P-10 |
| Not printed | P-11; the evidence ids of P-04 |

## Computed, not stored

The agent computes these from the blocks each time; they are not kept in the profile, so they never go out of date.

- **Total years of experience** (SUM-01): from the dates of the jobs (P-06), from the first start to today, overlaps counted once.
- **Gaps between jobs** (GAP-01, P-07): periods between the dates of the jobs (P-06) not covered by a project with dates (P-07). There is no gap block in the profile.
- **Areas of work** (SKILL-02): from the role descriptions, duties and projects of the jobs (P-06), the projects outside jobs (P-07) and the achievements (P-05). Proposed to the candidate like any reading of the profile.
- **AI flag of an achievement** (EXP-05): when P-05 does not say whether AI was involved, it is read from the achievement and its project; when unclear, the candidate is asked.
- **Most recent job** (GEN-05, EXP-01): from the dates of the jobs.

## Not needed by the tailored CV

- Photo: GEN-07 leaves it out.
- Full address: HEADER-01 gives only the city and the time zone.
- References: GEN-07 leaves out the "References available on request" line.
- The summary text of the source CV: it is input for the CV reader, not a fact; SUM-01 writes the summary from the blocks for the vacancy.
- Reasons for gaps: not asked and not stored; only an optional context note the candidate gives (P-07).
- Personal details no rule uses (date of birth, marital status, salary expectations).

## Not decided yet

- **The profile contract**: the format of the profile, the ids of jobs, projects and achievements, how the origin is written and where the profile is stored. Decided in "Candidate profile contract and CV block registry" (#30); this document is its input.
- **Target city instead of the current one** (HEADER-01): P-02 holds both the current city and where the candidate applies; which one the header shows is the open question in [`rules/cv/header.md`](rules/cv/header.md).
- **Older jobs** (EXP-01): P-06 holds every job; how much space older jobs get is the open question in [`rules/cv/experience.md`](rules/cv/experience.md).
- **What counts as a gap**: the length from which a period between jobs is a gap; the open question in [`rules/cv/gaps.md`](rules/cv/gaps.md).
- **Where hobbies go**: GEN-06 has no hobbies section; when GEN-07 allows them, their place in the CV is not decided.
