# General

Rules for the whole CV and the whole cover letter.

### GEN-01 — No empty clichés
- Applies to: CV, cover letter
- Rule: never use phrases that say nothing, such as "proven track record" or "results-driven individual". Replace each with a fact from the profile.
- Why: the recruiter reads clichés as noise; they take the place of facts that would catch the recruiter's eye.
- Sources: 0T8q3B82PRw-en.md (section "Crafting a Professional Summary", 02:05)
- Agreement: 1 of 5 sources, no conflicts
- Weight: 0.6
- Needs: nothing
- Check: no phrase from `lists/cliches.md`
- Limits: matters most in the summary (SUM-01). Clichés are about content (the phrase says nothing about the candidate); the signs of AI writing are a matter of style, see `../style/`.

### GEN-02 — Two modes: one vacancy or a job family; the cover letter is always for one vacancy
- Applies to: CV, cover letter
- Rule: the writer works in two modes. One to one: the CV is tailored to one vacancy. Job family: one CV is tailored to a group of 3–5 similar vacancies for one role. In both modes the CV names no company; the cover letter is written for one vacancy and is where the company name and the reasons for this company go.
- Why: vacancies for one role ask for broadly the same things, so a CV that speaks to the whole family is tailored enough, and one strong version beats a CV rewritten for every application. A single vacancy that matters on its own still gets its own CV.
- Sources: 0T8q3B82PRw-en.md (section "Tailoring Your CV for Job Applications", 08:51); the two modes, 3–5 vacancies and the cover letter as the personal part: owner
- Agreement: 1 of 5 sources, no conflicts
- Weight: 0.7
- Needs: the requirements of the vacancy, or of all vacancies in the group to find what they share
- Check: the CV names no company; the cover letter is tied to one vacancy
- Limits: see the open question "Input of the writer"

### GEN-03 — Ask the candidate to bring up matching experience
- Applies to: the agent's dialogue with the candidate, before the CV is written
- Rule: when the vacancy asks for something the CV does not show well, or a bullet has no result, the agent tells the candidate what matters for this vacancy and asks about similar experience: "For this vacancy X and Y matter. You have similar experience in Z; let's bring up these achievements. Is there a result in numbers?" What the candidate answers is added to the profile and only then used in the CV.
- Why: a candidate often gives a CV that does not show the experience the vacancy needs, though the candidate has it. Asking finds real facts instead of inventing them.
- Sources: owner; 4Qh7C5AA34o-en.md (section "Customizing the Resume", 10:41): find what the vacancy requires and ask the candidate to confirm the experience
- Agreement: 1 of 5 sources, no conflicts
- Weight: none, this is agent behaviour, not a property of the CV
- Needs: requirements of the vacancy or the job family; the profile, to find what is missing or weak
- Check: every gap the agent found was either asked about or reported to the candidate
- Limits: the agent asks, it never fills a gap itself. A requirement the candidate has no experience for is reported as a gap, not hidden.

### GEN-04 — Content that can be skimmed
- Applies to: CV
- Rule: bullets instead of paragraphs; one thought per bullet, one or two lines long; standard section names (Summary, Experience, Skills, Education).
- Why: the recruiter skims, not reads. What takes effort to find is skipped.
- Sources: 0T8q3B82PRw-en.md (section "Making Your CV Readable", 03:50)
- Agreement: 1 of 5 sources, no conflicts
- Weight: 0.7
- Needs: nothing
- Check: no bullet longer than two lines; no paragraph outside the summary and the short role description; section names from the standard list
- Limits: the layout part (one column, spacing) belongs to the PDF creator, see the comment in the epic "PDF creator" (#5)

### GEN-05 — The top third answers "can this person do the job?"
- Applies to: CV
- Rule: the top third of the first page shows who the candidate is, what they do, where they are, their most recent job, and that they match the vacancy. The header, the summary and the start of the most recent job are short enough to fit there.
- Why: the recruiter spends 6–10 seconds on a CV and looks at the top third. If the answer is not there, the CV is dropped, even when the candidate is qualified.
- Sources: 0T8q3B82PRw-en.md (sections "Understanding CV Importance" and "Key Elements Recruiters Look For", 00:00–02:05)
- Agreement: 1 of 5 sources, no conflicts
- Weight: 1.0
- Needs: everything HEADER-01..03, SUM-01 and EXP-01 need
- Check: HEADER-01..03, SUM-01 and EXP-01 pass; the rendered top third holds them (checked after the PDF is made)
- Limits: an umbrella over the header, summary and experience rules; fitting it on the page is the PDF creator's part (#5)

### GEN-06 — Section order
- Applies to: CV
- Rule: the sections go in this order: header (name, job title, location, contacts), summary, competencies, skills, experience (with career gaps in their place), education.
- Why: the recruiter reads top down and stops early. The order puts who the candidate is and what they can do first, and the proof right after.
- Sources: 0T8q3B82PRw-en.md (sections "Structuring Your CV Effectively", 04:26, "Highlighting Skills and Experience", 05:55, "Final Tips for a Strong CV", 08:15); 4Qh7C5AA34o-en.md (competencies under the profile); skills before experience: also owner
- Agreement: 1 of 5 sources, no conflicts
- Weight: 0.7
- Needs: nothing
- Check: sections in this order; no other sections unless a rule allows them
- Limits: the order inside each section is set by the section's rules

### GEN-07 — Leave out what does not help the recruiter say yes
- Applies to: CV
- Rule: no photo, no "References available on request" line, no hobbies unless they are impressive or relevant to the role.
- Why: everything that does not help the recruiter decide makes the CV more cluttered and the strong parts harder to see.
- Sources: 0T8q3B82PRw-en.md (section "Final Tips for a Strong CV", 08:15)
- Agreement: 1 of 5 sources, no conflicts
- Weight: 0.4
- Needs: hobbies from the profile, to judge their relevance
- Check: no photo; no references line; hobbies only with a stated relevance
- Limits: see the open question "Photo by country"

### GEN-08 — The vacancy's requirements come first
- Applies to: CV, the agent's work before writing
- Rule: the agent starts from the requirements of the vacancy (or of the group of vacancies), not from the CV. From them it decides what to take from the profile, how to reword it, and what to ask the candidate (GEN-03). What the vacancy does not need stays in the profile and out of the CV.
- Why: the recruiter, the hiring manager and the ATS all check the CV against the vacancy. A CV built from the vacancy's requirements answers that check; a CV built from the profile tells the whole career and buries the fit.
- Sources: 4Qh7C5AA34o-en.md (section "Customizing the Resume", 10:41): "look at what the job posting asks for and only provide what they need"; owner
- Agreement: 1 of 5 sources, no conflicts
- Weight: 0.9
- Needs: the requirements of the vacancy, or of each vacancy in the group; the whole profile
- Check: every block of the CV can be traced to a requirement of the vacancy (or group) or to a rule that requires it (header, dates)
- Limits: selecting and rewording only; never inventing (the epic rule). A requirement with nothing in the profile is asked about or reported as a gap.

### GEN-09 — Two readers: the ATS and the human
- Applies to: CV
- Rule: the CV is written for two readers at once. For the ATS, the keywords of the vacancy (skills, tools, competencies, job titles, in the vacancy's wording) may go anywhere in the CV: summary, competencies, skills, experience bullets. For the human, every place they go stays readable: a keyword is part of a sentence or a list item that makes sense, never a pile of keywords.
- Why: the ATS matches the CV against the vacancy by keywords and does not care where they are; the recruiter and the hiring manager skim and drop a CV that reads like a keyword list. Advice written for one reader conflicts with advice written for the other (for example, the number of skills, SKILL-01).
- Sources: owner; the conflict between 0T8q3B82PRw-en.md (section "Highlighting Skills and Experience", 05:55) and 4Qh7C5AA34o-en.md (section "Adding Skills and Projects", 09:19)
- Agreement: no source states it; it explains a conflict between two sources
- Weight: 0.8
- Needs: keywords from the requirements of the vacancy or the group
- Check: every keyword of the vacancy that the profile backs appears in the CV; no line is a bare list of keywords outside the competencies and skills sections
- Limits: a keyword goes in only when the profile backs it (GEN-08, GEN-03)

## Open questions

- **Photo by country** (GEN-07): the source is from the UK market. In some countries (for example Germany) a photo on a CV is still common. To decide: whether the rule depends on the vacancy's country.

- **Input of the writer.** GEN-02 means the CV writer takes either one vacancy or a group of vacancies, while the epic "Tailored CV and cover letter writer" (#4) describes the input as one vacancy. To decide in the writer design (#34): how the mode is chosen, how a group is formed, and how the requirements of the group are merged.
