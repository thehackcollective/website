# Changelog

Changelog is the release history of the work app at `/changelog`. The entries are static code in `internal/work/features/changelog/entries.ts`, newest first.

## Sub-features

- list: each entry shows its date, version, kind badge, title and one line per change (`internal/work/features/changelog/page.tsx`).
- entries: version 1.0.0, "cf0 design foundation", is the first entry (`internal/work/features/changelog/entries.ts`).

## How to get to it (user POV)

1. Click "Changelog" in the sidebar footer.
2. On a phone, open the header menu and pick "Changelog".
3. From Home, click "Open the changelog".

## Driving it with agent-browser

1. Run `./c up work` and open `http://localhost:5281/changelog`.
2. Expect the h1 "Changelog" and a first entry titled "cf0 design foundation" with "Version 1.0.0".
3. Press Cmd K, type "chan" and press Enter. Expect `/changelog`.

## Gotchas

- Changelog is not a rail page, so it has no coachmarks.
- Add a release by putting a new entry at the top of `changelog` in `entries.ts`.
