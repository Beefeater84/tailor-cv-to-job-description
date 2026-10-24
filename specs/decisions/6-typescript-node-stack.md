# Stack: TypeScript on Node 24, npm, Playwright; one module per pipeline stage

Status: accepted
Date: 2026-10-24
Issue: Fetch vacancy pages with Playwright (#6)
Affects: vacancy reader (#3), CV and cover letter writer (#4), PDF creator (#5), vacancy output contract (#8), site parsing rules (#10), matching a URL to a site rule (#11), vacancies from a site without a rule (#12), tool for adding vacancy examples (#14); all modules

## Context

The project had no code and no chosen stack. The first code task, Fetch vacancy pages with Playwright (#6), needs a language, a runtime and a package manager. Node 24 and Chrome are already installed locally. Playwright's native language is TypeScript. The Claude Agent SDK exists for TypeScript, which matters for the later stages.

## Decision

- Language: TypeScript.
- Runtime: Node 24.
- Package manager: npm.
- Browser automation: Playwright (headless Chromium).
- Each pipeline stage is its own top-level module with its own `package.json` (for example `vacancy-reader/`). Stages talk to each other only through defined contracts, as in `mission.md`.
- Checks are typecheck and lint. Tests are added where the logic is non-trivial (parsing, matching, contracts), not for plainly opening a URL.

## Consequences

- All modules use TypeScript on Node 24 and npm. A different language or package manager for a module needs a new ADR.
- Dependencies are installed per module (`cd <module> && npm ci`). There is no root `package.json`.
- Modules do not import each other's code. They share data only through the contracts.
- `specs/tech-stack.md` lists the checks of each module.
