# sources

Materials the writing rules of the CV writer are based on. New sources are added over time; the rules are rebuilt from the whole set, and every rule names the sources it comes from by file name.

## Sources

| File | Title | Author | Kind |
|---|---|---|---|
| [`0T8q3B82PRw-en.md`](0T8q3B82PRw-en.md) | Why Recruiters Reject Your CV in 6 Seconds (and How to Fix It) | Lee Harding | Video transcript |
| [`4Qh7C5AA34o-en.md`](4Qh7C5AA34o-en.md) | How To Write A Resume Recruiters Actually Want To Read | A Life After Layoff | Video transcript |
| [`MxBZjnayQUM-en.md`](MxBZjnayQUM-en.md) | Hiring Managers Can Tell When You Use AI On Your Resume. Here's How. | A Life After Layoff | Video transcript |
| [`N1Fm4JYae1I-en.md`](N1Fm4JYae1I-en.md) | Write a Killer Résumé in the AI Era: 5 New Rules! | Jeff Su | Video transcript |
| [`R3abknwWX7k-en.md`](R3abknwWX7k-en.md) | Tips For How To Write A Better Resume (From A Recruiter's Perspective) | A Life After Layoff | Video transcript |

## Video transcripts

The transcripts come from `inline-md-runs/` of the repository `Beefeater84/youtube-to-text` (branch `staging`). The file name is `<video-id>-<language>.md`, and the video is `https://www.youtube.com/watch?v=<video-id>`. The front matter holds `video_id`, `title`, `channel`, `duration` (seconds), `language` and the `sections` with their timestamps.

`4Qh7C5AA34o-en.md` was built from the Arabic auto-dub track translated back to English, so its wording is less exact than the others.

## Adding a source

1. Put the file in this folder. A video transcript keeps the name and front matter of `youtube-to-text`; another kind of source gets a front matter with at least `title`, the author and the original URL.
2. Add a row to the table above.
3. Rebuild the writing rules from the whole set of sources.
