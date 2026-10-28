# CV: experience

The jobs of the candidate: company, title, dates, and what the candidate did and achieved.

### EXP-01 — Most recent job first; company, title, dates
- Applies to: CV / experience
- Rule: jobs go in reverse chronological order. Each job has the company, the job title and the dates.
- Why: the recruiter goes straight to the most recent job and judges the candidate's current level by it.
- Sources: 0T8q3B82PRw-en.md (section "Detailing Work Experience", 02:51)
- Agreement: 1 of 5 sources, no conflicts
- Weight: 0.7
- Needs: CV block with jobs: company, title, dates
- Check: jobs sorted by date, newest first; each has company, title and dates
- Limits: older jobs matter too; what to say about them is not decided yet

### EXP-02 — Results, not duties
- Applies to: CV / experience
- Rule: a bullet says what changed because of the candidate: time saved, more business, fewer errors, a better process. A number from the profile goes into the bullet. A bullet like "responsible for…" or "assisted with…" is rewritten as a result. Bullets that match the requirements of the vacancy (or the job family) go first.
- Why: a list of duties reads like a job description and could be anyone's. A result shows how well the candidate did the job and makes the CV theirs.
- Sources: 0T8q3B82PRw-en.md (section "Detailing Work Experience", 02:51); relevant bullets first: our addition, from the epic rule "what the vacancy asks for comes first"
- Agreement: 1 of 5 sources, no conflicts
- Weight: 0.9
- Needs: duties and achievements with numbers from the profile; requirements of the vacancy or the job family
- Check: no phrase from `../lists/duty-phrases.md`; the "name-off" test (LLM check): with the name removed, does the bullet read like a job description or like this person's impact?
- Limits: numbers and results only from the profile, never invented. A duty with no result in the profile stays a duty, worded concretely. When a result is missing, the agent asks the candidate (GEN-03).

### EXP-03 — A short role paragraph, then bullets
- Applies to: CV / experience
- Rule: under the title, company and dates of each job: a short paragraph (one or two lines) on what the role was, then a few bullets on outcomes (EXP-02). No essay per job.
- Why: the paragraph gives the context of the role in one look; the bullets show the impact. An essay is skipped.
- Sources: 0T8q3B82PRw-en.md (section "Highlighting Skills and Experience", 05:55)
- Agreement: 1 of 5 sources, no conflicts
- Weight: 0.6
- Needs: CV block with jobs: role description, duties, achievements
- Check: each job has a paragraph of at most two lines and bullets
- Limits: the paragraph describes the role from the profile; it is not a second summary

### EXP-04 — A number has context
- Applies to: CV / experience, and any achievement in the summary
- Rule: a number is better than no number, and a number with context is better still. Context is what the number is measured against and at what scale: the baseline or the period ("from 12 to 4 minutes", "in 6 months"), the size (team, budget, users), and what the candidate did to get it. When a number from the profile has no context, the agent asks the candidate for it (GEN-03) and adds the answer to the profile. When the candidate has no context, the number goes in as it is.
- Why: a number shows the result. A bare number ("increased revenue by 40%", "improved team efficiency by 35%") could describe any role at any company, and readers may take it as made up or as a sign of AI writing; a number with context can be checked and asked about in the interview.
- Sources: MxBZjnayQUM-en.md (section "Telltale Signs of AI in Resumes", 02:00); refines EXP-02 from 0T8q3B82PRw-en.md
- Agreement: 2 of 5 sources (EXP-02 asks for numbers, this source asks for their context), no conflicts
- Weight: 0.7
- Needs: achievements with numbers and their context from the profile
- Check: every number is in the profile or confirmed by the candidate; for every number without context, the candidate was asked
- Limits: the agent never adds a number to a bullet to make it look measurable

## Open questions

- **A library of good examples.** Rules say how to write a number or an achievement; a set of good and bad examples by role would show it. To build as the work goes; none yet.

- **Older jobs**: how much space they get and how they are written. They matter, but no rule yet.
