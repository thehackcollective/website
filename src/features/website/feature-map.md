# website

The public landing page for The Hack Collective at hackcollective.uk.

## Sub-features

The landing page is one view: site nav, hero, stats, partners, and join sections.

## How to get to it

The feature owns the public route `/` and is the catalog default.

## Gotchas

The hero headline uses motion-plus splitText, so fonts must load before the reveal runs.

Smooth scroll (Lenis) lives in `src/app/smooth-scroll.tsx`, not in the feature.

Copy facts live in `workspace/content.ts`; do not invent claims.

## Verify

Run `bun run dev`, open `/`, and check the hero reveal plays, scroll is smooth, and the stats count up on scroll.
