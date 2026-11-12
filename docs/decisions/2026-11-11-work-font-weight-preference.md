# Work: each member chooses the one text weight

Status: accepted
Date: 2026-11-11
Scope: Work only: every element that reads `text.weightRegular` or its aliases. The public site ignores the choice. Amends rule 3 of `docs/decisions/2026-11-11-work-design-foundations.md` and the typeface clause of `docs/decisions/2026-11-11-work-type-ladder.md`.
Decision:
- One weight. Work text, labels, buttons and headings use one weight, `text.weightRegular`. `text.weightMedium` and `text.weightSemibold` are aliases of it. Hierarchy comes from the size ladder, never from a second weight.
- Default 400. `--thc-weight-regular` is 400 in `src/tokens/design-tokens.css`.
- Member choice. The setting has three options, Regular (400), Medium (500) and Semibold (600), from `FONT_WEIGHTS` in `src/lib/font-weight.ts`. It shows them as three "B" tiles. Each tile draws its "B" inside a wrapper with `data-thc-weight` set to that option, so each tile shows its own weight and does not change with the member's choice.
- Applying it. `src/lib/font-weight.ts` sets `data-thc-weight="500"` or `"600"` on `<html>`, and no attribute for 400. `design-tokens.css` maps `[data-thc-weight="…"]` to a new `--thc-weight-regular`, so the whole page, portals included, moves together. `applyFontWeight()` runs at boot in `internal/main.tsx` from the device copy, so the first paint already has the weight.
- Device copy. The device keeps the choice under the `fontWeight` key of `src/lib/stored.ts` (`thc:font-weight` in local storage). `setFontWeight` shows a change at once and rolls back when the save fails (rule 28).
- No other weight. A feature never writes a weight number (`web-font-weight-token`). Only the setting tiles set `data-thc-weight` below `<html>`.
Rationale: cf0 uses one weight and gets hierarchy from size. In senvielab, Geist at 400 read too thin for some members (senvielab `work-neutral-theme.md`, amendment of 2026-10-24). A per-member choice keeps cf0's one-weight rule and lets a member raise all text together, without weight-based hierarchy.
Evidence: `docs/plans/2026-11-11-cf0-port.md` (Brand: "one weight 400, plus a per-member 400/500/600 setting shown as three "B" tiles"; Progress: "call applyFontWeight at boot"); senvielab `webapp-font-weight-preference.md`; `src/lib/font-weight.ts`.
Exceptions: the public site.
Bad example: `fontWeight: 600` on a heading; `data-thc-weight` in a feature; a second "bold" token for card titles.
Good example: `fontWeight: text.weightRegular` everywhere; the member picks Semibold and every label, title and button on the page moves to 600.
Open decisions: where the server saves the choice per member (the save callback that `setFontWeight` takes) is open until the Work member store exists.
