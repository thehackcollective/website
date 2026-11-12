# People

People is the THC CRM list at `/people`. It shows every person THC knows, in circles by how close they are, from `GET /api/people` (`workers/internal/people-api.ts`). The data lives in the D1 tables `people`, `person_links`, `ties` and `events` (`workers/internal/migrations/0001_people.sql`).

## Sub-features

- circles: the canonical `Table` groups people into Core team, Partners, Builders, Members and Subscribers (`circles.ts`). Each group has a dot and a one-sentence caption.
- columns: "Who" is the written summary, or the headline when no summary exists. "How we know them" lists the tie kinds as tags. "Intent" is a 0 to 100 score with a green, amber or grey dot. "Seen at" counts Luma events and WhatsApp builder groups. "Identity" is Confirmed or Likely.
- search and sort: the search field matches the name, headline, summary and ties. The default sort is intent, high to low. Each page shows 25 rows, then "Show more".
- open: a row opens `/people/<id>` (the person feature).
- states: a skeleton while it loads, "No people yet" with "Check again" when the table is empty, and an error with "Try again" when the API fails.
- tour: one coachmark step on the table, anchor `people.table` (`coachmarks.ts`).

## How to get to it (user POV)

1. Sign in. Click "People" in the sidebar, or the People tab of the phone dock.
2. Type a name or a word such as "winner" in the search field.
3. Click a row to see how THC knows that person.

## Driving it with agent-browser

1. Seed the local D1 with the profiling import, then run `./c up work`.
2. Open `http://localhost:5281/people`. Expect the heading "People" and the group "Core team" first.
3. `GET /api/people` returns the same rows as JSON, sorted by intent.
4. Click the first row. Expect `/people/<id>` and the heading with the same name.

## Gotchas

- The person id is the Luma user id (`usr-…`) or the Luma handle when one is known, and `wa-<n>` for a WhatsApp-only person.
- Identity "Likely" means the WhatsApp name matched a Luma name with no second fact. Treat it as a lead, not a fact.
- No phone number is stored. WhatsApp facts are counts and ties only.
