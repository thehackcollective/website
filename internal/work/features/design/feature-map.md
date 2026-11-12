# Design

Design is the `/design` catalogue of the shared kit in `src/components/ui`. Every section renders real kit components with static sample data, so a change to the kit shows here first.

## Sub-features

- actions: every `Button` variant at rest, disabled and loading, plus `IconButton`, `HoldButton`, `Pressable`, pressed buttons and the `UndoPill` (`internal/work/features/design/showcase-actions.tsx`).
- controls: `Field`, `Input`, `Textarea`, `SearchField`, `Checkbox`, `Switch`, `Tooltip`, `Segmented`, `OptionSelect`, `RadioGroup`, `Menu` and `Popover` (`internal/work/features/design/showcase-controls.tsx`).
- inputs: `InputGroup`, `FileInput`, the composed `Select`, menu radio and checkbox items, `TooltipProvider`, the dialog option list, `FilterMiss`, the refresh-failed toast and every icon job (`internal/work/features/design/showcase-inputs.tsx`).
- layout: `Accordion`, `Collapsible`, `Card`, `SectionCard`, the type scale, `BrandLockup`, `Breadcrumbs`, `Toolbar`, `Separator`, the hero row and the confirmation card (`internal/work/features/design/showcase-layout.tsx`).
- lists: `RowList`, `RecordCell`, `IconLabel`, `DefinitionFact`, `StatusDot`, `StatusChip`, `Strength`, `TagList`, `StepList`, `Stepper`, `ExternalLink` and `ButtonLink` (`internal/work/features/design/showcase-lists.tsx`).
- table: the adaptive `Table` with `Tag` cells (`internal/work/features/design/showcase-table.tsx`).
- progress: `Progress`, `TickBar`, `Metric`, `MetricTiles`, `DistributionBar`, `StageFunnel`, skeletons, `TextShimmerWave`, `TextSwap`, `SuccessBurst` and `TablePagination` (`internal/work/features/design/showcase-progress.tsx`).
- calendar: `CalendarGrid` with events around today (`internal/work/features/design/showcase-calendar.tsx`).
- header tabs: the page header shows `PageTabsProvider` tabs for Home and Design (`internal/work/features/design/page.tsx`).
- charts: line, area, bar and ring charts, `BarList`, `ChartSkeleton`, `StatStrip`, `Sparkline`, `AreaSparkline` and `MetricTile` (`internal/work/features/design/showcase-charts.tsx`).
- dialogs and toasts: `Dialog`, the panel dialog, `AlertDialog`, `ConfirmDialog`, sonner toasts and the refresh toasts (`internal/work/features/design/showcase-overlays.tsx`).
- states: `EmptyState` in each kind and the error tone (`internal/work/features/design/showcase-states.tsx`).
- tour: two coachmark steps, on the buttons and on the toasts (`internal/work/features/design/coachmarks.ts`).

## How to get to it (user POV)

1. Run the work app in dev (`./c up work`). The page does not exist in production.
2. Sign in to the work app.
3. Click "Design" in the sidebar, or the second tab of the phone dock.
4. Scroll the sections from top to bottom.

## Driving it with agent-browser

1. Run `./c up work`. With no Clerk keys the app opens signed in as the dev member.
2. Open `http://localhost:5281/design`. Expect the heading "Design" and the "Buttons" section first.
3. Hold "Hold to delete" until it completes and expect the caption "Hold confirmed".
4. Click "Archive with undo", then "Undo" in the pill, and expect "Archive undone".
5. Open each dialog and close it with Escape.
6. Click each toast button and expect a toast.
7. Take a screenshot at 1440px and at 390px as proof.

## Gotchas

- The data is static samples and the page calls no API.
- "New version" shows the same toast as a real deploy, and its Reload button reloads the page.
- The feature sets `devOnly: true`, so `catalog.tsx` drops its route and nav entry from production builds. Members never see it.
- The page stays because it keeps the whole kit reachable for knip.
- This page is what keeps the whole kit live for knip: a kit component that no screen and no showcase renders fails `./c check dead-code`.
- The calendar samples sit around the local today, so the week view always has events.
- The Type section renders `Display` and `Title`, which are h1 elements, so the page has more than one h1.
