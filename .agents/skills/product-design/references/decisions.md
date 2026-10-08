# Decisions

Accepted design decisions, newest first. Add one when Louis accepts a change that future work must not reopen.

## 2026-10-08 — Hero figure: "Assemble", a hairline figure built on the vendored kernel

- Eight copies of the mark lie scattered on a plinth, one seated and bright; the nearer the pointer to the centre, the more slide and turn into a 4x2 solve (turns 0/90/270/180 so the one piece interlocks with itself). Read-out `joined n·8`, slider = reach. With no pointer the figure plays its tour; under reduced motion it rests.
- Engine: `src/lib/hairline-kernel.js` is the hairline-create skill's `kernel.js` byte-for-byte plus one `export { HL }` line; it is vendored, ESLint-ignored, and never edited. The figure is `src/lib/hairline-assemble.js` (hairline dialect, validated with the skill's `validate.mjs`); `hero-figure.tsx` mounts it. A new figure means a new `hairline-<name>.js`, not a change to the kernel.
- Palette comes from `--hairline-*` custom properties set in `hero-figure.stylex.ts` from tokens: plate = canvas, hi = ink, edge/mid/lo = gray 500/300/200.

## 2026-10-08 — Logo: one piece, mass-centred, Vercel blue

- The mark is the top-left piece of the original four-piece logo, alone. Knob right, socket bottom, tangent-continuous curves, no undercuts.
- Colour is Vercel `blue-700` (`#006bff`, `oklch(57.61% 0.2508 258.23)`), replacing the purple `#bc3fff`. Dark mode is white on near-black. App tile is white on blue, never a white tile inside blue.
- Square-canvas files centre on the centre of mass, not the bounding box (bbox centring read as pushed left).
- Wordmark is Geist Medium outlined to paths. Lockup: blue symbol, ink wordmark on light; all white on dark.
- Asset SVGs in `public/brand/` are the editable masters; PNG/WebP/ICO/favicons are regenerated from them; no `thc-` prefix.
- Source: this session; evidence `brand/build_mark.py`, `DESIGN.md` § Logo.

## 2026-10-08 — Design system follows vercel.com/design.md

- Token roles, light and dark values, type roles, spacing and radius mirror Vercel's foundation under the `--thc-*` namespace. `DESIGN.md` is the spec; values live only in `design-tokens.css`.
- Dark mode is a token change under `prefers-color-scheme`, with no visible switcher.

## 2026-10-08 — Grok Bot section removed until announced

- Event blocks are temporary; removed, not hidden. Pattern preserved at `git show df47a19:src/components/upcoming-hack-section.tsx`.

## 2026-10-07 — Sections fill the viewport; motion via Reveal and count-up

- Hack, stats, partners and join sections are `100dvh` with centred content. `Reveal` on blocks, `CountUp` on stats, Lenis bridged to ScrollTrigger in `src/app/smooth-scroll.tsx`.
- 2026-10-08: gsap removed; count-up uses motion `inView` + `animate`, Lenis runs its own rAF.
