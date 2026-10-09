---
name: hack-collective-design
description: Design system for The Hack Collective (hackcollective.uk). The spec behind the product-design skill (.agents/skills/product-design). Modelled on vercel.com/design.md: Geist typography, monochrome-first surfaces, one blue accent, light and dark themes. Names tokens and reasoning; values live in src/tokens/design-tokens.css.
---

# Design like The Hack Collective

Act as a restrained design engineer. The site is a community surface, not a startup landing page: precise, calm, direct, technically literate. Build confidence through clarity and proof (members, calendar, recognition), never through hype, decoration or novelty.

## Priority order

When requirements compete, protect them in this order:

1. Preserve supplied facts and copy constraints (`AGENTS.md`: one sentence per paragraph, one `h1`, `h2` elsewhere).
2. Preserve the stack (Vite, React, StyleX, `--thc-*` tokens) and the existing component seams.
3. Make the reader's next action obvious: join the WhatsApp, subscribe to the calendar.
4. Establish THC authorship through the mark, Geist, the rail grid and restraint.
5. Refine responsive behaviour, interaction and detail without weakening hierarchy.

## Logo

The SVG files under `public/brand/` are the editable masters; the PNG, WebP, ICO and manifest files are derived from them.

- **Symbol:** one jigsaw piece (the top-left piece of the original four), knob on the right, socket on the bottom. Every junction is tangent-continuous; there are no undercuts, the only straight runs are the top and left edges.
- **Wordmark:** "The Hack Collective" in Geist Medium, outlined to paths with kerning applied. Never set the wordmark as live text in a logo context.
- **Lockups:** horizontal (`lockup.svg`, symbol 1.25 cap heights tall, gap 0.5 cap) and stacked (`lockup-stacked.svg`). Symbol-only and wordmark-only are permitted.
- **Colour:** symbol `--thc-brand-700`, wordmark `--thc-ink` on light (`lockup.svg`). On dark, symbol and wordmark are both white (`lockup-white.svg`, `icon-white.svg`). One-colour black: `icon-black.svg`, `lockup-black.svg`. App tile: white symbol centred on blue (`icon-on-blue.svg`), never a white tile inside a blue tile.
- **Centring:** square-canvas files centre the symbol on its centre of mass, not its bounding box, so the body does not read as pushed left by the knob.
- **Clear space:** the knob radius (0.20 of the body side) on every side. **Minimum size:** 16 px symbol, 24 px for the horizontal lockup height.
- **Files:** `public/brand/icon*.svg|png` (32 to 512, blue and white, plus `icon-on-blue-512/1024.png` and `icon-on-white-512/1024.png`), `wordmark*.svg`, `lockup*.svg|png`, `og.png` and `og-dark.png` (1200x630), `banner-x[-dark].png` (1500x500), `banner-linkedin[-dark].png` (1128x191 company cover) and `banner-linkedin-profile[-dark].png` (1584x396); every PNG has a lossless `.webp` twin (about a third of the size) for use in the page, PNG stays for Open Graph and manifests. Root: `favicon.ico` (16/32/48, from `icon.svg`, which is also the `<link rel="icon">`), `apple-touch-icon.png` (180, on blue), `site.webmanifest`.
- **Site usage:** nav uses `/brand/icon.svg` at 24 px; `og:image` and `twitter:image` use `/brand/og.png`; JSON-LD `logo` uses `/brand/icon-512.png`.
- **Misuse:** no rotation, no outline, no gradient, no drop shadow, no recolouring outside the four approved fills, no reintroducing the other three pieces.

## Colour

Design in monochrome. Blue is for the mark, the primary action, links on hover and focus; nothing else. Pair every colour cue with a non-colour cue.

| Token | Light | Dark | Source |
|---|---|---|---|
| `--thc-brand-50` | `#f0f7ff` | `#06193a` | Vercel `blue-100` |
| `--thc-brand-600` | `#005ff2` | `#47a8ff` | Vercel `blue-900` |
| `--thc-brand-700` | `#006bff` | `#006efe` | Vercel `blue-700`, `oklch(57.61% 0.2508 258.23)` |
| `--thc-brand-800` | `#005ff2` | `#47a8ff` | Vercel `blue-900` |
| `--thc-brand-900` | `#002359` | `#eaf6ff` | Vercel `blue-1000` |
| `--thc-canvas` | `#f5f5f5` | `#000000` | Vercel `background-100/200` |
| `--thc-surface-card` | `#ffffff` | `#0a0a0a` | |
| `--thc-ink` | `rgba(24,24,27,.96)` | `#ededed` | Vercel `gray-1000` |
| `--thc-body` | `rgba(24,24,27,.82)` | `rgba(237,237,237,.82)` | |
| `--thc-meta` | `rgba(24,24,27,.68)` | `#a0a0a0` | Vercel `gray-900` |
| `--thc-hairline` | `#e4e4e7` | `rgba(255,255,255,.13)` | Vercel `gray-alpha-300` |
| `--thc-hairline-strong` | `#d4d4d8` | `rgba(255,255,255,.24)` | Vercel `gray-alpha-500` |

Dark values are Vercel's `light-dark()` oklch pairs converted to sRGB; the site ships light only today, dark is the target for the revamp (`prefers-color-scheme`, no visible switcher).

Hard reject: decorative gradients, gradient text, glows, blobs, textures, grid backgrounds, coloured side rails, ornamental shadows, fake depth. The existing `--thc-shadow-*` ramp is for elevation of real floating elements (nav, menus) only.

## Typography

Geist for everything readable; Geist Mono only for code, commands, paths and short operational identifiers (dates in the calendar eyebrow, event IDs), never for a whole sentence or table.

| Role | Token | Size / leading | Weight | Use |
|---|---|---|---|---|
| Display | `display-xl` | 44 / 48, `-0.03em` | 500 | The one `h1` |
| Title | `display-lg` | 40 / 44 | 500 | Not used on the landing page |
| Section | `display-md` | 32 / 40 | 500 | Every `h2` |
| Subsection | `display-sm` | 22 / 28 | 500 | Stat values, partner names |
| Lede | `body-lg` | 18 / 28 | 400 | One orientation sentence under the `h1` |
| Body | `body-md` | 16 / 24 | 400 | Paragraphs |
| Compact | `body-sm` | 14 / 20 | 400 | Secondary rows, footer |
| Label | `caption` | 12 / 16, `0.12em` caps | 500 | Eyebrows, nav labels |

Rules: hierarchy through type before surfaces or colour; peers share role, size, weight and leading; never resize one element because its string is longer; tabular numerals for aligned stats; emphasis is scarce; no arbitrary sizes or weights outside the token set.

## Space, shape, grid

- Spacing scale `--thc-space-*` (4 to 192 px). Within-group gaps `xs`–`md`, between groups `lg`–`xl`, section turns `3xl`–`4xl`, `section` (192) only for a true chapter break. Every gap has exactly one owner; children do not add competing margins.
- Radius: `sm` 6 px inputs and buttons, `md` 8 px cards, `lg` 12 px nav and floating surfaces, pill for primary CTAs. Nothing else.
- Rail layout: `--thc-container-wide` 1400 px, 1 px hairlines left and right, sections divided by 1 px top borders. Sections that claim the viewport use `min-height: 100dvh`, never `vh`.
- Light and dark themes are implicit through tokens; components never branch on theme.

## Motion

Motion explains order, it never decorates. One entrance pattern (stagger reveal on the hero, `Reveal` on section blocks), count-ups only for real numbers, Lenis for scroll. Everything collapses to static under `prefers-reduced-motion`. No parallax, no looping ambient animation.

## Copy

Every paragraph is one sentence. Plain words a first-year can repeat; keep exact names (Luma, WhatsApp, partner names) verbatim. No superlatives that the stats do not already prove.

## Review checklist

1. **Facts:** every number and name traces to `AGENTS.md`.
2. **Hierarchy:** one `h1`, `h2` sections, type roles from the table, no orphan sizes.
3. **Colour:** blue only on mark, primary action, hover, focus; passes 4.5:1 for text, 3:1 for the mark on its background.
4. **Logo:** approved file, approved fill, clear space respected, not stretched.
5. **Restraint:** can any border, surface, icon, label or section be removed without losing meaning? Remove it.
6. **Gates:** `bun run typecheck`, `bun run lint`, `ast-grep scan`, `bun run build` all green.
