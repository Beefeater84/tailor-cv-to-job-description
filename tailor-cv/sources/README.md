# sources

Materials the writing rules of the CV writer are based on. New sources are added over time; the rules are rebuilt from the whole set, and every rule names the sources it comes from by file name.

## Sources

| File | Title | Author | Kind | Rules |
|---|---|---|---|---|
| [`0T8q3B82PRw-en.md`](0T8q3B82PRw-en.md) | Why Recruiters Reject Your CV in 6 Seconds (and How to Fix It) | Lee Harding | Video transcript | processed 2026-10-28 |
| [`4Qh7C5AA34o-en.md`](4Qh7C5AA34o-en.md) | How To Write A Resume Recruiters Actually Want To Read | A Life After Layoff | Video transcript | partial 2026-10-28: "Work Experience and Education" is cut short in the transcript |
| [`MxBZjnayQUM-en.md`](MxBZjnayQUM-en.md) | Hiring Managers Can Tell When You Use AI On Your Resume. Here's How. | A Life After Layoff | Video transcript | processed 2026-10-28 |
| [`N1Fm4JYae1I-en.md`](N1Fm4JYae1I-en.md) | Write a Killer Résumé in the AI Era: 5 New Rules! | Jeff Su | Video transcript | processed 2026-10-29 |
| [`R3abknwWX7k-en.md`](R3abknwWX7k-en.md) | Tips For How To Write A Better Resume (From A Recruiter's Perspective) | A Life After Layoff | Video transcript | processed 2026-10-29 |
| [`3cizyWQbfQc-en.md`](3cizyWQbfQc-en.md) | 7 Career Rules You Should Stop Following in Today's Job Market | A Life After Layoff | Video transcript | processed 2026-10-29: no rules, career advice; CV points repeat the same author |
| [`6N6H_KQxPWE-ru.md`](6N6H_KQxPWE-ru.md) | 15 000 резюме на одну роль. Как теперь компании выбирают кандидатов (Кира Кузьменко, подкаст Собес) | Кира Кузьменко (podcast Собес, channel Либо🔺Либо) | Video transcript, Russian original | partial 2026-10-29: read up to 29:54 |
| [`6N6H_KQxPWE-en.md`](6N6H_KQxPWE-en.md) | 15,000 Resumes for One Role. How Companies Now Select Candidates | Kira Kuzmenko (podcast Sobes, channel Either🔺Either) | English translation of `6N6H_KQxPWE-ru.md` | see `-ru` |

## Rules status

Which sources the rules are already built from. It is kept in two places: the column "Rules" above, and the front matter of each source file:

- `rules_status`: `new` (not read yet), `partial` (read in part, see `rules_note`), `processed` (read in full, its rules are in `../rules/` and `../style/`).
- `rules_date`: when the status last changed.
- `rules_note`: what is left, for `partial`.

The table is the main record: a transcript fetched again from `youtube-to-text` comes without these fields, so they are copied back from the table.

## Video transcripts

The transcripts come from `inline-md-runs/` of the repository `Beefeater84/youtube-to-text` (branch `staging`). The file name is `<video-id>-<language>.md`, and the video is `https://www.youtube.com/watch?v=<video-id>`. The front matter holds `video_id`, `title`, `channel`, `duration` (seconds), `language` and the `sections` with their timestamps, plus the rules status fields above.

`4Qh7C5AA34o-en.md` was built from the Arabic auto-dub track translated back to English, so its wording is less exact than the others.

`6N6H_KQxPWE` is a Russian podcast: `-ru` is the original, `-en` its translation. Rules cite the `-ru` file. The podcast has several guests from different companies; for Agreement it counts as one source, by its host Kira Kuzmenko.

## Adding a source

1. Put the file in this folder. A video transcript keeps the name and front matter of `youtube-to-text`; another kind of source gets a front matter with at least `title`, the author and the original URL.
2. Add `rules_status: "new"` to its front matter and a row to the table above.
3. Rebuild the writing rules from the whole set of sources, and update the status as the source is read.
