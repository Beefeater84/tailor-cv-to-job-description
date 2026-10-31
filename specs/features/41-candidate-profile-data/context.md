# Context: #41 Candidate profile data the writing rules need

Documentation task, no code. All files are Markdown, English only.

## Doc map

- `tailor-cv/vacancy-data.md` — vacancy-side sibling (V-01…V-13): the template. Mentions "(#41)" in Principles ("The candidate's plans are the candidate's") and in "Not needed by the tailored CV" (location and work format).
- `tailor-cv/rules/README.md` — steps table (vacancy analysis, writer, validator, humanizer); the analysis row links `../vacancy-data.md`; the writer row says "from the analysis and the candidate's profile". Card template line: Needs: profile block …; vacancy field ….
- `tailor-cv/rules/general.md` — GEN-01..14 and Open questions. Profile facts: GEN-03 (result, own contribution, how, role in a team result, metric), GEN-05, GEN-06 (header: name, title, location, contacts; "experience (with career gaps in their place)"), GEN-07 (hobbies), GEN-08 (whole profile), GEN-09 (region where the candidate applies, from the profile (#41)), GEN-10 (recorded warning + confirmation of an override), GEN-11 (recorded confirmation), GEN-12 (backing or recorded confirmation), GEN-13 (achievements), GEN-14 ("the location and work format, the reasons for gaps"). Open question "Mirroring the vacancy": link to the index CV (source CV URL).
- `tailor-cv/rules/cv/header.md` — HEADER-01 (city, time zone, where and in which work format the candidate applies (#41)), HEADER-02 (phone, email, LinkedIn, GitHub), HEADER-03 (job titles, level). Open questions: target city, work format line.
- `tailor-cv/rules/cv/summary.md` — SUM-01 (dates for total years, duties, achievements), SUM-02 (industries and market types of employers).
- `tailor-cv/rules/cv/skills.md` — SKILL-01 (skills, skills used in experience), SKILL-02 (areas of work), SKILL-03 (languages with level).
- `tailor-cv/rules/cv/experience.md` — EXP-01 (company, title, dates), EXP-02, EXP-03 (role description, duties, achievements), EXP-04 (number with baseline/period, size, what the candidate did), EXP-05 (AI work), EXP-06 (measure, the way reached).
- `tailor-cv/rules/cv/projects.md` — PROJ-01 (name, what it is, requirement it shows, result, link).
- `tailor-cv/rules/cv/education.md` — EDU-01, EDU-02 (qualification, institution, year; certifications).
- `tailor-cv/rules/cv/gaps.md` — GAP-01 (explain a gap in one line, never hide it); rewritten in Group 2.
- `tailor-cv/README.md` — module bullets; the "**Vacancy data** (available now)" bullet is the pattern.
- `specs/mission.md` — Terms (source CV, candidate profile, tailored CV); the profile is the only source of facts.
- `specs/decisions/42-vacancy-analysis-input.md` — accepted, do not edit.
- `specs/decisions/8-vacancy-output-contract.md` — common rules for writer input contracts (apply to #30, not here).
- `index-cv/docs/spec.md` (repo Beefeater84/index-cv) — the default source CV model: project @ company with period, role, team, context, what I did, results; skills registry with aliases, years, evidence per project; FAQ (work format, relocation).

## Decisions from the approach (agreed with the owner)

- Blocks P-01…P-11 exactly as in the approach comment. P-06 jobs hold the projects inside each job (with context); P-07 projects outside jobs, with dates, fill gaps between jobs.
- The profile is a store of facts, not the sections of the tailored CV; the order of blocks does not affect the CV. A table maps each tailored CV section (GEN-06) to the profile blocks it is built from.
- Achievements (P-05) are separate units with an id and a link to one project (inside a job or outside). The summary (SUM-01, GEN-13) may pick from any project; the bullets of a job (EXP-02) only from that job's projects.
- Skills (P-04): a list; each skill has the ids of the jobs/projects where it was used. Not printed in the CV; used for GEN-12 backing and the validator.
- Every fact records its origin: source CV (with a quote), chat answer (with a date), or an agent proposal confirmed by the candidate (ADR 42).
- Computed, not stored: total years, gaps, areas of work, the AI flag.
- How often: always P-01…P-06; often P-07, P-09; per vacancy P-08, P-10; P-11 is a service block.
- GAP-01 (owner): by default the CV does not explain a gap; the agent finds gaps from the dates and asks only whether there was a project in that period, which goes in by PROJ-01 and fills the period; the agent does not ask the reason; the candidate gives it only if they want (GEN-10); the agent never invents a project or a reason. No gap block in the profile.

## Patterns to follow

- Document shape — like `tailor-cv/vacancy-data.md`: H1 = issue title; intro with `Task: "<title>" (#41).`; `## Principles` (bold lead bullets); `## Items` with `### P-01 — <name>` and fixed bullets; items refer to each other by id.
- Needs citation — like `../vacancy-data.md` V-04 in `tailor-cv/rules/cv/summary.md`.

## Conventions

- Name tasks by meaning: `"<title>" (#N)` or `<meaning> (#N)`, never a bare #N.
- Inside `tailor-cv/`: relative Markdown links with the path in backticks; to `specs/` and other modules: plain backticked repo-root paths.
- English only. No real personal data or excerpts of `llms-full.txt`.
- Rule card fields keep their order: Applies to, Rule, Why, Sources, Agreement, Weight, Needs, Check, Limits. `owner` marks the owner's part in Sources.
- Never edit an accepted ADR.
- Commits: `docs(#41): <summary>` with the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Gaps found during implementation
