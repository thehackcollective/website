# Decision records

Settled decisions live here, one file per decision: `docs/decisions/{date}-{slug}.md`.

A record exists when a choice is settled enough that agents and reviewers treat it as the standard.

`./c explain <rule-id>` lists each record that names the rule id in backticks, so a record names the checks it relies on.

## Template

```markdown
# {Name}

Status: proposed | accepted | rejected | superseded by {file}
Date:
Scope:
Decision:
Rationale:
Evidence:
Exceptions:
Bad example:
Good example:
Open decisions:
```

## Rules

- One decision per file. The filename is stable and kebab-case.
- An `accepted` record is canonical. Agents and reviewers follow it. A change to it is a product change that needs Louis.
- Every record cites evidence: a PR, a rendered surface, a plan or Louis's words.
- A superseded record gets `Status: superseded by {file}` and stays.

## Index

| Record | Subject |
| --- | --- |
| `docs/decisions/2026-11-11-work-design-foundations.md` | The index of the cf0 design rules for App, with cf0's numbers |
| `docs/decisions/2026-11-11-work-type-ladder.md` | The 1.25 type ladder, Geist, leading |
| `docs/decisions/2026-11-11-work-neutral-theme.md` | The neutral frame with THC blue as the one accent |
| `docs/decisions/2026-11-11-work-control-ladder.md` | The control size ladder |
| `docs/decisions/2026-11-11-work-shell.md` | The shell, page header, page kinds, dialogs and coachmarks |
| `docs/decisions/2026-11-11-work-font-weight-preference.md` | One text weight, which each member picks |
| `docs/decisions/2026-11-11-two-token-tiers.md` | `--thc-website-*` for the landing, `--thc-*` for App |
| `docs/decisions/2026-11-11-gate-placement.md` | Where `./c check` runs, and how a change reaches main |
| `docs/decisions/2026-11-12-cf-cli.md` | Both Workers on the `cf` CLI and the Vite plugin 2.0 beta |
| `docs/decisions/2026-11-12-claude-review-replaces-greptile.md` | One Claude code-review near the end of each PR, read by the agent; `./c merge` checks only facts; Greptile is gone |
| `docs/decisions/2026-11-12-work-on-app-subdomain.md` | App moves to app.hackcollective.uk, where the Clerk production instance is; the 1Password Environment holds both Clerk key pairs |
| `docs/decisions/2026-11-12-app-deploy-applies-migrations.md` | Each App deploy applies the D1 migrations first; supersedes decision 6 of the cf-cli record |

The port plan that produced these records is `docs/plans/2026-11-11-cf0-port.md`.
