# General

Rules for the whole CV and the whole cover letter.

### GEN-01 — No empty clichés
- Applies to: CV, cover letter
- Rule: never use phrases that say nothing, such as "proven track record" or "results-driven individual". Replace each with a fact from the profile.
- Why: the recruiter reads clichés as noise; they take the place of facts that would catch the recruiter's eye. Soft skills such as "team player" are checked in the interview; claiming them in the CV proves nothing.
- Sources: 0T8q3B82PRw-en.md (section "Crafting a Professional Summary", 02:05); N1Fm4JYae1I-en.md (section "Rule 3: Use AI Thoughtfully", 06:11): hiring managers reject generic CVs that show little effort; R3abknwWX7k-en.md (section "Avoiding Generic Language and Stubbornness", 06:40)
- Agreement: 3 of 5 sources, no conflicts
- Weight: 0.6
- Needs: nothing
- Check: no phrase from `lists/cliches.md`
- Limits: matters most in the summary (SUM-01). Clichés are about content (the phrase says nothing about the candidate); the signs of AI writing are a matter of style, see `../style/`.

### GEN-02 — Two modes: one vacancy or a job family; the cover letter is always for one vacancy
- Applies to: CV, cover letter
- Rule: the writer works in two modes. One to one: the CV is tailored to one vacancy. Job family: one CV is tailored to a group of 3–5 similar vacancies for one role. In both modes the CV names no company; the cover letter is written for one vacancy and is where the company name and the reasons for this company go.
- Why: vacancies for one role ask for broadly the same things, so a CV that speaks to the whole family is tailored enough, and one strong version beats a CV rewritten for every application. A single vacancy that matters on its own still gets its own CV.
- Sources: 0T8q3B82PRw-en.md (section "Tailoring Your CV for Job Applications", 08:51); R3abknwWX7k-en.md (section "The Importance of Customization and Clarity", 04:24): tailoring matters most where the competition is high, such as remote roles, which supports the one-to-one mode; 6N6H_KQxPWE-ru.md (section "Заключение и советы для соискателей", 18:24): four or five narrow CVs, each for one specialization within the profession, are usually enough, which supports the job family mode; the two modes, 3–5 vacancies and the cover letter as the personal part: owner
- Agreement: 3 of 5 sources. 0T8q3B82PRw-en.md calls tailoring to every vacancy unrealistic, R3abknwWX7k-en.md asks for it; the two modes hold both.
- Weight: 0.7
- Needs: the requirements of the vacancy, or of all vacancies in the group to find what they share
- Check: the CV names no company; the cover letter is tied to one vacancy
- Limits: see the open question "Input of the writer"

### GEN-03 — Ask the candidate to bring up matching experience
- Applies to: the agent's dialogue with the candidate, before the CV is written
- Rule: when the vacancy asks for something the CV does not show well, or a bullet has no result, the agent tells the candidate what matters for this vacancy and asks about similar experience: "For this vacancy X and Y matter. You have similar experience in Z; let's bring up these achievements. Is there a result in numbers?" What the candidate answers is added to the profile and only then used in the CV.
  For each achievement the agent asks three things: the final result, the candidate's own contribution, and how it was achieved. When the result is a team's, the agent asks for the candidate's role in it, and the bullet names both: the team's result and the candidate's part. When a result has no number, the agent suggests which kind of metric it could have (time, money, volume, errors, users) and asks the candidate for the value.
- Why: a candidate often gives a CV that does not show the experience the vacancy needs, though the candidate has it. Asking finds real facts instead of inventing them. In the interview the recruiter or the hiring manager asks "and what did you do?"; a team result without the candidate's role reads as someone else's achievement.
- Sources: owner; 4Qh7C5AA34o-en.md (section "Customizing the Resume", 10:41): find what the vacancy requires and ask the candidate to confirm the experience; N1Fm4JYae1I-en.md (section "Rule 3: Use AI Thoughtfully", 06:11): result, contribution, how; section "Rule 4: Quantify Your Impact", 08:38: identify the metrics of each experience; the team result and the candidate's role: our addition
- Agreement: 2 of 5 sources, no conflicts
- Weight: none, this is agent behaviour, not a property of the CV
- Needs: requirements of the vacancy or the job family; the profile, to find what is missing or weak
- Check: every gap the agent found was either asked about or reported to the candidate
  When a key requirement has no experience behind it at all, the agent may suggest a small project that shows it (PROJ-01); the candidate decides whether to do it (GEN-10).
- Limits: the agent asks, it never fills a gap itself. A requirement the candidate has no experience for is reported as a gap, not hidden. The agent suggests the kind of metric, never its value.

### GEN-04 — Content that can be skimmed
- Applies to: CV
- Rule: bullets instead of paragraphs; one thought per bullet, one or two lines long; standard section names (Summary, Experience, Skills, Education).
- Why: the recruiter skims, not reads. What takes effort to find is skipped.
- Sources: 0T8q3B82PRw-en.md (section "Making Your CV Readable", 03:50); N1Fm4JYae1I-en.md (section "Rule 1: Make Your Resume AI-Friendly", 02:18): conventional headings, so the AI screener reads the CV correctly; R3abknwWX7k-en.md (section "The Importance of Customization and Clarity", 04:24): long blocks of text get skipped
- Agreement: 3 of 5 sources, no conflicts
- Weight: 0.7
- Needs: nothing
- Check: no bullet longer than two lines; no paragraph outside the summary and the short role description; section names from the standard list
- Limits: the layout part (one column, spacing) belongs to the PDF creator, see the comment in the epic "PDF creator" (#5)

### GEN-05 — The top third answers "can this person do the job?"
- Applies to: CV
- Rule: the top third of the first page shows who the candidate is, what they do, where they are, their most recent job, and that they match the vacancy. The header, the summary and the start of the most recent job are short enough to fit there.
- Why: the recruiter spends 6–10 seconds on a CV and looks at the top third. If the answer is not there, the CV is dropped, even when the candidate is qualified.
- Sources: 0T8q3B82PRw-en.md (sections "Understanding CV Importance" and "Key Elements Recruiters Look For", 00:00–02:05); R3abknwWX7k-en.md (section "Introduction to Resume Writing Tips", 00:00): a five-second glance; 6N6H_KQxPWE-ru.md (section "Масснайм и автоматизация рекрутинга", 10:25): about 15,000 CVs a month for 20–30 hires, so a person can only skim each
- Agreement: 3 of 5 sources, no conflicts
- Weight: 1.0
- Needs: everything HEADER-01..03, SUM-01 and EXP-01 need
- Check: HEADER-01..03, SUM-01 and EXP-01 pass; the rendered top third holds them (checked after the PDF is made)
- Limits: an umbrella over the header, summary and experience rules; fitting it on the page is the PDF creator's part (#5)

### GEN-06 — Section order
- Applies to: CV
- Rule: the sections go in this order: header (name, job title, location, contacts), summary, competencies, skills, experience (with career gaps in their place), projects (only when PROJ-01 calls for it), education.
- Why: the recruiter reads top down and stops early. The order puts who the candidate is and what they can do first, and the proof right after.
- Sources: 0T8q3B82PRw-en.md (sections "Structuring Your CV Effectively", 04:26, "Highlighting Skills and Experience", 05:55, "Final Tips for a Strong CV", 08:15); 4Qh7C5AA34o-en.md (competencies under the profile); skills before experience: also owner; projects as a separate section: N1Fm4JYae1I-en.md (section "Rule 5: Demonstrate Your AI Skills", 10:36), its place after experience: owner
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
- Sources: 4Qh7C5AA34o-en.md (section "Customizing the Resume", 10:41): "look at what the job posting asks for and only provide what they need"; N1Fm4JYae1I-en.md (section "Rule 2: Tailor Your Resume Effectively", 03:47): tailored CVs got 5.71% interviews against 3.09% for untailored; R3abknwWX7k-en.md (section "Contact Information and Resume Customization", 03:04): not a summary of everything, only what the employer looks for; owner
- Agreement: 3 of 5 sources, no conflicts
- Weight: 0.9
- Needs: the requirements of the vacancy, or of each vacancy in the group; the whole profile
- Check: every block of the CV can be traced to a requirement of the vacancy (or group) or to a rule that requires it (header, dates)
- Limits: selecting and rewording only; never inventing (the epic rule). A requirement with nothing in the profile is asked about or reported as a gap.

### GEN-09 — Two readers: the ATS and the human
- Applies to: CV
- Rule: the CV is written for two readers at once. The machine reader is the ATS or an AI screener that reads, ranks and sorts the applications. For it, the keywords of the vacancy (skills, tools, competencies, job titles, in the vacancy's wording) may go anywhere in the CV: summary, competencies, skills, experience bullets. For the human, every place they go stays readable: a keyword is part of a sentence or a list item that makes sense, never a pile of keywords.
  The balance between the two readers depends on the region of the vacancy. For a vacancy in the EU the human reader comes first: the blocks of the CV are clearly separated, the keywords stand where a skimming eye finds them (the top third, the skills, the start of the bullets), and any sign of over-optimization (GEN-12) or of AI writing (`../style/`) costs more.
- Why: the machine reader matches the CV against the vacancy and does not care where the keywords are; the recruiter and the hiring manager skim and drop a CV that reads like a keyword list. The human still decides: only a few hiring managers let AI pass or reject a candidate. In the EU a human must make the decision on every candidate, and some companies turn the AI scoring of their ATS off, leaving the recruiter an assistant that looks for keywords the recruiter sets. There every CV is read by a person, who does not read it through: the person picks out the keywords, checks them against the vacancy, and notices AI text and over-optimization at once. Advice written for one reader conflicts with advice written for the other (for example, the number of skills, SKILL-01).
- Sources: N1Fm4JYae1I-en.md (sections "Two Stages of Resume Evaluation", 01:31, and "Recap and Conclusion", 12:30): "pass the AI, pass the human"; 6N6H_KQxPWE-ru.md (section "Использование ИИ в рекрутинге", 14:15): AI scoring turned off for EU candidates because of the AI Act; the human reader first for the EU, structure, and sensitivity to AI text: owner; the conflict between 0T8q3B82PRw-en.md (section "Highlighting Skills and Experience", 05:55) and 4Qh7C5AA34o-en.md (section "Adding Skills and Projects", 09:19)
- Agreement: 2 sources state it; it explains a conflict between two others
- Weight: 0.8
- Needs: keywords from the requirements of the vacancy or the group; vacancy field `location`, for the region (#39)
- Check: every keyword of the vacancy that the profile backs appears in the CV; no line is a bare list of keywords outside the competencies and skills sections
- Limits: a keyword goes in only when the profile backs it (GEN-08, GEN-03). How close to the vacancy's wording is too close is an open question ("Mirroring the vacancy").

### GEN-10 — The candidate decides; the agent informs
- Applies to: the agent's work with the candidate
- Rule: the facts in the CV come from the profile and from the candidate's answers; the candidate is responsible for them. The agent helps: it selects, rewords, asks and warns about risks, but it does not decide for the candidate what goes in. When the candidate wants something the rules advise against, the agent says why and what the risk is; if the candidate confirms, it stays.
- Why: the agent works on the candidate's side. A fact the candidate confirmed is theirs to stand behind in the interview, and only the candidate knows their career.
- Sources: owner. Covers the sign of AI writing "the CV does not fit the candidate's career" (jargon of an industry the candidate never worked in) from MxBZjnayQUM-en.md (section "Contextual Inconsistencies and Authenticity", 07:00): the agent takes facts only from the candidate, so it does not filter them.
- Agreement: no source states it; it is a product principle
- Weight: none, this is agent behaviour, not a property of the CV
- Needs: nothing
- Check: every rule the candidate overrode has a recorded warning and the candidate's confirmation
- Limits: the agent itself still never invents (the epic rule); the candidate's choice covers what the candidate gives, not what the agent would make up

### GEN-11 — No hidden text
- Applies to: CV
- Rule: the writer never adds hidden text (white or tiny font, keywords the candidate does not have, instructions to an AI screener). The validator looks for it. When the candidate asks to add it, the agent warns that modern ATS strip formatting and show the hidden text, recruiters mark such a CV, and a note in the ATS can block the candidate at that company in the future. If the candidate still confirms, it stays (GEN-10).
- Why: the ATS parses the hidden text like any other; it does not get the CV through, and when the recruiter sees it, the candidate loses trust, often for good.
- Sources: MxBZjnayQUM-en.md (section "Matching Job Descriptions and Hidden Text", 04:00); 6N6H_KQxPWE-ru.md (section "Заключение и советы для соискателей", 18:24): do not try to trick the system with keywords in white font; keeping it on the candidate's confirmation: owner
- Agreement: 2 of 5 sources, no conflicts
- Weight: 1.0
- Needs: nothing
- Check: no text with the background colour or a font far smaller than the rest; no instructions to an AI in the text; if present, the candidate's confirmation is recorded
- Limits: rendering is the PDF creator's part (#5); the validator checks the rendered file too

### GEN-12 — The line between tailoring and over-optimizing
- Applies to: CV
- Rule: a term of the vacancy (skill, tool, competency, job title) goes into the CV only when it passes three tests:
  1. Backing: the profile has work behind it, or the candidate confirmed it (GEN-03).
  2. Context: for a must-have requirement of the vacancy, an experience bullet (or a project, PROJ-01) uses the term to describe that work. In the skills and competencies lists the term may also stand as a list item. A nice-to-have term may stand in a list alone.
  3. Own words: the sentence is the candidate's, not a sentence of the vacancy, and the skills do not follow the vacancy's order.
  The vacancy's terms are taken; its sentences are not.
- Why: the AI screener and the human check what stands behind a keyword. CVs crammed with the vacancy's phrases without backing got fewer interviews than CVs with fewer keywords that described real work. A CV that retells the vacancy is recognised at once by the hiring manager, who wrote it.
- Sources: N1Fm4JYae1I-en.md (section "Rule 2: Tailor Your Resume Effectively", 03:47): keyword mapping (tests 1 and 2) against keyword stuffing; MxBZjnayQUM-en.md (section "Matching Job Descriptions and Hidden Text", 04:00): mirroring the vacancy (test 3); context only for must-have: owner
- Agreement: 2 of 5 sources, no conflicts
- Weight: 0.8
- Needs: the terms of the vacancy or the group, split into must-have and nice-to-have (from the vacancy analysis); the profile
- Check: for every term of the vacancy in the CV: backing in the profile or a recorded confirmation; for every must-have term, a bullet or project that uses it; no run of words copied from the vacancy (length: see "Mirroring the vacancy"); the skills are not in the vacancy's order
- Limits: GEN-09 says who the CV is written for and where keywords may go; this rule says which of them may go in and how. The count of keywords is not a test by itself: too many keywords hurt because they usually come without backing.

### GEN-13 — The problems the role is hired to solve
- Applies to: CV, the agent's work before writing
- Rule: from the vacancy text (responsibilities, the team, what the role must change, words like "from scratch", "scale", "migrate", "bring order to") the agent derives one to three problems the role is opened to solve. For each problem it looks in the profile for an achievement where the candidate solved a similar one and puts it forward: in the "achieved" part of the summary (SUM-01) and in the first bullets of the job it belongs to (EXP-02). When the profile has none, the agent asks the candidate (GEN-03).
- Why: a role is opened because something needs to be solved. The requirements are a checklist; the hiring manager looks for someone who has already solved this problem. A CV that shows it answers the real question, not only the checklist.
- Sources: N1Fm4JYae1I-en.md (section "Rule 2: Tailor Your Resume Effectively", 03:47): "identify key problems and skills"; a separate rule focused on the problems: owner
- Agreement: 1 of 5 sources, no conflicts
- Weight: 0.7, lower than GEN-08: the problems are an interpretation of the text, and the agent can read it wrong
- Needs: the full text of the vacancy or of each vacancy in the group; achievements from the profile. The problems are derived in the vacancy analysis, they are not a field of the vacancy contract: the contract holds what the vacancy says, the problems are a reading of it, and in the job family mode they are merged across the group.
- Check: the analysis names the problems; for each one, the CV shows a matching achievement in the summary or the first bullets, or the candidate was asked
- Limits: problems only from the vacancy text, no guesses beyond it. The CV never names the company's problem ("you struggle with X"); that belongs to the cover letter.

### GEN-14 — The CV stands alone; the cover letter only adds
- Applies to: CV, cover letter
- Rule: everything needed to decide on the candidate is in the CV: the fit with the vacancy, the requirements, the industry and market type, the location and work format, the reasons for gaps. The cover letter adds only the personal part for one vacancy: the company name and why this company (GEN-02). No fact about the candidate lives only in the letter. The cover letter is optional: written when the candidate asks for it, for a vacancy that matters to them.
- Why: cover letters are almost never read; the field for one is often there only because the ATS asks for it by default. A fact that is only in the letter is not seen, and the CV loses without it.
- Sources: 6N6H_KQxPWE-ru.md (section "Сопроводительные письма и личные сообщения", 35:06): about 99% of cover letters are not read, write one only for a company you really want; everything that matters goes into the CV: owner
- Agreement: 1 of 5 sources, no conflicts
- Weight: 0.8
- Needs: nothing beyond the other rules
- Check: every fact in the cover letter that answers a requirement of the vacancy is also in the CV
- Limits: the CV is tailored to a group of similar vacancies, not rewritten for each company; the company name and the motivation stay in the letter

## Open questions

- **Mirroring the vacancy.** A CV that repeats the vacancy too closely (its sentences, all its skills in the same order) is a sign of AI writing (MxBZjnayQUM-en.md, section "Matching Job Descriptions and Hidden Text", 04:00). GEN-12 sets the line: the vacancy's terms are taken, its sentences and order are not. Still open: how long a run of words copied from the vacancy counts as copying, and how the validator checks it. An experiment to try (owner): the CV says openly that it was assembled for this vacancy from the candidate's index CV and links to the index CV. It will not suit every candidate.

- **Region and the balance of the readers** (GEN-09): for an EU vacancy the human reader comes first. To decide: how much the weights of GEN-04, GEN-05, GEN-12 and the style score rise for such a vacancy, and which regions besides the EU count. The source is one company (6N6H_KQxPWE-ru.md); other companies in the EU may keep AI scoring with a human making the final decision.

- **Photo by country** (GEN-07): the source is from the UK market. In some countries (for example Germany) a photo on a CV is still common. To decide: whether the rule depends on the vacancy's country.

- **Input of the writer.** GEN-02 means the CV writer takes either one vacancy or a group of vacancies, while the epic "Tailored CV and cover letter writer" (#4) describes the input as one vacancy. To decide in the writer design (#34): how the mode is chosen, how a group is formed, and how the requirements of the group are merged.
