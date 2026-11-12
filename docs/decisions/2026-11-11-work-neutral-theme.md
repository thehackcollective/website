# App: a neutral frame, THC blue as the one accent, and layered shadows

Status: accepted
Date: 2026-11-11
Scope: every App screen and the shared kit in `src/components/ui/`. The public site keeps its own `--thc-website-*` colours (`DESIGN.md`). Indexed as rules 10 to 13 of `docs/decisions/2026-11-11-work-design-foundations.md`.
Decision: App takes cf0's neutral theme (`cf0.ai/docs/decisions/2026-10-28-design-neutral-theme.md`, `cf0.ai/docs/decisions/2026-11-01-canonical-sidebar.md`, `cf0.ai/docs/decisions/2026-11-01-sidebar-white-surface.md`) with THC blue as the one accent.
- Tokens. Three tiers in `src/tokens/`: palette and scales in `design-tokens.css`, semantic `--thc-color-{property}-{role}-{emphasis}-{state}` roles in `semantic-tokens.css`, and component tokens in `component-tokens.css`. Code reads the accessors in `src/tokens/token-consts.stylex.ts` only. Only the semantic tier reads the palette (`web-token-palette-private`, `web-token-semantic-points-at-palette`, `web-token-component-points-at-semantic`).
- Neutral frame. Text is near-black ink. The sidebar rail and raised surfaces are white (`color.backgroundSurface`). The page is `color.backgroundCanvas`.
- One accent. The accent is THC blue, `--thc-palette-blue-700` #006bff, the landing's brand-700. `color.backgroundBrand` is blue-700. The hover step is `--thc-palette-blue-800` #0054d4, and the pressed step is `--thc-palette-blue-900` #003f99 (cf0's own steps). The primary button reads them as `button.primaryBackground`, `button.primaryBackgroundHover` and `button.primaryBackgroundActive`.
- Text on the accent is white (`color.textOnBrand`, `button.primaryText`). The contrast check gives 4.62:1 on #006bff, 6.52:1 on #0054d4 and 9.67:1 on #003f99. All three pass 4.5:1, so the answer is white. Senvielab's ink-on-pink answer does not apply, because its pink is light and THC blue is dark.
- The accent fills only the one primary `Button` of a view. It is not a tint on a row or a card (`web-app-no-brand-tint-fill`).
- Links. Text that must read as a link is `color.textBrand` = blue-800 (6.52:1 on white). `color.borderBrand` and `color.iconBrand` use blue-700.
- Selection. A selected or active item (the sidebar row of the current page, a pressed `Segmented` item, a selected table row) is neutral: `color.backgroundSelected` and `color.textSelected`, with `color.borderSelected` when it needs an edge. It has no blue tint and no blue text.
- Focus. App focus rings are neutral. On the console surface `layout.focusRing` is a surface gap and a `color.textSubtle` ring.
- Colour is for data and state. Status hues, chart series (`color.chartCategorical1` to `color.chartCategorical6`) and the unread dot use colour. Headings, body text and the sidebar stay neutral.
- Depth. Only `src/components/ui/` surfaces have depth, from the layered `shadow.*` tokens (`web-ui-shadow-is-token`). A feature writes no shadow (`web-app-no-shadows`). The focus ring is the only box-shadow a feature can use. No glass, liquid or blur (`web-no-glass-effects`).
- Nested radius. An item inside a padded, rounded container takes the container radius minus the padding, from a `radius.nest*` token.
- Light only. App has no dark mode (`web-light-theme-only`).
- Theme through tokens. A feature does not write a font name or a hex value, and does not fork a `src/components/ui/` component to change its colour (`no-hardcoded-colors`, `web-no-geist-sans`).
Rationale: cf0 is the spec for App. The accent is the one place App differs: THC's brand is blue #006bff, which the landing page and the logo already use. The plan says to pick the text colour on the accent from the contrast check and not to copy senvielab's answer. The check gives white at every step. blue-800 carries links because it has more contrast on white than blue-700.
Evidence: the cf0.ai records above (cf0.ai main @ a0538ec33); `docs/plans/2026-11-11-cf0-port.md` (Brand; Progress, orchestrator (tokens): "text on the accent is white (4.62:1 on #006bff). The webapp hover and blue-800 are #0054d4, pressed and blue-900 are #003f99"); `src/tokens/design-tokens.css`, `src/tokens/semantic-tokens.css` and `src/tokens/component-tokens.css`.
Exceptions: the public site. The brand mark keeps its own fills (`DESIGN.md`, Logo).
Bad example: `color: '#ffffff'` on the primary button; a blue-50 fill on the active sidebar row; `boxShadow: '0 4px 12px rgba(0,0,0,.1)'` in a feature style; `backdropFilter: 'blur(8px)'`.
Good example: `<Button variant="primary">Add event</Button>` (blue fill, white text from the kit); `color.textBrand` on an inline link; a `Card` for a list group.
Open decisions: none.
