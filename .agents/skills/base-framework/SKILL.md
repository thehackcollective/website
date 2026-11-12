---
name: base-framework
description: >-
  The Base framework: the agent-first architecture hack-collective shares with
  cf0, senvielab, elearning and qa. Load before you write, move or review code
  in src/, internal/ or workers/: a new file or feature, an import across a
  feature boundary, a Worker route, a migration, a "where does this live"
  question, or a failed ./c check structure. Encodes the five rules as a
  placement procedure.
---

# Base: the framework skill (hack-collective)

Base is the agent-first framework layer that this repo shares with cf0. It supplies discovery, boundaries, structure law and verification once, so a feature supplies only behaviour. The five rules are hard constraints, not style:

1. **The conventional path needs fewer decisions than a shortcut.**
2. **A forbidden dependency fails mechanically.**
3. **Every durable value has one obvious writer.**
4. **New product work adds isolated files, not branches in shared roots.**
5. **An exception is narrow, explicit and reviewed as an architecture change.**

If you are about to break one "just this once", stop. The answer is a different file location or an injected dependency, not an exemption.

## Before you write code: the placement procedure

Answer in this order. Each question has one right answer.

1. **Which surface?** The public site (hackcollective.uk) is `src/features/website/` and `src/app/`. App (app.hackcollective.uk) is `internal/` (the client) and `workers/internal/` (the Worker). Shared code that both surfaces need is `src/components/ui/` (visual) or `src/lib/` (not visual).
2. **Which feature owns the behaviour?** A site feature is `src/features/<name>/`. An App feature is `internal/work/features/<name>/`. If no feature owns it, add a new feature folder. It is never a branch inside the file of another feature.
3. **Which slot does the code go in?** Do not invent layout. The anatomy is fixed (below).
4. **Does anything cross a boundary?** A site feature is reachable only through `@/features/<name>` (its `index.ts`). An App feature is reachable only through its `index.ts` (`web-cross-feature-via-index`). The App framework files never import a feature (`web-framework-never-imports-features`). `src/components/ui/`, `src/lib/` and `src/tokens/` never import `features/` or `app/` (`no-ui-imports-features`). The website never imports `@/app/` or `@internal/` (`no-website-imports-app`).
5. **Who writes the durable value?** Each value has one writer. A design value lives in one token file of its tier (`docs/decisions/2026-11-11-two-token-tiers.md`). An App schema change is a numbered migration (`migration-numbers`). The `schema` step of `./c check` applies the migrations to a fresh D1. An App write goes through the write helpers (`web-write-through-helpers`). A secret lives only in 1Password.

## Anatomy

### A site feature: `src/features/<name>/`

| File | Role |
| --- | --- |
| `entrypoint.ts` | Route identity and surface. `src/features/catalog.ts` finds it. |
| `index.ts` | The only public edge. |
| `feature-map.md` | Product knowledge, with Sub-features, How to get to it, Gotchas and Verify. |
| `workspace/` | Flat: `view.tsx`, the sections, their `.stylex.ts` files, `content.ts`. |

### An App feature: `internal/work/features/<name>/`

| File | Role |
| --- | --- |
| `entrypoint.ts` | Routes (path, title, page `kind`) and nav items. The App catalog finds it. |
| `index.ts` | The only public edge. |
| `feature-map.md` | Sub-features, How to get to it (user POV), Driving it with agent-browser, Gotchas (`web-feature-map-sections`). |
| `coachmarks.ts` | One to three coachmark steps for each rail page (`web-coachmark-coverage`). |
| other files | Flat. No subfolders. |

Discovery is mechanical. Each catalog globs the entrypoints. Never register a feature in a shared list. The reserved files are the registration.

## Patterns that resolve "impossible" constraints

- **Another feature needs my data:** export a function from your `index.ts`, and let the other feature call it.
- **A lower layer needs higher behaviour:** inject it from the app root or the Worker entry. Never add an upward import or an exemption.
- **A type must be re-exported:** use `export type`.
- **Data arrives untyped:** narrow it honestly, from `unknown` to a guard that checks the fields the caller reads. `as` (except `as const`), `!` and hollow guards fail the gate (`no-type-assertion`, `no-non-null-assertion`, `no-hollow-type-guard`).

## The gate

`./c check` runs every step. `./c check --list` prints them:

| Step | Proves |
| --- | --- |
| runtime-dir | `.c-runtime` holds dev-server logs and pids only |
| lockfile | `bun.lock` is the only lockfile and is what `bun install` writes |
| structure | the layout law and every `base.rules.yaml` rule (`scripts/c/_lib/scanner.py`) |
| syntax | every ast-grep rule in `sg-rules/` and its tests in `sg-rule-tests/` |
| styles | ESLint: StyleX values come from tokens |
| deps | one declared version per dependency (syncpack) |
| types | `tsc --noEmit` for the site, the App, the Worker and the scripts |
| format | biome at 0 errors and 0 warnings |
| cycles | no import cycle in `src`, `internal` or `workers` |
| clones | jscpd under the limits in `base.rules.yaml` |
| dead-code | knip: no unused file, export or dependency |
| health | react-doctor at or above `health-score-min` |
| schema | the work migrations apply to a fresh D1, and a second apply has nothing to apply |

A failure names `./c check <step>`, so you can run that step again alone. `./c explain <rule-id>` prints a rule, its reason, its files and its fix. Where the gate runs, and how a change reaches main, is in `docs/decisions/2026-11-11-gate-placement.md`.

Every rule is at zero violations. The only baseline is `web-token-count-cap`, and it only goes down. An agent can make a rule stricter at any time. A loosening needs its own PR that lists each loosened rule and its reason (`AGENTS.md`, section 11).

## Meta-rule

If you can defend an invariant only in review comments, that is a code smell. When you explain a rule twice, move it down the ladder: prose, then a type, then a `base.rules.yaml` entry or an sg-rule, then structure. A new rule lands as one entry plus the fix to zero in the same change. It is never a new script.

Settled decisions live in `docs/decisions/` (indexed in its README). This skill does not copy them. Read them before you design anything they cover.
