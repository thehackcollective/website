# Person

Person is the detail page of one person at `/people/<id>`, from `GET /api/people/<id>` (`workers/internal/people-api.ts`).

## Sub-features

- header: the name as the title, with a button for each profile the person linked (Luma, LinkedIn, X, GitHub, Instagram, website).
- hero: the avatar, the headline, the circle chip and the identity tag (Identity confirmed or Identity likely).
- summary: one paragraph on who the person is to THC.
- stats: intent, Luma events attended, WhatsApp builder groups and THC chat messages.
- evidence: "How we know them" lists each tie with its kind, its source (Luma, WhatsApp, X, Louis's CV or Louis's contacts), its date and a "Source" link when a public URL exists.

## How to get to it (user POV)

1. Open People in the sidebar.
2. Click a row.

## Driving it with agent-browser

1. Seed the local D1 and run `./c up work`.
2. Open `http://localhost:5281/people` and click a row in "Core team".
3. Read `[data-slot="page-header-title"]` for the name and the "How we know them" card for the ties.
4. `GET /api/people/<id>` returns the same person with `links` and `evidence`.

## Gotchas

- An unknown id shows the error state with "Try again", because the API answers 404.
- The page has no nav entry, so the sidebar marks nothing while it is open.
