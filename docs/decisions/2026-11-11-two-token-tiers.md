# Two token tiers: `--thc-website-*` for the landing, `--thc-*` for App

Status: accepted
Date: 2026-11-11
Scope: `src/tokens/`, the public site (`src/features/website/`, `src/app/`), App (`internal/`, `workers/internal/`) and the shared kit (`src/components/ui/`, `src/lib/`).
Decision: the repo has two surfaces and two token tiers, in the senvielab shape.
- The landing tier. hackcollective.uk reads `--thc-website-*` variables from `src/tokens/website-tokens.css` through the consts in `src/tokens/website-token-consts.stylex.ts`. `src/app/globals.css` imports `website-tokens.css`. The landing's earlier `--thc-*` values moved to this tier unchanged, so the landing page renders pixel identical. `DESIGN.md` is its spec.
- The App tier. app.hackcollective.uk reads `--thc-*` variables from cf0's three tiers, `src/tokens/design-tokens.css`, `src/tokens/semantic-tokens.css` and `src/tokens/component-tokens.css`, plus `src/tokens/webapp-globals.css`, through the consts in `src/tokens/token-consts.stylex.ts`. Only the App entry imports these CSS files. `docs/decisions/2026-11-11-work-design-foundations.md` is its spec.
- Font faces. `src/tokens/fonts.css` declares Geist and Geist Mono from `/fonts/` for both surfaces.
- Names. `token-consts.stylex.ts` keeps cf0's export names (`color`, `space`, `radius`, `text`, `motion`, `layout`, `cursor`, `breakpoint`, `container` and the rest), so kit code ports from cf0 without renames. The website consts are a separate module.
- The kit. `src/components/ui/` and `src/lib/` read the App tier. A public-only kit file reads the landing tier and is listed by name in the `exempt` of each App rule in `base.rules.yaml`. Today these are `count-up`, `dia-text`, `reveal` and `stagger-reveal` in `src/components/ui/`, and the `hairline-*` files in `src/lib/`.
- Rule scope. A rule for App scopes to `internal/**`, `workers/internal/**`, `src/components/ui/**`, `src/lib/**` and the App token files. The landing is outside that scope.
- Boundaries. The website never imports `@/app/` modules or the work app (`no-website-imports-app`).
Rationale: the landing page has a settled design (Vercel-based, rail layout) and must not move during the port. App takes cf0's checked system whole. Two namespaces keep one surface from changing the other by accident, and a reviewer sees from a variable's name which surface it belongs to.
Evidence: `docs/plans/2026-11-11-cf0-port.md` (Goal; Contracts; Progress: "`--thc-website-*` is the landing tier. `--thc-*` is the webapp tier"); senvielab `--svl-website-*` and its `base.rules.yaml` `scope` and `exempt` globs.
Exceptions: none.
Bad example: a App component that reads `var(--thc-website-ink)`; a landing section that imports `@/tokens/token-consts.stylex`; a new public-only kit file that is not listed in the App rules' `exempt`.
Good example: `color.ink` from `website-token-consts.stylex.ts` in a landing section; `color.textDefault` from `token-consts.stylex.ts` in a App page.
Open decisions: unused App consts are pruned once App reads the tokens it needs (`web-token-used`).
