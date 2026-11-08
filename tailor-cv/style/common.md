# Common style rules

Rules that apply in every style: the signs that a text was written by AI.

### STYLE-01 — No pile-up of AI vocabulary
- Applies to: the whole text
- Rule: words and phrases from `lists/ai-vocabulary.md` are used rarely: one or two in a text are fine, several in one paragraph are not. Phrases of "corporate word salad" ("leverage synergies to optimize outcomes", "spearheaded cross-functional initiatives") are rewritten in plain words.
- Why: unnatural phrasing is the most named sign of AI writing; a reader who notices it stops trusting the text. Most people do not talk like that.
- Sources: MxBZjnayQUM-en.md (section "Telltale Signs of AI in Resumes", 02:00; section "The Importance of Authenticity in Job Applications", 10:00)
- Agreement: 1 of 4 authors, no conflicts
- Weight: 0.8
- Check: at most two words from the list in the text, and at most one in a paragraph; no phrase made only of list words
- Limits: a word from the list is not wrong by itself; it is the density that tells

### STYLE-02 — No em dashes
- Applies to: the whole text
- Rule: no em dash (—). Use a comma, a colon, brackets or two sentences instead.
- Why: the em dash is the best-known formatting sign of AI writing; readers treat it as one even when a human wrote it.
- Sources: MxBZjnayQUM-en.md (section "Telltale Signs of AI in Resumes", 02:00)
- Agreement: 1 of 4 authors, no conflicts
- Weight: 0.5
- Check: no "—" in the text
- Limits: none

### STYLE-03 — List items not in one template
- Applies to: lists in the text
- Rule: the items of a list differ in structure and in how they start. At most two items in a row have the same construction (for example, "Verb + noun, resulting in X% Y").
- Why: items cut to one template read as generated; the reader notices the pattern before the content.
- Sources: our addition
- Agreement: no source states it
- Weight: 0.4
- Check: no three items in a row with the same opening word or the same sentence pattern
- Limits: the threshold of two is a first guess, to be checked on real texts

### STYLE-04 — No in-house language
- Applies to: the whole text
- Rule: no words that only people inside one organisation know: internal names of systems, projects and teams, internal abbreviations and terms. Each is replaced with the common term of the reader's field. A name known outside the organisation (for example, a public product) stays, with a few words on what it is.
- Why: the reader does not know the internal name, so the sentence says nothing to them and is skipped.
- Sources: R3abknwWX7k-en.md (section "The Importance of Customization and Clarity", 04:24); a public name with an explanation: our addition
- Agreement: 1 of 4 authors, no conflicts
- Weight: 0.6
- Check: every proper name and abbreviation is either common in the reader's field or explained in the text (LLM check)
- Limits: when it is not clear whether a term is internal or what it stands for, the humanizer flags it to the author instead of guessing a replacement

## Open questions

- **Which styles there are.** No style in `styles/` yet. To decide: the first style for a CV, and how the project picks one.
