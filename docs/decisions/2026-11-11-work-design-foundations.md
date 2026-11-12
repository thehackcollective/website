# Work: the design foundations

Status: accepted
Date: 2026-11-11
Scope: every Work screen (`internal/`, `workers/internal/`, work.hackcollective.uk) and the shared kit in `src/components/ui/` and `src/lib/`. The public site (`src/features/website/`, hackcollective.uk) keeps its own `--thc-website-*` foundation in `DESIGN.md` and is out of scope (`docs/decisions/2026-11-11-two-token-tiers.md`).
Decision: Work takes cf0.ai's design foundations (`cf0.ai/docs/decisions/2026-11-01-design-foundations.md`) as its own. This record is the index of what is true. The detail records hold the values and the reasons: `docs/decisions/2026-11-11-work-type-ladder.md`, `docs/decisions/2026-11-11-work-neutral-theme.md`, `docs/decisions/2026-11-11-work-control-ladder.md`, `docs/decisions/2026-11-11-work-shell.md` and `docs/decisions/2026-11-11-work-font-weight-preference.md`. The rule numbers match cf0's, so a rule number means the same thing in both repos. Rules 1 to 21, 24 to 39 and 41 to 45 are in force. Rules 22 and 23 do not apply to Work. Rule 40 is decided and not built yet. A change to one of them needs a new record that supersedes this one. The checks keep cf0's `web-*` ids. A check named here that is not in `base.rules.yaml` yet is a review item until it lands.

Type

1. One type ladder with a ratio of 1.25. Work uses the console run of the ladder. The onboarding uses the run one step above it. No size is off the ladder, and no surface skips a step (`docs/decisions/2026-11-11-work-type-ladder.md`, `web-font-size-is-ladder-token`, `web-size-token-on-ladder`, `web-type-token-not-scaled`).
2. Leading is 1.5 for text and 1.2 for headings. Each leading token is the size times its ratio (`web-line-height-is-token`).
3. All Work pages use Geist at one weight, `text.weightRegular` (400 by default). Hierarchy comes from size, not weight. Each member can raise the one weight to 500 or 600 for themself (`docs/decisions/2026-11-11-work-font-weight-preference.md`, `web-font-weight-token`). Geist Mono is for identifiers and code only.
4. The fallback face is `Geist Fallback` (Arial with metric overrides in `src/tokens/design-tokens.css`), so text does not move when Geist loads.
5. Numbers are tabular on every page. Text is antialiased (`src/tokens/webapp-globals.css`).
6. Headings use `text-wrap: balance`. Narrow and justified text uses `hyphens: auto`.
7. A column of running text is at most 65 characters wide. A text container never uses a pixel cap (`web-prose-measure-is-token`).
8. An ellipsis is one character, `…`. Code that shortens a string cuts at a word boundary (`web-ellipsis-is-one-character`).
9. `sup` and `sub` have a fixed size and offset, so the line height does not change.

Colour and theme

10. Text is at least 4.5:1 on its surface. Icons and control borders are at least 3:1 (`web-token-contrast`). Text on THC blue is white (`docs/decisions/2026-11-11-work-neutral-theme.md`).
11. Code reads semantic tokens only. The palette is private to the token files (`web-token-palette-private`).
12. Work has one light theme and no dark mode (`web-light-theme-only`).
13. Each token is read by a file. A token is added in the change that first reads it (`web-token-used`).

Icons

14. One icon per job. One map (`src/components/ui/icon-jobs.ts`) holds each job and its glyph, and no glyph serves two jobs (`web-icon-by-job`, `web-icon-one-glyph-per-job`).
15. The icon stroke is a tenth of the icon size, from 1.25px to 3px, so an icon has about the same weight as the text next to it.
16. The gap between an icon and its label in a control is 8px.
17. `Icon` holds the optical nudge of an asymmetric glyph, for example the play triangle.

Layout and space

18. Space between siblings comes from `gap` on the parent, not from a margin on a child (`web-sibling-space-is-gap`).
19. Negative space is part of the design. A crowded view loses content, not space. The shell frame gives every Work page its top offset (`space.pageTop`). A page root sets no top offset. The sidebar brand row uses the same offset and `layout.pageHeaderHeight` (`web-page-top-is-shell`, `web-page-root-no-top`).
20. A fixed element at the screen edge clears the phone safe area with the safe-area tokens (`web-safe-area-is-token`, `web-fixed-bottom-clears-safe-area`).
21. An inner radius equals the outer radius minus the padding (`radius.nest*`, `nested-radius-from-nest`).
22. Does not apply to Work. cf0's 8-column site grid is a public-site rule, and Work has no column grid. The THC public site keeps its own rail layout (`DESIGN.md`).
23. Does not apply to Work. cf0's 5-of-8 media split is a public-site rule.

Controls and affordance

24. The button ladder has four steps. Primary is the one next step. Secondary (outline) is a real alternative. Ghost (quiet fill) is a way out or a small action. Link (underline) goes to another place. A footer has at most one primary and one secondary. A destructive action sits apart from the confirm action.
25. An external link shows the open-external icon. A text link is underlined at rest (`web-new-tab-link-is-external-link`, `web-text-link-is-underlined`).
26. A row with one action shows that action on hover and focus, and always on a touch screen.
27. An empty state has a kind (`empty`, `filtered`, `clear`, `denied`). An empty view gives the reason and a next step. A filtered view clears the filter. A done view says so. A denied view says who gives access. The type checker enforces this (`EmptyState` in `src/components/ui/empty-state.tsx`).

Server writes

28. A reversible single-field action updates at once and rolls back with an error message on failure. Messages that leave Work, invites, sign-in and credentials wait for the server. Each write declares which kind it is (`web-write-through-helpers`).
29. A search that calls the server waits 300ms after the last key and cancels the older request (`web-debounce-one-delay`).

Verification

30. Alignment is measured, not judged. `./c align` measures a UI change, and its report goes on the PR. The `verification` skill drives the change in a browser and puts the steps and the result on the PR.

Interaction states

31. Focus: each focusable element shows a visible ring on `:focus-visible`. No style sets the outline to none or 0 without a ring (`web-outline-keeps-focus-ring`).
32. Pressed state: each pressable control shows a darker colour step on `:active`, and the 0.97 scale stops under reduced motion. The primitives in `src/components/ui/` hold the step (`web-pressable-has-active`, `web-press-scale-respects-reduced-motion`). A feature gets it by using `Button`, `Pressable` or `MenuItem`.
33. Disabled state: disabled and "not ready yet" use dedicated muted tokens, never opacity (`web-disabled-not-opacity`). A "not ready yet" feature also shows a short "Soon" caption.
34. Cursor: pointer means clickable, default means static, text means selectable. A resizable element shows a resize cursor and also moves with the arrow keys. Each cursor comes from the `cursor` consts (`web-cursor-is-const`).
35. Hit area: each interactive element has a 44 by 44px hit area on every device. The visual can stay smaller. Every `Button` size has the hit area, and `./c align` measures it on the page.

Motion and feedback

36. Confirmation: copy, download and export show a check for 2 seconds and announce it to a screen reader. `src/lib/hooks/use-copied.ts` is the one owner (`web-clipboard-through-use-copied`).
37. Sound: a repeatable action plays a short sound from one owner, `src/lib/interaction-sounds.ts`. A member can mute it (`web-sound-one-owner`).
38. Transitions: no transition or keyframe uses `all` or a layout property. Animations use opacity and transform. A size change goes through one shared size transition, `src/lib/size-transition.stylex.ts` (`web-transition-named-properties`).
39. Enter and exit: an exit is shorter than its entrance and uses an ease-in curve (`motion.durationExit`, `motion.easeExit`). It is never the entrance played backwards. Every duration and curve is a motion token (`web-motion-is-token`).

Decided, not built yet

40. Motion confirms that something happened: a pressed button, a field that shakes once on an invalid submit, a check that draws on success. Motion is not decoration.

How a rule changes

41. A new rule starts at zero violations. The change fixes the code to zero and then adds the check. No baseline file lists old violations. The only baseline is the token count cap (`web-token-count-cap`), and it only goes down. A loosening goes through `docs/decisions/2026-11-11-gate-placement.md`.

Copy and chrome

42. Keep captions to a minimum. A caption is helper text under or next to a label, a heading or a title. Do not add one. First remove the need for it with a clearer label. A hard question gets an info icon with a popover next to its label. An optional field says "(optional)" after its label. Errors, status lines, empty-state reasons and the consequence line of a destructive dialog are not captions.
43. A confirmation dialog uses the body text size for its consequence line.
44. A page header has no count. A count goes on a tab, a column or a badge (`PageHeader` in `src/components/ui/page-header.tsx` has no `count` prop).
45. The shell chrome is flat. A sidebar row, group or icon button has no fill and no border at rest. Hover is `color.backgroundSurfaceHover`. The current page is `color.backgroundNeutral`, one step darker than hover.

Rationale: Louis set these rules for cf0 on 2026-11-01 and 2026-11-04 from Emil Kowalski's design vocabulary (aiforui.dev). The port plan of 2026-11-11 makes cf0 canonical for Work, as senvielab and elearning did. Work differs from cf0 only in accent (THC blue), typeface (Geist), brand mark and content. One index keeps the whole set visible, so an agent does not decide a rule again on each screen. cf0's numbering lets a rule be cited the same way in every repo that ports it.
Evidence: `cf0.ai/docs/decisions/2026-11-01-design-foundations.md` (cf0.ai main @ a0538ec33); `senvielab/docs/decisions/webapp-design-foundations.md`, which drops rules 22 and 23 the same way; `docs/plans/2026-11-11-cf0-port.md` (Goal, Brand, Contracts).
Exceptions: the public site. Its rules are in `DESIGN.md`.
Bad example: `marginTop` on a page root; a `PageHeader` title with "(12)" after it; a new hint line under a field; `transition: 'all 200ms'`; `fontWeight: 600` on a card title.
Good example: a page whose root sets no top space and whose header is `<PageHeader title="Events" actions={…} sticky />`; an empty list that shows `<EmptyState kind="empty" …>` with one line and one primary button.
Open decisions: none.
