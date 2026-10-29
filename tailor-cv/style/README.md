# style

Rules for how a text sounds, used by the humanizer: the agent that checks the style of a finished text and removes the signs of AI writing. The text can be anything: a CV, a cover letter, a LinkedIn post.

## Independent of the CV

This folder is meant to move out of `tailor-cv/` later and serve other projects. So:

- Nothing here refers to a CV, a vacancy, the candidate profile or the rule ids in `../rules/`. The CV rules refer to the style, never the other way round.
- Rules here are about wording, punctuation and tone. What the text must contain (facts, sections, keywords) belongs to the project that uses the style.
- Sources are named by file name and section. The files live in `../sources/` for now; when the folder moves, the sources it cites move with it.

## Structure

| Path | Holds |
|---|---|
| `common.md` | Rules that apply in every style: the signs of AI writing. |
| `styles/<name>.md` | One switchable style: tone, sentence length, person, how formal. The project that uses the humanizer picks one. |
| `lists/<name>.md` | Word and phrase lists the rules use, for example `lists/ai-vocabulary.md`. A list is extended without changing the rules. |

A file is created when its first rule appears. Each rule file ends with a section "Open questions".

## Rule card

The same card as in `../rules/README.md`, with the id prefix `STYLE-` for `common.md` and the style name for a style (for example `PLAIN-01`). Fields that refer to a CV (Needs: CV block, vacancy field) are left out. Weight is how much the rule counts in the style score of the text.
