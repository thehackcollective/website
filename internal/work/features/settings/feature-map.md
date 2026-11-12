# Settings

Settings holds the per-member preferences of the work app at `/settings`: the text weight and the click sounds.

## Sub-features

- text-weight: three "B" tiles for 400, 500 and 600. Picking one sets `data-thc-weight` on the document and stores it on this device (`internal/work/features/settings/font-weight-tiles.tsx`, `src/lib/font-weight.ts`).
- sound: a switch that mutes or turns on the click sounds, the same state as the speaker button in the sidebar footer (`internal/work/features/settings/sound-setting.tsx`).
- tour: two coachmark steps, `settings.weight` and `settings.sound` (`internal/work/features/settings/coachmarks.ts`).

## How to get to it (user POV)

1. Click "Settings" in the sidebar, or click your name in the sidebar footer.
2. On a phone, open the menu in the header and pick your name or "Settings".

## Driving it with agent-browser

1. Run `./c up work` and open `http://localhost:5281/settings`.
2. Click the 600 tile. Expect `document.documentElement.dataset.thcWeight === '600'` and heavier text across the page.
3. Reload. Expect the 600 tile still checked.
4. Toggle "Click sounds". Expect the sidebar speaker button to change with it.

## Gotchas

- The weight is stored in `localStorage` only, so another browser starts at 400. There is no member preferences table yet.
- Each tile sets `data-thc-weight` on its own glyph, so the B keeps its weight whatever the page weight is.
- Signing out resets the weight to 400.
