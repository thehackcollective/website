# work.hackcollective.uk: PRD

Status: Next. A skeleton, not built. The open questions are in `docs/work-platform/map.md`.
Scope: `internal/` (the client) and `workers/internal/` (the Worker).

## 1. Goal

Work is THC's CRM for events, people, sponsors and follow-ups.

## 2. Users and access

- Sign-in is Clerk, invite only. Nobody can sign up without an invite.
- Roles: open.

## 3. Modules

| Module | Status |
| --- | --- |
| Events | Next. Fields open (map question 1). |
| People | Next. Who counts as a person is open (map question 2). |
| Sponsors | Next. Stages open (map question 3). |
| Follow-ups | Next. Shape open (map question 4). |
| Agent | Next. Fed by WhatsApp through wacli. What it writes is open (map question 6). |

## 4. Design

Work follows `docs/decisions/2026-11-11-work-design-foundations.md` and its detail records. Each module is a feature folder in `internal/work/features/<name>/`.

## 5. Decisions

None yet. Each decision gets a row here with its source when Louis makes it.

| # | Decision | Source |
| --- | --- | --- |
