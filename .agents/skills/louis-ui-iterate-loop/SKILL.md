---
name: louis-ui-iterate-loop
description: "Use for 'louis ui iterate loop skill: <page name>' or measured page polish in hack-collective. Resolve the page, fix shared components in small rounds with ./c align, and send before-after.html as proof."
---

# Louis UI iterate loop

Ported from cf0 through elearning. Paths and routes are hack-collective's.

## Resolve and prepare

1. Resolve the page name to a path. App routes are in `internal/work/features/<name>/entrypoint.ts`. The landing route `/` is in `src/features/website/entrypoint.ts`. Match a route title, a nav label or a feature id. Accept an explicit path. If two routes match, ask which one. Never guess a slug.
2. Use the running stack. Otherwise run `./c up work mock-data:full` (App on http://localhost:5281). In dev with no Clerk keys the app opens signed in, so `./c align` does not sign in. For the landing, run `./c up site` and pass `--origin http://localhost:5173`. Start Chrome with `agent-browser open about:blank`.
3. Read `DESIGN.md`. For App, read `docs/decisions/2026-11-11-work-design-foundations.md`. Load `product-design` and `stylex-authoring`.
4. Capture 1440px and 390px in round 01. Use `--phone` with `--width 1440`. Keep each page in one run folder.

## Measure, fix, measure

```sh
./c align <path> --width 1440 --phone --round ~/research/ui-loop/<slug>
```

1. Read every real finding in `round-NN/viewer.html`. Noise is hidden by default. Use Components to inspect the structural scan (`scripts/align-components.ts`).
2. Classify each finding: real, align false positive, or intended with a design rule.
3. Fix at most three issues per round. Fix shared owners first: `src/components/ui/` and the App shell. Use tokens, never literal sizes.
4. Fix a false positive in `scripts/align-*.ts`, not in the UI. That is a change to `scripts/`, so it goes in its own PR. Do not hide intended findings.
5. Run the same command again. Read `diff.json`. Open the clean capture and the rhythm PNGs. Check clipping, overlap and hierarchy.
6. Keep triage in `<run>/audit.json`: `falsePositives: [{id, reason}]` and `intended: [{id, reason}]`. Add measured changes that were not in the first report as `changes: [{category, element, before, after, rounds}]`, with `rounds` as a string such as `round-02 to round-03`.
7. Stop when real open is zero and the clean capture is correct, after five rounds, or after two rounds that fix nothing. Report each open or intended finding. Do not invent measured values.

Check shared leading edges across all row roles. Measure trailing edges only for trailing items. Keep media and text insets separate. If you change a control on an App rail page, update that feature's `coachmarks.ts` in the same change.

## Optional extras

The viewer, rhythm PNGs and video are secondary. Rebuild PNGs with `bun scripts/align-images.ts <run>/round-NN`. Make a video with `bun scripts/align-reel.ts <run>` (it needs ffmpeg). End on the clean page. Do not add zoom effects.

## Deliver the proof

```sh
bun scripts/align-compare.ts ~/research/ui-loop/<slug>
./c check
```

Open `<run>/before-after.html` yourself. Check both clean sides, both badge toggles, the audit, the UI files and the diff stat. It contains its images and needs no server. The audit must separate real fixes, intended findings and align false positives. A missing finding alone does not prove intent.

Send the final summary, any limits and the main proof: **<run>/before-after.html**. Attach it to the PR.
