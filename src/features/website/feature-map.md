# website

The public landing page for The Hack Collective at hackcollective.uk.

## Sub-features

The landing page is one view: site nav, hero with an isometric figure, stats, and a join section with a spinning ASCII puzzle piece tile.

## How to get to it

The feature owns the public route `/` and is the catalog default.

## Gotchas

The hero headline uses motion-plus splitText, so fonts must load before the reveal runs.

Smooth scroll (Lenis) lives in `src/app/smooth-scroll.tsx`, not in the feature.

Copy facts live in `workspace/content.ts`; do not invent claims.

The join tile's ASCII piece is a CPU raymarcher on a `<pre>`, so keep the grid small (around 100x50 cells); it pauses when offscreen or the tab is hidden.

## Verify

Run `bun run dev`, open `/`, and check the hero reveal plays, scroll is smooth, the stats count up on scroll, and the ASCII piece in the join tile spins.
