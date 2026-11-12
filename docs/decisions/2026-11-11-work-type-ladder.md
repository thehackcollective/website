# Work: one type ladder with a ratio of 1.25

Status: accepted
Date: 2026-11-11
Scope: every Work screen and the shared kit in `src/components/ui/`. The public site keeps its own type roles and `--thc-website-*` sizes (`DESIGN.md`). Indexed as rules 1 to 9 of `docs/decisions/2026-11-11-work-design-foundations.md`.
Decision: Work takes cf0's type ladder (`cf0.ai/docs/decisions/2026-11-01-type-ladder.md`) with Geist in place of Amiamie.
- Ratio. All sizes come from one ladder: 16px times 1.25 to a power, rounded to whole pixels: 13, 16, 20, 25, 31, 39, 49, 61. Each surface uses a continuous run of it. No surface skips a step.
- Runs. Work pages use the console run. The onboarding uses the onboarding run, one step above. The values live in `src/tokens/design-tokens.css`: `:root:has([data-thc-surface="console"])` for the console and `:root:has([data-thc-scale="onboarding"])` for the onboarding.

  | Role | Console (Work) | Onboarding |
  | --- | --- | --- |
  | caption | 13 | 16 |
  | ui | 16 | 20 |
  | body | 16 | 20 |
  | heading | 20 | 25 |
  | title | 25 | 31 |
  | display | 31 | 39 |

- Surface. The Work entry sets `data-thc-surface="console"` on `<body>`, so every Work page and every Base UI portal gets the console values.
- Leading. Text roles (body, ui, caption) lead at 1.5 times the size. Heading roles (heading, title, display) lead at 1.2. Each leading token is `calc(size * ratio)` from `--thc-leading-ratio-text` and `--thc-leading-ratio-heading`.
- Typeface. All Work text is Geist (`text.fontSans`). Identifiers and code are Geist Mono. Text, labels, buttons and headings use one weight, `text.weightRegular`. `text.weightMedium` and `text.weightSemibold` are aliases of it. The default is 400, and each member can choose 500 or 600 (`docs/decisions/2026-11-11-work-font-weight-preference.md`).
- Font files. Work serves `/fonts/geist.woff2` and `/fonts/geist-mono.woff2` itself (`src/tokens/fonts.css`) and preloads `geist.woff2`. It does not load Google Fonts.
- Fallback. `Geist Fallback` is Arial with metric overrides in `src/tokens/design-tokens.css`, so text does not move when Geist loads.
- Numbers are tabular and text is antialiased on every Work page (`src/tokens/webapp-globals.css`).
- Measure is at most 65 characters. Headings use `text-wrap: balance`. An ellipsis is the one character `…`. `sup` and `sub` have a fixed size and offset.
- Checks: `web-line-height-is-token`, `web-ellipsis-is-one-character`, `web-prose-measure-is-token`, `web-font-size-is-ladder-token`, `web-type-token-not-scaled`, `web-size-token-on-ladder` and `web-font-weight-token`.
Rationale: cf0 is the spec for Work. A ratio of 1.125 makes neighbouring steps look the same, so hierarchy then needs weight. A ratio of 1.333 makes headings too large in dense panels. One weight keeps hierarchy in the size ladder, which is what cf0 does. The port plan sets Geist and Geist Mono as THC's type, not Amiamie.
Evidence: `cf0.ai/docs/decisions/2026-11-01-type-ladder.md` and `cf0.ai/docs/decisions/2026-10-31-app-type-match-onboarding.md` (main @ a0538ec33); `docs/plans/2026-11-11-cf0-port.md` (Brand: "Geist and Geist Mono, one weight 400 … Not Amiamie"; Progress: serve and preload the font files from the work entry); `src/tokens/design-tokens.css`.
Exceptions: the public site.
Bad example: `fontSize: '15px'`; `fontWeight: 600` on a card title; `lineHeight: 1.4`; a `"Geist"` string in a feature style; `'...'` at the end of a cut title.
Good example: the `title` role on the page `h1`; `text.sizeCaption` with `color.textSubtle` for a timestamp; `fontWeight: text.weightRegular`.
Open decisions: none.
