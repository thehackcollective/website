---
name: calendar-enrich
description: >-
  Find upcoming hackathons shared in the biggest WhatsApp groups and add the ones missing
  from The Hack Collective's Luma calendar (luma.com/thehackcollective). Use when
  asked to "enrich the calendar", "update Luma", "find hackathons in WhatsApp",
  "what hacks are we missing", or run /calendar-enrich. Has a child agent read
  the big groups' event links through wacli, dedups against the calendar's iCal feed, writes a YAML + handoff file,
  and adds events through a browser (agent-browser or Playwright) on confirmation.
argument-hint: "[--after YYYY-MM-DD] [--add]"
---

# Calendar enrich

The calendar is the product: every London hackathon in one place. This skill
turns the hackathon links and announcements people drop in WhatsApp groups into
calendar entries. The output is always a file a human (or another agent) can act
on; adding to Luma directly is the bonus step, not the requirement.

Every helper is in this skill's folder. Run from the repo root.

## 0. Prerequisites

Check all three before doing anything. Stop and say which is missing.

1. **wacli, authenticated and synced.** `wacli doctor` must show
   `AUTHENTICATED true` and a `LAST_SYNC` within the last day. Do not start a
   sync yourself: `CONNECTION_STATE locked_by_other_process` means a sync daemon
   already runs, and that is fine for reading. Every wacli call here uses
   `--read-only`. If wacli is missing or unauthenticated, any other tool that can
   read WhatsApp group messages works; the rest of the workflow only needs the
   messages as JSON.
2. **A browser driver**, for step 4 only: `agent-browser` (preferred; run
   `agent-browser skills get core` once) or `playwright`. Without one, stop
   after step 3 and hand over the files.
3. **python3** (stdlib only) and `jq`.

## 1. Snapshot the calendar

```bash
mkdir -p ~/Downloads/thc-calendar-enrich
python3 -I .agents/skills/calendar-enrich/luma_existing.py --upcoming \
  > ~/Downloads/thc-calendar-enrich/existing.json
```

It reads the public iCal feed for `cal-Qk1P4msjA8eRxCs`. Use it, not
`api.lu.ma/calendar/get-items`, which rate-limits after a couple of calls.
Output goes to Downloads, outside the repo, so WhatsApp-derived content never gets near a commit.

## 2. Hand the WhatsApp side to a child agent

No scan script: spawn one child agent (a subagent, or a separate session if
your harness has none) and give it `existing.json` plus these instructions.

1. Find the biggest group chats by member count or message volume
   (`wacli --read-only --json groups list`, `chats list`; check `--help`).
   Groups only, never DMs. Take the top 15–20, plus any obvious hackathon,
   tech-community or uni-society group.
2. In each, pull the event links from recent months:
   `wacli --read-only --json messages search luma --chat <jid> --after <date>`
   or `messages list --chat <jid>`. Look for luma.com, lu.ma, devpost,
   eventbrite, partiful, mlh and hackathon sites. Summer messages announce the
   Nov–Mar university season, so go back months.
3. Open each new link for its real name, dates and venue. For Luma,
   `curl -sL -A 'Mozilla/5.0' <url>` and read the `__NEXT_DATA__` JSON
   (`props.pageProps.initialData.data.event`: `name`, `start_at`, `end_at`,
   `timezone`, `geo_address_info`, `url`). Space requests 1–2 s apart.
4. Keep hackathons and close cousins (buildathons, build nights, game jams,
   datathons, hacker houses) that end on or after today and are in London,
   elsewhere in the UK, or online. In-person events outside the UK go to
   `skipped` as `out-of-scope`. Drop anything already
   in `existing.json` (match by Luma URL, or name + date: externally added
   events show `luma.com/thehackcollective` as their URL).
5. Never write phone numbers or JIDs to the output, and never copy raw group
   messages into a file: groups can hold pinned private notes.

## 3. Write the files

The child agent writes two files to `~/Downloads/thc-calendar-enrich/`, never
into the repo. The bar is the 2026-10-19 run: 14 entries, 83 skipped, a
handoff a cloud agent could act on with no WhatsApp access.

**`hacks-to-add.yaml`**: a short `#` header (scan window, date generated,
scope, sort order, the BST/GMT note), then `hacks:` sorted London, rest of UK,
online, each by start date, then `skipped:`.

```yaml
hacks:
  - name: "Local AI Speedrun: Biggest Model, Smallest Box"
    start: "2026-11-07T12:00:00+00:00"
    end: "2026-11-07T18:00:00+00:00"
    timezone: "Europe/London"
    venue: "Encode Hub, 41 Pitfield St, London N1 6DA, UK"
    city: "London"
    online: false
    url: "https://luma.com/encode-ezmq"
    host: "Encode Club"
    suggested_tag: ["Hackathon"]
    add_via: "luma-existing"
    confidence: "high"
    notes: "One sentence on what it is, plus anything the adder must know (placeholder times, applications closed, no Luma page yet)."
    source: { chat: "<group name>", sender: "<display name or null>", at: "<message time>", msg_id: "<wacli msg id>" }
skipped:
  - name: "ArtTech Hack"
    url: "https://luma.com/vm8bht09"
    reason: "out-of-scope"
    note: "in person in Zürich; calendar covers London, rest of UK and online only"
```

- `start`/`end` are local time with the UTC offset; BST ends on the last
  Sunday of October. When only the date is known, use placeholder times and
  say "Times are placeholders" in `notes`.
- `suggested_tag` is a list. London hackathon: `["Hackathon"]`. Rest of UK or
  online: `["Hackathon", "Online/Not London"]`. A partner event that is not a
  hackathon: `["Non-Hackathon"]`, with a note on why it is listed.
- `add_via` is `luma-existing` when `url` is a Luma event, else `external`.
- `reason` is one of `duplicate | past | not-hackathon | unresolved |
  out-of-scope`.

**`HANDOFF.md`**: copy `handoff-template.md` from this folder and fill it in.
Keep every section and the instructions word for word. Fill in the counts, the
date, the checklist (one row per entry, same order as the YAML), the
notes-before-you-start bullets, and paste the whole YAML into the last code
block so the file stands alone.

Before finishing, check both files: the YAML parses, the checklist row count
equals `len(hacks)`, and neither file has a phone number, a JID
(`@s.whatsapp.net`, `@g.us`) or a password.

Then reply to the person in chat with:

1. One line: N to add (by region), M skipped (by reason), and the path to
   `HANDOFF.md`.
2. The checklist as a table: region, date, name, link.
3. **Needs a human**: entries with no page yet, partner events worth listing,
   leads with no date, uni hacks that haven't announced dates.

This step always happens, whether or not step 4 does.

## 4. Add to Luma (only on confirmation)

Adding is public and visible to 450+ subscribers, so confirm with the person
first, or run it only when they passed `--add`.

Luma signs in by emailed magic link, so a human signs in once in a headed
browser with a persistent profile, and later runs reuse it:

```bash
agent-browser --headed --profile ~/.config/thc-luma-profile open https://luma.com/signin
```

Then, signed in as a calendar admin:

1. Open `https://luma.com/calendar/manage/cal-Qk1P4msjA8eRxCs`, go to Events,
   and find the add-event control with `snapshot`. The admin UI has not been
   scripted yet: follow the dialogs rather than assuming refs, and note what you
   found in Gotchas below.
2. `add_via: luma-existing`: add the existing Luma event by its URL.
   `add_via: external`: add an external event with name, dates, location and URL.
3. Apply the suggested tag(s).
4. Mark the entry `action: added` in the YAML.

Without admin rights, the public page's **Submit Event** button sends an event
for approval instead.

Re-run step 1 at the end and check each added event appears exactly once.

## Gotchas

- Go to the big groups and their links. Grepping every chat for keywords is
  slow and noisy, and too narrow a window looks like a quiet community rather
  than a broken search.
- wacli `--limit` defaults to 50, which silently truncates. Raise it.
- `lu.ma/x` and `luma.com/x` are the same event. Normalise before deduping.
- Many shared Luma links are other cities (Nucleate, Encode, global series).
  Keep them only if they are UK or online hackathons.
- Luma returns `{"message":"You’ve exceeded our rate limit..."}` on bursts.
  Back off, don't drop the link: mark it `unresolved`.
