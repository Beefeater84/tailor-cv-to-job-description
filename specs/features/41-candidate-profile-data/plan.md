# Plan: #41 Candidate profile data the writing rules need

Issue: #41 · Approach: https://github.com/Beefeater84/tailor-cv-to-job-description/issues/41#issuecomment-6542773602
Delivery: -
Later: -

## Group 1: Profile data document

- Task: #41
- Goal: a document that lists the candidate profile blocks P-01…P-11 the writing rules need, in the shape of `tailor-cv/vacancy-data.md`.
- Files: `tailor-cv/profile-data.md` (create)
- Reuse: `tailor-cv/vacancy-data.md` — shape, headings, item format; the approach comment — blocks, assumptions, the selection of achievements
- Done when: every block has Rules, Holds, One or list, Required, How often, Missing; every block names the rules that use it; the document has the table "tailored CV section ← profile blocks", "Computed, not stored", "Not needed", "Not decided yet"; no real personal data.
- Complexity: complex

## Group 2: Gaps rule

- Task: #41
- Goal: rewrite GAP-01 by the owner's decision: by default the CV does not explain a gap; the agent asks only whether there was a project in that period; the reason only when the candidate wants it.
- Files: `tailor-cv/rules/cv/gaps.md` (change), `tailor-cv/rules/general.md` (change, only the lines that describe gaps: GEN-06 "with career gaps in their place", GEN-14 "the reasons for gaps")
- Reuse: approach comment, point 5
- Done when: GAP-01 follows point 5 of the approach; its Sources and Agreement mark the owner's decision against the sources; no rule still requires explaining every gap.
- Complexity: normal

## Group 3: Links to the document

- Task: #41
- Goal: the rules and the module docs point to the profile document.
- Files: `tailor-cv/rules/cv/*.md` and `tailor-cv/rules/general.md` (Needs lines), `tailor-cv/vacancy-data.md` (the "(#41)" mentions), `tailor-cv/rules/README.md` (writer row), `tailor-cv/README.md` (module bullet)
- Reuse: how "Vacancy data the writing rules need" (#42) cited `../vacancy-data.md` V-xx in Needs
- Done when: every Needs line that names a profile block cites `../profile-data.md` and the P-id; no "(#41)" placeholder is left in `tailor-cv/`.
- Complexity: normal
