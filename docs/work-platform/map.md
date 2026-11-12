# Map: work.hackcollective.uk

Status: Next. The CRM modules are not built.

## Destination

A PRD (`docs/work-platform/prd.md`) with every product decision made, so Work can be built phase by phase without more questions.

## What is settled

- Work is THC's CRM at work.hackcollective.uk, in `internal/` and `workers/internal/` of this repo.
- Work runs cf0's design foundations with THC blue (`docs/decisions/2026-11-11-work-design-foundations.md`).
- Sign-in is Clerk, invite only.
- The gate and the merge path are the same as for the site (`docs/decisions/2026-11-11-gate-placement.md`).

## Open questions

1. Events: which fields does an event have, and does Work read the Luma calendar or keep its own list?
2. People: who is a person in Work (members, organisers, judges, sponsor contacts), and which fields does each have?
3. Sponsors: which stages does a sponsor go through, and who owns each sponsor?
4. Follow-ups: what is a follow-up, who gets it, and when is it due?
5. Access: who gets an invite, and do roles differ?
6. The agent: which WhatsApp groups does wacli read for Work, what does the agent write, and which writes wait for a person?

Each answer becomes a decision in `docs/work-platform/prd.md` with its source.
