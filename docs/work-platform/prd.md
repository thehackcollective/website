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
| Events | Started. Work keeps its own `events` table of the events THC co-hosts, with a link to each Luma page. It does not copy the Luma calendar (decision 4). |
| People | Prototype. `internal/work/features/people/` and `person/`, on the D1 tables of `workers/internal/migrations/` (decisions 1 to 3 and 5 to 7). |
| Sponsors | Next. Stages open (map question 3). |
| Follow-ups | Next. Shape open (map question 4). |
| Agent | Next. Fed by WhatsApp through wacli. What it writes is open (map question 6). |

## 4. Design

Work follows `docs/decisions/2026-11-11-work-design-foundations.md` and its detail records. Each module is a feature folder in `internal/work/features/<name>/`.

## 5. Decisions

Each decision gets a row here with its source.

| # | Decision | Source |
| --- | --- | --- |
| 1 | A person is anyone THC can name with confidence and a tie: a Luma calendar subscriber, a co-host of an event Louis ran, a partner contact, a winner or helper named in a public recap, or a THC WhatsApp member with high intent and a full name or a self-posted profile. | Louis, 2026-11-11 |
| 2 | People sit in five circles: core team, partners, builders, members and subscribers. Ties (core team, organiser, co-host, partner contact, winner, helper, event submitter, group admin, chat voice, builder circuit, personal) hold the evidence, with a source and a date. | Louis, 2026-11-11 |
| 3 | Identity is "confirmed" when a Luma account, a self-posted profile or Louis's own records back it, and "likely" when only a unique full name links two sources. A LinkedIn or X link is stored only when the person published it. | Louis, 2026-11-11 |
| 4 | Work keeps its own `events` table for the events THC co-hosts. The Luma calendar stays the public list. | Louis, 2026-11-11 |
| 5 | Work stores no phone number. WhatsApp facts enter as counts (builder groups, chat messages) and ties. | Louis, 2026-11-11 |
| 6 | The profiling import runs outside the repo. Louis approved its seed in the production D1. | Louis, 2026-11-11 |
| 7 | A LinkedIn agent writes what it finds to `linkedin_checks` only, with a verdict and its evidence. A person reviews each row before it changes `people` or `person_links`. | Louis, 2026-11-11 |
