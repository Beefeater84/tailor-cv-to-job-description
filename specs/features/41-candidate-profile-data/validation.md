# Validation: #41 Candidate profile data the writing rules need

## Tools

- grep, git

## Checklist

- [ ] The document exists — auto: `test -f tailor-cv/profile-data.md`
- [ ] Every block P-01…P-11 has a Rules line — auto: `grep -c "^- Rules:" tailor-cv/profile-data.md` gives 11
- [ ] No "(#41)" placeholder is left in the module — auto: `! grep -rn "(#41)" tailor-cv`
- [ ] Needs lines that name a profile block cite the document — auto: `grep -rn "Needs:.*profile block" tailor-cv/rules | grep -v "profile-data.md"` prints nothing
- [ ] GAP-01 no longer requires explaining every gap — manual: read `tailor-cv/rules/cv/gaps.md`
- [ ] The document matches the approach (blocks, selection of achievements, assumptions) — manual: read `tailor-cv/profile-data.md` against the approach comment
- [ ] "Candidate profile contract and CV block registry" (#30) links to the document — manual: the comment on #30

## Smoke tests

- Take one rule card (for example EXP-04) and find in the document every profile fact it needs.
