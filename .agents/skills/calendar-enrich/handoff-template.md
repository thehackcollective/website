# Handoff: add WhatsApp-sourced events to The Hack Collective Luma calendar

You are adding {N} upcoming events to The Hack Collective's Luma calendar: {H} hackathons{plus K partner events}. They were pulled from the community's WhatsApp groups on {DATE} and checked against the calendar's public iCal feed that day. Everything you need is in this file; you do not need WhatsApp access.

Scope: the calendar promotes hackathons in London, elsewhere in the UK, and online. In-person events outside the UK are deliberately left out (listed under `skipped` as `out-of-scope`); do not add them.

## The calendar

- Public page: https://luma.com/thehackcollective
- Calendar id: `cal-Qk1P4msjA8eRxCs`
- Admin page: https://luma.com/calendar/manage/cal-Qk1P4msjA8eRxCs
- Public iCal feed (use it for duplicate checks): https://api.lu.ma/ics/get?entity=calendar&id=cal-Qk1P4msjA8eRxCs
- Tags: `Hackathon`, `Non-Hackathon`, `Online/Not London`, `Panel/Startup/Fund-raising`. London hackathons get `Hackathon`; hackathons elsewhere in the UK or online get `Hackathon` and `Online/Not London`.

## Before you start

1. Sign in to Luma as an account that is an admin of this calendar. If you cannot get admin access, stop and report back; do not create a new calendar or submit events through the public "Submit event" form instead.
2. Fetch the iCal feed and the public page once and keep the list of event names, dates and `luma.com/...` links. Events may have been added since {DATE}.
3. The exact admin UI was not verified when this file was written. Take a snapshot or screenshot before each click, read the dialogs, and follow what Luma actually shows rather than assuming the steps below are literal.

## For each entry, in table order

1. **Skip if already there.** Treat it as a duplicate if the iCal feed or public page has the same Luma URL, or an event with essentially the same name on the same date (some externally added events show `https://luma.com/thehackcollective` as their link, so the name and date check matters). Also skip any entry whose end time has already passed when you get to it.
2. **Add it** from the admin page: Events, then the add-event button.
   - `add_via: luma-existing`: choose the option to add an existing Luma event and paste the `url`. Luma pulls in the name, time and venue. Some hosts must approve a calendar listing; if Luma says the request is pending, record that and move on.
   - `add_via: external`: choose the option to add an external event and fill in name, start, end (with the timezone given), location (`venue`, `city`; for online events use "Online") and the event `url`.
3. **Tag it** with every tag in the `Tags` column.
4. Tick the checkbox in your copy of the table and note anything odd (pending host approval, Luma refused, details on the page disagree with this file). When the official page disagrees with this file, the official page wins.

## After you finish

Re-fetch the iCal feed and the public page. Confirm each added entry appears exactly once, carries the right tags, and that nothing was added twice. Report: added, skipped as duplicate, pending host approval, and failed (with the reason).

## Checklist ({N} entries: {a} London, {b} rest of UK, {c} online; each group by start date)

| # | Done | Region | Date | Name | City | URL | Tags | Add via | Confidence |
|---|------|--------|------|------|------|-----|------|---------|------------|
| 1 | [ ] | London | YYYY-MM-DD | {name} | London | {url} | Hackathon | luma-existing | high |
| 2 | [ ] | Rest of UK | YYYY-MM-DD | {name} | {city} | {url} | Hackathon + Online/Not London | external | medium |
| 3 | [ ] | Online | YYYY-MM-DD | {name} | Online | {url} | Hackathon + Online/Not London | external | high |

Notes worth knowing before you start:

- One bullet per entry that needs care: no Luma page yet (search Luma first), placeholder times, a partner event tagged Non-Hackathon, an online hack listed at its submission deadline, applications already closed.

## Full entry list

Every field for every entry, so this file stands alone. `source` says where in WhatsApp it was found; you can ignore it. The `skipped` section lists what was deliberately left out (already on the calendar, already over, out of scope, not a hackathon, or not enough detail yet) so you do not re-add those.

```yaml
# {paste hacks-to-add.yaml here, verbatim}
```
