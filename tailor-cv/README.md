# tailor-cv

The writer stage of the pipeline (epic "Tailored CV and cover letter writer" (#4)): it takes the vacancy from the vacancy reader and the candidate profile, and writes a CV and a cover letter tailored to that vacancy. The module holds the files of this epic.

- **Sources** (available now): recruiter and career materials the writing rules are based on. See [`sources/README.md`](sources/README.md).
- **Writing rules** (in progress): how the agent tailors the CV and the cover letter to a vacancy, built from the sources and grouped by section of the tailored CV. Every rule names the sources it comes from. See [`rules/README.md`](rules/README.md).
- **Style** (in progress): rules for how a text sounds, used by the humanizer to remove the signs of AI writing. Independent of the CV, to be moved out and reused in other projects. See [`style/README.md`](style/README.md). Research: "best practices for a tailored CV and cover letter, and the data they need" (#29).

The module has no code yet. The module name `tailor-cv/` answers the module name question of the writer design (#34).
