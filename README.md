# Tailor CV

An AI agent that helps tailor a CV to a job opening. It runs in [Claude Code](https://claude.com/claude-code) on your own computer.

Русская версия: [README.ru.md](README.ru.md).

## What works now (v0.1.0)

- **Check a CV against the writing rules.** Give Claude Code your CV, and it checks it against the rules in [`tailor-cv/rules/`](tailor-cv/rules/README.md) (header, summary, skills, experience, gaps, projects, education, general rules) and the style rules in [`tailor-cv/style/`](tailor-cv/style/README.md) (signs of AI writing). You get a list of what breaks a rule, why it matters to a recruiter, and how to fix it.
- **Check a CV against a vacancy.** Add a link to a vacancy, and the check also covers how well the CV fits it: its requirements and keywords.
- **Read a vacancy by URL.** The vacancy reader opens the page, extracts the title, the company and the job description, and saves them as Markdown. See [`vacancy-reader/README.md`](vacancy-reader/README.md).

Not yet: writing the tailored CV and the cover letter automatically, and making the PDFs. Until then you can ask Claude Code to rewrite your CV by the rules in the chat.

## Install on Windows

You need a Claude account with a Pro or Max plan (or an Anthropic Console account) to use Claude Code.

Open **PowerShell** (Start menu → type "PowerShell") and run the steps one by one.

### 1. Git and Node.js

```powershell
winget install --id Git.Git -e
winget install --id OpenJS.NodeJS.LTS -e
```

Close PowerShell and open it again, so it sees the new programs. Check:

```powershell
git --version
node --version   # must be v24 or later
```

### 2. Claude Code

```powershell
irm https://claude.ai/install.ps1 | iex
```

Open PowerShell again and run `claude`. It asks you to log in with your Claude account in the browser. Then type `/exit`.

If you prefer an editor, install [VS Code](https://code.visualstudio.com/) and the "Claude Code" extension: it works the same way.

### 3. Get the project

```powershell
cd $HOME\Documents
git clone https://github.com/Beefeater84/tailor-cv-to-job-description.git tailor-cv
cd tailor-cv
```

### 4. Set up the vacancy reader

Needed only to read vacancies by URL.

```powershell
cd vacancy-reader
npm ci
npm run setup
cd ..
```

`npm run setup` downloads a browser (Chromium) for reading vacancy pages. It takes a few minutes.

Optional: an Anthropic API key lets the reader handle sites it has no rule for (today only careers-page.com has one). Copy `vacancy-reader\.env.example` to `vacancy-reader\.env` and put the key after `ANTHROPIC_API_KEY=`. Without a key, Claude Code reads such a page itself.

### 5. A folder for your CV

```powershell
mkdir my-cv
```

Put your CV there as a PDF (in Word: File → Save As → PDF) or as a Markdown or text file. The folder `my-cv/` is ignored by git, so your CV never leaves your computer through this project.

## Use

Start Claude Code in the project folder:

```powershell
cd $HOME\Documents\tailor-cv
claude
```

Then write what you need in plain words, in any language.

**Check a CV against the rules:**

> Check my CV my-cv/cv.pdf against the writing rules. Write the report to my-cv/report.md.

**Check a CV against a vacancy:**

> Check my CV my-cv/cv.pdf against the rules and against this vacancy: https://…

**Read a vacancy:**

> Read this vacancy: https://…

**Fix the CV:**

> Rewrite my summary by the rules. Use only facts from my CV and ask me about anything that is missing.

The agent never invents experience: when a rule needs a fact that is not in your CV (a number, a result, a time zone), it asks you.

### Update

```powershell
cd $HOME\Documents\tailor-cv
git pull
cd vacancy-reader
npm ci
```

## How the full agent will work

```
vacancy URL
  → Vacancy reader   → description, requirements, source_url
  → Writer           + your full CV
                     + CV and cover letter rules
                     + CV design sample
  → PDF creator      → CV.pdf, cover-letter.pdf
```

## Project docs

- [specs/mission.md](specs/mission.md): vision, business rules, scope, open questions
- [specs/tech-stack.md](specs/tech-stack.md): stack, data flow, checks
- [tailor-cv/README.md](tailor-cv/README.md): writing rules, profile contract, style
- [vacancy-reader/README.md](vacancy-reader/README.md): the vacancy reader
- Tasks: [GitHub Issues](https://github.com/Beefeater84/tailor-cv-to-job-description/issues) and the project board
