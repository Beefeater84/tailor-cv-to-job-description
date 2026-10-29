# rules

The writing rules of the CV writer: how the agent tailors a CV and a cover letter to one vacancy. They are built from the materials in [`../sources/`](../sources/README.md), and every rule names the sources it comes from.

These rules describe how the agent writes. They are not project decisions: ADRs, feature descriptions and other decisions about this project live in `specs/`.

The format below is a draft. It is tried on the first sources and changed as the rules grow.

## Who uses the rules

`tailor-cv` works in four steps, in this order; each reads the rules in its own way.

| Step | Does | Uses |
|---|---|---|
| vacancy analysis | takes one vacancy or a group from the vacancy reader and derives the input of the writer: the requirements (must-have and nice-to-have), the tags (role, seniority, industry, whether the role is technical or about AI), the keywords, and the problems the role is hired to solve (GEN-13) | the rules whose **Needs** name a result of the analysis |
| writer | builds the CV and the cover letter from the analysis and the candidate's profile | the **Rule** field of the cards here |
| validator | checks the finished text against the analysis and scores it: how well the CV is tailored, and that it is not over-optimized (GEN-12) | the **Check** and **Weight** fields of the cards here |
| humanizer | checks the style and removes the signs of AI writing | [`../style/`](../style/README.md), a separate folder that knows nothing about CVs, to be reused in other projects |

The writer and the validator read the same analysis, so the validator checks the CV against the same requirements and keywords the writer used.

## Groups

Rules are grouped by the place they apply to, so a change to one block of the CV touches only that block's file.

| File | Holds |
|---|---|
| `general.md` | Rules for the whole CV or the whole cover letter: honesty, order, length, wording, ATS readability. |
| `cv/<block>.md` | Rules for one block of the CV, for example `cv/header.md`, `cv/summary.md`, `cv/experience.md`. |
| `cover-letter/<block>.md` | Rules for one part of the cover letter. |
| `lists/<name>.md` | Word and phrase lists the rules use, for example `lists/cliches.md`. A list is extended without changing the rules. |

Rules about layout (columns, fonts, spacing, page size) are not kept here: they belong to the PDF creator and are written as comments in the epic "PDF creator" (#5).

A file is created when its first rule appears. It ends with a section "Open questions": decisions about its rules that are not made yet. Block names follow the CV block registry of the candidate profile (#30) where it has a matching block.

## Rule card

```markdown
### HEADER-01 — Short name of the rule
- Applies to: CV / header
- Rule: what the agent does, in one or two sentences.
- Why: what the recruiter or the ATS gains from it.
- Sources: 0T8q3B82PRw-en.md (section "…", 02:15), R3abknwWX7k-en.md (section "…")
- Agreement: 2 of 5 sources, no conflicts
- Weight: 0.9
- Needs: CV block `…`; vacancy field `…`
- Check: how to verify the result follows the rule
- Limits: where the rule stops, for example "never invent a metric that is not in the CV"
```

- **Id**: the group prefix and a number, for example `GEN-03`, `HEADER-01`, `EXP-12`. An id is never reused.
- **Why**: a short, plain statement of what the recruiter or the ATS does and what happens to the CV when the rule is broken. Not a retelling of the source.
- **Sources**: the file name in `../sources/` and the section or timestamp. `owner` marks a part added by the product owner, `our addition` a part we derived ourselves; both are kept apart from what the source says.
- **Agreement**: how many sources support the rule and which ones contradict it.
- **Weight**: from 0 to 1, how much the rule counts in the overall score of a CV. 1 means breaking it gets the CV dropped.
- **Needs**: the vacancy fields and CV blocks the rule uses. Together they give the data lists of the research (#29).
- A rule that a new source confirms gets that source added, not a second card.
