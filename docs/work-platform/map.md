# Map: work.hackcollective.uk

Status: People is a prototype. The other CRM modules are not built.

## Destination

A PRD (`docs/work-platform/prd.md`) with every product decision made, so Work can be built phase by phase without more questions.

## What is settled

- Work is THC's CRM at work.hackcollective.uk, in `internal/` and `workers/internal/` of this repo.
- Work runs cf0's design foundations with THC blue (`docs/decisions/2026-11-11-work-design-foundations.md`).
- Sign-in is Clerk, invite only.
- The gate and the merge path are the same as for the site (`docs/decisions/2026-11-11-gate-placement.md`).

## Open questions

1. Events: which fields does an event have beyond the THC co-hosted list? Work keeps its own list (PRD decision 4).
2. People: answered in PRD decisions 1 to 3 and 5. Judges are not yet a tie kind.
3. Sponsors: which stages does a sponsor go through, and who owns each sponsor?
4. Follow-ups: what is a follow-up, who gets it, and when is it due?
5. Access: who gets an invite, and do roles differ?
6. The agent: which WhatsApp groups does wacli read for Work, what does the agent write, and which writes wait for a person?

Each answer becomes a decision in `docs/work-platform/prd.md` with its source.
