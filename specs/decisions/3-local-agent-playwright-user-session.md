# Local agent, web access through Playwright with the user's browser session

Status: accepted
Date: 2026-10-23
Issue: #3
Affects: #3, #4, #5, #6; all systems

## Context

The agent reads job pages on arbitrary sites. Many job sites need a login, show captchas, or block automated clients. A hosted service would have to solve authentication and bot detection for every site. The agent has a single user, who gives it every vacancy URL.

## Decision

- The agent runs fully locally on the user's machine. No hosted service.
- The agent opens web pages through Playwright, using the user's own browser session (cookies). Pages open the same way they do in the user's browser, including pages that need the user to be logged in.
- The user's cookies and browser profile stay on the machine. They are never committed or sent anywhere else.

## Consequences

- No server, deployment or multi-user support in scope.
- Login walls and captchas are handled by the user's session, not by the agent.
- Plain HTTP fetching is not the main path, even for static sites, so that every site goes through the same fetcher.
- How the session is reused (existing profile, dedicated profile, exported cookies) is decided in #6.
