# AGENTS.md: hack-collective

This file uses ASD-STE100 Simplified Technical English (STE): one fact in each sentence, the active voice, and numbered steps for a procedure.

## 1. The repo

This repo has two surfaces of The Hack Collective (THC), a London hackathon community.

| Surface | Domain | Code | Spec |
| --- | --- | --- | --- |
| The public site | hackcollective.uk | `src/features/website/`, `src/app/` | `DESIGN.md` |
| Work, the THC CRM | work.hackcollective.uk | `internal/`, `workers/internal/` | `docs/decisions/2026-11-11-work-design-foundations.md` |

1. The public site is an assets-only Cloudflare Worker. Its `cf` project is the repo root: `cloudflare.config.ts` and `vite.config.ts`.
2. Work is a second Worker. Its `cf` project is `internal/`: `internal/cloudflare.config.ts` and `internal/vite.config.ts`, with the Worker code in `workers/internal/`. Each build goes to `.cloudflare/output/v0/` next to its config, which git ignores. Work has its shell and the auth, home, settings, changelog and design features. The CRM modules are not built yet. Their plan is `docs/work-platform/map.md`.
3. The cf0 port plan is `docs/plans/2026-11-11-cf0-port.md`. The decision records are in `docs/decisions/`. Their index is `docs/decisions/README.md`.

## 2. Stack

- Vite 8, React 19, TypeScript 5 and react-router.
- StyleX 0.19 through `@stylexjs/unplugin`. No Tailwind. No inline styles.
- Base UI and Hugeicons in the shared kit (`src/components/ui/`).
- Geist and Geist Mono, served from `public/fonts/` and declared in `src/tokens/fonts.css`.
- motion and motion-plus for the landing hero stagger reveal. Lenis for smooth scroll on the landing.
- Bun 1.4 (the `packageManager` field in `package.json`). `bunfig.toml` sets the isolated linker.
- Light theme only, on both surfaces.
- The accent is THC blue #006bff. The logo is `public/brand/icon.svg`.

## 3. Commands

Run all project commands through `./c`. `./c help` shows the list.

| Command | What it does |
| --- | --- |
| `./c up [site\|work] [mock-data:empty\|mock-data:full]` | Starts the dev servers in the background: site on :5173, work on :5281. |
| `./c status` | Shows which dev servers run. |
| `./c quit [site\|work]` | Stops the dev servers that `./c up` started. |
| `./c doctor` | Checks that this checkout is set up as the repo says. |
| `./c check [step …]` | Runs the gate. `./c check --list` shows each step. |
| `./c verify [--staged \| --diff SHA]` | Runs the fast check of what changed while you edit. |
| `./c explain <rule-id>` | Prints the message, reason, files and fix of one rule. |
| `./c align [path…]` | Measures alignment, spacing and hit areas on a running page. |
| `./c hooks` | Points git at `scripts/git-hooks`. |
| `./c review <PR>` | Posts one Claude code-review of the PR head on the PR. |
| `./c merge <PR>` | Squash-merges a PR when its head has main and the rules hold. |

1. `./c up` runs under `op run --environment` with the 1Password dev Environment (`scripts/c/_lib/op-environments.sh`).
2. With no Clerk keys in that Environment, the work app opens signed in as the dev member.
3. Logs and pids go to `.c-runtime/`. Copy a log before you read it, because the next run writes over it.
4. `bun run build` builds the site. `cd internal && bunx vite build` builds Work. Neither runs the check.
5. Production ships through Workers Builds on a merge to main, with `cf deploy --prebuilt --mode production`. Do not deploy by hand.
6. Use the `cf` CLI (`node_modules/.bin/cf`), never Wrangler. The record is `docs/decisions/2026-11-12-cf-cli.md`.
7. Work's D1 migrations live in `workers/internal/migrations`. Apply them from `internal/` with `cf d1 migrations apply <id> --dir ../workers/internal/migrations`. Add `--local --persist-to <dir>` for local data. `cf` defaults to the remote database.

## 4. Structure

```
src/
  main.tsx              the site entry
  app/                  router, app root, smooth scroll, not-found, globals.css
  features/
    entrypoint.ts       the FeatureEntrypoint contract
    catalog.ts          finds each feature's entrypoint.ts
    website/            the landing page feature
  components/ui/        the shared kit, flat
  lib/                  shared helpers, flat, plus lib/hooks/
  tokens/               both token tiers
internal/               the Work client
  work/features/<name>/ one folder per Work feature
workers/internal/       the Work Worker
```

1. A site feature folder has exactly `entrypoint.ts`, `index.ts`, `feature-map.md` and `workspace/`. `workspace/` is flat.
2. A site feature map has the sections Sub-features, How to get to it, Gotchas and Verify.
3. A Work feature folder (`internal/work/features/<name>/`) has `entrypoint.ts`, `index.ts` and `feature-map.md`, and flat files.
4. A Work feature map has the sections Sub-features, How to get to it (user POV), Driving it with agent-browser and Gotchas, in this order.
5. `internal/work/features/` holds only feature folders, `catalog.tsx` and `entrypoint.ts` at its top level.
6. A site route has a surface. `public` renders under the app root. `app` is reserved for a future app shell (`src/features/entrypoint.ts`).
7. New product work is a new feature folder. Do not add a branch to an existing feature. The catalog finds the new folder. There is no route list to edit.
8. Other code imports a site feature only through `@/features/<name>` (its `index.ts`). Inside a feature, a file imports another file by its full `@/features/<name>/workspace/...` path.
9. In `src/`, every import uses `@/`. In `internal/` and `workers/`, use `@internal/` for Work files and `@/` for `src/`.
10. `components/ui/`, `lib/` and `tokens/` never import `features/` or `app/`.
11. The website never imports `@/app/` modules or `@internal/`.

## 5. Tokens and design

1. The landing reads `--thc-website-*` variables from `src/tokens/website-tokens.css` through `src/tokens/website-token-consts.stylex.ts`.
2. Work reads `--thc-*` variables from `src/tokens/design-tokens.css`, `src/tokens/semantic-tokens.css` and `src/tokens/component-tokens.css` through `src/tokens/token-consts.stylex.ts`.
3. The shared kit reads the Work tier. The public-only kit files are `count-up`, `dia-text`, `reveal`, `stagger-reveal` and `src/lib/hairline-*`. They read the landing tier.
4. The reason for the split is in `docs/decisions/2026-11-11-two-token-tiers.md`.
5. Load `.agents/skills/product-design/SKILL.md` before you shape, edit or review anything a visitor or a member sees. This includes the logo placement.
6. Load `.agents/skills/stylex-authoring/SKILL.md` before you write a `.stylex.ts` file.
7. Load `.agents/skills/base-framework/SKILL.md` before you add a file or a feature, or when `./c check structure` fails.
8. Load `.agents/skills/verification/SKILL.md` to prove a change. Load `.agents/skills/louis-ui-iterate-loop/SKILL.md` for measured page polish with `./c align`.

### StyleX rules

1. Use tokens only. Do not write a colour or a raw hex value in a component.
2. Write all styles with `stylex.create` and `stylex.props`. Do not use Tailwind classes (`no-tailwind-in-components`) or inline `style={{}}` (`no-inline-style`).
3. Use longhand properties (`borderWidth`, `borderStyle`, `borderColor`, `paddingBlock`, `paddingInline`).
4. Write conditions as values: `{ default: ..., '@media (min-width: ...)': ... }`.
5. Numbers are px. Do not use `vh`. Use `dvh`.

## 6. Copy rules

1. Every paragraph is one sentence.
2. The page has exactly one `h1`. All other section headings are `h2`. Do not use `h3` or lower.

## 7. Content source of truth

Use these facts verbatim. Do not invent a claim.

- London's hackathon community. 1,100+ builders, one WhatsApp group, every London hackathon on one calendar.
- Founded in London in September 2025 by UCL students, run on WhatsApp and Luma.
- Stats: 1,100+ members; 450+ Luma calendar subscribers; #2 on Google when searching for Hackathons in London; 2026 UCL Campaign of the Year nominee.
- Partners (kept as fact, not shown on the page): Kickstart Global; Hacker's Unity; HackEurope; FINEDA.
- Links live in `src/features/website/workspace/content.ts`: WhatsApp chat.whatsapp.com/EWCPnquUzXD9uppsSuQFVk, Luma luma.com/thehackcollective, email thehackcollective@gmail.com.
- Events live in `UPCOMING_EVENTS` and `PAST_EVENTS` in `src/features/website/workspace/content.ts`. Move an event to `PAST_EVENTS` the day after it ends.
- Upcoming: Imperial BioHack x Anthropic, 28–29 Nov 2026, City & Guilds Building, luma.com/m21rdpv1. Louis co-hosts.
- Upcoming: ALFRD Hackathon, 5 Dec 2026, Central London with the University of Westminster, luma.com/jl7wx52x. The Hack Collective co-hosts with ALFRD.
- Private, never on the site: From Spreadsheets to Agents: A Finance Leaders' Hackathon, 11 Dec 2026.
- Past: Grok Bot Community Engineering London Hackathon, Thu 22 Oct 2026, luma.com/eveur09a. The Hack Collective was a community partner with its own track.

## 8. Code rules

The rules are in `base.rules.yaml` and `sg-rules/`. `./c explain <rule-id>` prints the reason and the fix of each rule.

1. Do not write comments in a tracked file. Put the information in a name, a type, a `feature-map.md` or a decision record (`no-comments`, `no-comments-anywhere`). A suppression is a comment too.
2. Do not use `useEffect`. Use `useMountEffect` (`src/lib/use-mount-effect.ts`), a derived value, an event handler or `key` (`no-use-effect`).
3. Use named exports only (`no-default-export`).
4. Do not use a type assertion. `as const` is permitted. Narrow, or put a type on the declaration (`no-type-assertion`).
5. Do not use `!`. Guard, or throw a named error (`no-non-null-assertion`).
6. Name a file by its function, not by a vendor or a codename (`name-by-function`).
7. Name a value by its function. Do not move a one-use value into an `UPPER_SNAKE` constant. An `UPPER_SNAKE` name is only for a real module-level constant (`upper-snake-is-module-constant`).
8. Do not write unit tests (`no-unit-test-files`). Prove a change end to end with the `verification` skill and attach the proof to the PR.

## 9. The gate

The record is `docs/decisions/2026-11-11-gate-placement.md`.

1. `./c check` is the one gate. Every rule is at zero violations. The only baseline is `web-token-count-cap`, and it only goes down.
2. The pre-commit hook (`scripts/git-hooks/pre-commit`) runs `./c check --staged`.
3. The pre-push hook (`scripts/git-hooks/pre-push`) refuses a push to `main` and runs the full `./c check`.
4. A PR merges only after a clean review. The review is one of the last steps of a PR, and it does not block the work. When the work of the PR is nearly done, push it and start `./c review <PR>` in the background. Keep working on the proof while it runs. When it ends, read it, fix the real findings in one batch and push once. Then merge. The record is `docs/decisions/2026-11-12-claude-review-replaces-greptile.md`.
5. `./c merge <PR>` checks only facts: it brings main into the head, runs `./c check structure` on the head and squash-merges. A red step stops the merge.
6. Before you say a check is clean, run it. Report what passes and what fails.

## 10. How a change reaches main

1. Do all work in the root checkout. Change branches in place. Do not use git worktrees.
2. Commit on a branch.
3. Push the branch.
4. Open a PR with `gh pr create`.
5. Run `./c merge <PR>`. Do not merge with the GitHub button or with `gh pr merge`.
6. Do not commit, push or merge until Louis gives the go.

## 11. Loosening a rule

The rules only get stricter. An agent can make a rule stricter at any time. Each of these changes is a loosening:

- Delete a rule in `base.rules.yaml`, or make its pattern match less.
- Make its `exempt` wider, or its `scope` narrower.
- Add or raise a baseline, or relax a value in `limits`.
- Delete an sg-rule in `sg-rules/`, lower its severity, or make its `ignores` wider.
- Lower a biome level, or turn off a tsconfig strict flag.
- Add to a skip list: `knip.json`, `.jscpd.json`, `doctor.config.json`, `biome.json`, `import-cycles.biome.json`, `eslint.config.mjs`, `tsconfig.json` or `scripts/tsconfig.json`.
- Change a gate file: `c`, `scripts/c`, `scripts/git-hooks` or `sgconfig.yml`.

The `guarded` list at the top of `base.rules.yaml` names these files.

To ship a loosening:

1. Put the loosening in its own PR. Do not mix it with a feature change.
2. In the PR description, list each loosened rule and its reason.
3. The PR's `./c review` reads it with the rest of the change. `./c check structure` warns about a loosened rule. A change to gate code gets no script check. `./c merge` blocks on neither.

No agent sets `BASE_RULES_LOOSEN`.

## 12. Hard rules

1. Do not run a destructive command without asking first: `rm`, `git reset`, `git restore`, `git clean`, `git stash`, `git checkout` of files, a force-push, `find -delete`, `kill`, or `>` onto an existing file.
2. Do not write secrets. Do not write `.env` or `.dev.vars` files. Secrets live in 1Password only.
3. Never use `--no-verify`.

## 13. Skills

| Skill | Use it for |
| --- | --- |
| `.agents/skills/product-design/SKILL.md` | Anything a visitor or a member sees |
| `.agents/skills/stylex-authoring/SKILL.md` | StyleX files and missing styles |
| `.agents/skills/base-framework/SKILL.md` | Where code lives and why a structure check fails |
| `.agents/skills/verification/SKILL.md` | Proof that a change works on the running app |
| `.agents/skills/louis-ui-iterate-loop/SKILL.md` | Measured page polish with `./c align` |
| `.agents/skills/calendar-enrich/SKILL.md` | Upcoming hackathons from WhatsApp into the Luma calendar |

The calendar skill (also in `.claude/skills/calendar-enrich`) finds upcoming hackathons in WhatsApp groups through wacli. It adds the missing ones to luma.com/thehackcollective, or it writes a handoff file when it cannot.
