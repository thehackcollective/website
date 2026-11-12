# Home

Home is the landing page of the work app at `/`. Today it holds one empty state that says the CRM comes next.

## Sub-features

- next-up: a page-size `EmptyState` titled "The CRM comes next" with a link to the changelog (`internal/work/features/home/page.tsx`).
- tour: one coachmark step on the empty state, anchor `home.next` (`internal/work/features/home/coachmarks.ts`).

## How to get to it (user POV)

1. Sign in at `/login`. The app opens on Home.
2. From any page, click "Home" at the top of the sidebar, or the first tab of the phone dock.

## Driving it with agent-browser

1. Run `./c up work dev-member`. The app opens signed in as the dev member.
2. Open `http://localhost:5281/`. Expect the heading "Home" and the text "The CRM comes next".
3. On a first visit the coachmark shows on the empty state. Click through it, reload, and expect it not to show again.
4. Click "Open the changelog". Expect `/changelog`.

## Gotchas

- The coachmark seen flag is in `localStorage`, one key per member and page, so a new browser shows it again.
- The page has no data and calls no API yet.
