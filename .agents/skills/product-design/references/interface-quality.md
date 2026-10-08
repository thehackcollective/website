# Interface quality

Values are not repeated here. Read `DESIGN.md` for the roles and `src/tokens/design-tokens.css` for the numbers.

## Layout

- The rail: `pageRecipe` + `railRecipe` from `page-shell.stylex.ts`. Every section sits inside the rail; nothing bleeds past the hairlines.
- Full-viewport sections: `minHeight: '100dvh'`, content centred with flex, footer pinned to the bottom of the last section.
- Breakpoints as StyleX condition values: `{ default: ..., '@media (min-width: 768px)': ..., '@media (min-width: 1024px)': ... }`. Mobile first.
- Gaps have one owner. The section grid sets the gap; children carry no margins.

## Typography

- `h1`: `displayTitleLg`. `h2`: `displayTitleMd`. Stat values and partner names: `displayTitleSm`. Eyebrows: `eyebrow`. Body: `bodyLg` for the hero lede only, `bodyMd` elsewhere, `bodySm` for footer and meta.
- Tabular numerals (`fontVariantNumeric: 'tabular-nums'`) on anything that counts up.
- Never resize a peer because its string is longer; fix the copy or the measure.
- No stranded single words in headings at 390 px; adjust copy, not font size.

## Colour

- Text: `color.ink` for headings, `color.body` for paragraphs, `color.meta` for eyebrows and footer.
- Surfaces: `color.canvas` behind the rail, `color.surfaceCard` inside it, `color.hairline` for every divider.
- Blue: `color.primary` for the primary button fill and focus ring, `color.primaryActive` for hover and pressed. Nowhere else.
- Contrast: 4.5:1 for body text, 3:1 for large text and for the mark on its background. White on `--thc-brand-700` passes for the mark and for button labels at 16 px medium.

## Logo placement

- Nav: `/brand/icon.svg` at 24 px beside the wordmark text, `alt=""`, the link carries `aria-label`.
- Hero or footer lockup, if used: `/brand/lockup.svg` on light, `/brand/lockup-white.svg` on dark, height 24 to 40 px.
- Clear space equals the knob radius (0.20 of the body side). Never place the mark on a photo, a gradient, or a colour other than white, near-black or `--thc-brand-700`.

## Interaction

- Primary CTA: pill button, `color.primary` fill, `color.onPrimary` text, hover `color.primaryActive`, focus ring `--thc-focus-ring`.
- Secondary links: ink text, hairline underline on hover in blue.
- External links open in a new tab with `rel="noreferrer"`; the link text names the destination (WhatsApp, Luma), never "here".
- Touch targets at least 44 px tall on the nav CTA and the join rows.

## Motion

- Entrance: `StaggerReveal` for the hero headline (waits for `document.fonts.ready`, fails open), `Reveal` (`whileInView`, once, 60 ms stagger) for section blocks.
- Count-up on stats only; comma formatting preserved; never on a number the visitor could misread as live.
- Durations from `--thc-duration-*`, easing from `--thc-ease-*`. No parallax, no ambient loops.
- Lenis + ScrollTrigger wiring lives in `src/app/smooth-scroll.tsx`; sections do not create their own tickers.
- Under `prefers-reduced-motion`, every animated wrapper renders a plain element.

## Accessibility

- Landmarks: `header` (nav), `main`, `footer`. Sections carry `aria-labelledby` pointing at their `h2`.
- Skip link to `main`.
- Decorative images `alt=""`; the logo link has an accessible name.
- Visible focus on every interactive element; never remove outlines without a replacement ring.
- Source order equals reading order; no CSS reordering that changes meaning.

## Responsive checks

1440 and 390 px minimum. No horizontal overflow, no clipped stat values, nav collapses to logo + one CTA, partner list wraps without orphan rows.
