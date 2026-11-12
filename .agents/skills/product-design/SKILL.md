---
name: product-design
description: >-
  Single entry point for product design and user-facing implementation in
  hack-collective, on both surfaces: the public site (hackcollective.uk) and
  Work, the THC CRM (app.hackcollective.uk). Use whenever work changes what a
  visitor or a member sees, understands, chooses, or does: shaping a new section or flow;
  building or redesigning pages and components; reviewing URLs, screenshots,
  diffs, or agent findings; improving copy, hierarchy, layout, interaction,
  accessibility, responsive behaviour, and loading, empty or error states;
  using or placing the logo. Trigger on design, UX, UI, flow, build, improve,
  fix, audit, review, polish, simplify, revamp, dark mode, or production-ready
  requests. Not for deploy config, tooling, or documentation with no
  user-visible effect.
---

# Hack Collective Product Design

The repo has two surfaces. Name the surface first, because each has its own spec and its own token tier (`docs/decisions/2026-11-11-two-token-tiers.md`).

| Surface | Who | Code | Spec | Tokens |
| --- | --- | --- | --- | --- |
| The public site, hackcollective.uk | A London builder who lands once | `src/features/website/` | `DESIGN.md` | `--thc-website-*` through `src/tokens/website-token-consts.stylex.ts` |
| Work, app.hackcollective.uk | The THC team, every day | `internal/`, `workers/internal/` | `docs/decisions/2026-11-11-work-design-foundations.md` and its detail records | `--thc-*` through `src/tokens/token-consts.stylex.ts` |

On the public site, make the page right for a London builder who lands on it once: they should know what THC is, believe the numbers, and join in one click. In Work, follow cf0's foundations: the rule numbers, the type ladder, the control ladder, the shell and the neutral theme with THC blue. Do not decide a settled Work rule again on a screen.

Working code is not enough: choose the right interaction, keep copy to one sentence per paragraph on the public site, and look at the rendered result.

## Sources of truth for the public site (read in order)

1. **`DESIGN.md`**: the landing system: priority order, logo rules, colour roles, type roles, spacing, grid, motion, copy, review checklist. Names tokens and reasoning; values live in the token file.
2. **`src/tokens/website-tokens.css`** (values, `--thc-website-*`) and **`src/tokens/website-token-consts.stylex.ts`** (typed StyleX accessors `color`, `motion`, `dia`, `text`, `space`, `radius`, `layout`). Shared recipes live in the feature, for example `src/features/website/workspace/section-heading.stylex.ts`.
3. **`AGENTS.md`**: stack, commands, StyleX rules, copy rules, the facts you may state.
4. **`src/features/website/`**: the landing feature. `workspace/view.tsx` composes the sections; `workspace/content.ts` holds every link and fact; one file per section (`site-nav`, `hero-section`, `hero-figure`, `hack-section`, `stats-section`, `join-section`) with a sibling `.stylex.ts`.
5. **`src/components/ui/`**: the public-only primitives `reveal`, `stagger-reveal`, `count-up` and `dia-text`. Closed API: no `className` or `style` props. **`src/lib/hairline-kernel.js`** (vendored, never edited) and `hairline-assemble.js` draw the hero figure; see `references/decisions.md`.
6. **`public/brand/`**: logo assets. The SVGs are the editable masters; regenerate the PNG/WebP twins from them after edits.

If you are about to invent a colour, type size, radius, spacing value, or logo variant, stop. It is already specified. Read tokens, then `DESIGN.md`, then the existing sections.

## Sources of truth for Work (read in order)

1. **`docs/decisions/2026-11-11-work-design-foundations.md`**: the 45 cf0 rules with cf0's numbers, and which apply to Work.
2. The detail records: `docs/decisions/2026-11-11-work-type-ladder.md`, `docs/decisions/2026-11-11-work-neutral-theme.md`, `docs/decisions/2026-11-11-work-control-ladder.md`, `docs/decisions/2026-11-11-work-shell.md`, `docs/decisions/2026-11-11-work-font-weight-preference.md`.
3. **`src/tokens/design-tokens.css`**, **`semantic-tokens.css`** and **`component-tokens.css`** (values, `--thc-*`) and **`src/tokens/token-consts.stylex.ts`** (cf0's accessor names).
4. **`src/components/ui/`**: the cf0 kit. One component per role. A missing component is ported from cf0, not invented.
5. **`docs/work-platform/prd.md`**: what Work is for. The CRM modules are not built yet.

## Operating contract

- **Start with the job, not the pixels.** Who lands here (student builder, sponsor, partner), what they need to know, what they should do next.
- **Facts before form.** Every number and name traces to `AGENTS.md` or `content.ts`. Do not invent claims; omit what you cannot source.
- **One sentence per paragraph. One `h1`. `h2` for every section heading.** No `h3+`.
- **Decide before decorating.** Resolve order of sections, hierarchy and the single primary action before styling.
- **Smallest coherent change.** Prefer removing a surface, border or label over adding one.
- **Design every reachable state.** This page has few: fonts not yet loaded (hero reveal must fail open), reduced motion, narrow viewport, long partner list, broken external link targets.
- **Verify the rendered surface.** Source proves behaviour; a rendered page proves quality. Say when you have not looked.

## Request modes

| Mode | Typical request | Required behaviour |
|---|---|---|
| Shape | "How should the revamp work?", new section idea | Frame the job and evidence, compare material alternatives, define sections, states, acceptance. Do not edit unless asked. |
| Implement | "Build", "fix", "add", "make it dark" | Resolve material decisions, then the smallest end-to-end change within scope. |
| Review | "Audit", "what's wrong?", diff or screenshot | Inspect source and rendered evidence, report prioritised findings. Do not edit unless asked. |
| Copy | "Tighten the copy" | Edit sentences and accessible names only; keep the one-sentence rule. |
| Harden | "Polish", "production-ready" | Keep the settled direction; fix state, responsive, accessibility and finish defects. |

A material decision changes the visitor's task, section order, the primary action, navigation, or a reachable state. Token replacement and copy mechanics are not material.

## Decision authority

1. The user's explicit goal and constraints.
2. Verified facts (`AGENTS.md`, `content.ts`, the live Luma and WhatsApp pages).
3. `DESIGN.md`, the token SOT, `sg-rules/`.
4. Accepted decisions in `references/decisions.md`.
5. Shipped sections in `src/features/website/workspace/`.
6. General interface heuristics.

## Workflow

1. **Set scope and mode.** Name the section(s) and mode.
2. **Load context.** `DESIGN.md`, `AGENTS.md`, the section file and its `.stylex.ts`, `content.ts`.
3. **Model the decision** (Shape, Implement, Harden, full Review): read `references/product-judgment.md`, write a compact brief: visitor, job, current behaviour, desired outcome, success signal, non-goals, open decisions.
4. **Map the surface.** Sections, nav targets, external exits, the footer, reduced-motion and narrow variants.
5. **Load routed references.**

   | Need | Load |
   |---|---|
   | Rules the linters enforce | `references/rules.md` and `./c explain <rule-id>` |
| A Work rule | `docs/decisions/2026-11-11-work-design-foundations.md` |
   | Section or flow decision | `references/product-judgment.md` |
   | Layout, type, colour, motion, logo placement | `DESIGN.md` + `references/interface-quality.md` |
   | Copy or accessible names | `references/copy.md` |
   | Past decisions | `references/decisions.md` |

6. **Decide, then implement.** For each non-mechanical change answer: what does the visitor gain, why this component, which fact or rule backs it, what is the smallest change.
7. **Verify.** Run `./c check`. Then follow `.agents/skills/verification/SKILL.md`. For the public site, `./c up site` serves :5173: check at 1440 and 390 px that the hero reveal plays, scroll is smooth, stats count up, there is no horizontal overflow, there is one `h1`, and reduced motion renders static. For Work, `./c up work` serves :5281, and `.agents/skills/louis-ui-iterate-loop/SKILL.md` measures the page with `./c align`. Do not claim visual verification you did not do.

## Standards for the public site

- One primary action per viewport: follow the Luma calendar; join the WhatsApp is the secondary.
- Blue (`color.primary`) only on the mark, the primary action, hover underline and focus ring.
- Geist for all text; Geist Mono only for short identifiers (dates, counts in eyebrows).
- Hairlines separate; shadows only on floating UI (nav).
- Sections that claim the viewport use `100dvh`, never `vh`.
- Motion explains order; everything collapses under `prefers-reduced-motion`.
- Logo: `/brand/icon.svg` in the nav, lockups from `public/brand/`, white variants on dark, never recoloured or outlined.

## Standards for Work

- The rules of `docs/decisions/2026-11-11-work-design-foundations.md`, by number.
- THC blue fills only the one primary `Button` of a view, with white text. Selection and focus are neutral.
- Geist at one weight, `text.weightRegular`. Hierarchy from the size ladder.
- Controls from `src/components/ui/`, sized by one step of the control ladder.
- No coachmarks on the login page. The login page shows the real THC mark.

## Review output

Findings ordered by visitor impact: **P0** blocks joining or breaks accessibility; **P1** misleading fact, missing state, major responsive defect; **P2** friction, weak hierarchy, inconsistency; **P3** craft. Each finding: location, verification status, canonical source, visitor consequence, smallest fix.

## Skill integrity

Add or change a rule only after checking current source and with Louis's acceptance. Deterministic rules go to `sg-rules/` or `base.rules.yaml`; judgment stays in prose with its evidence. Record accepted public-site decisions in `references/decisions.md`. Record Work decisions in `docs/decisions/`.
