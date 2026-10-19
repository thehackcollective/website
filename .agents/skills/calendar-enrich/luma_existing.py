#!/usr/bin/env python3
"""List every event already on The Hack Collective's Luma calendar, from its public iCal feed.

The iCal feed is not rate limited the way api.lu.ma/calendar/get-items is, so use this
for dedup. Prints a JSON array: name, start, end, location, luma_url, event_id.

Usage: python3 -I luma_existing.py [--upcoming]
"""

import argparse
import datetime
import json
import re
import sys
import urllib.request

CALENDAR_ID = "cal-Qk1P4msjA8eRxCs"
ICS_URL = f"https://api.lu.ma/ics/get?entity=calendar&id={CALENDAR_ID}"


def unfold(ics):
    return re.sub(r"\r?\n[ \t]", "", ics)


def parse_dt(value):
    value = value.split(":")[-1]
    fmt = "%Y%m%dT%H%M%SZ" if "T" in value else "%Y%m%d"
    return datetime.datetime.strptime(value, fmt).replace(tzinfo=datetime.timezone.utc)


def unescape(value):
    return value.replace("\\n", "\n").replace("\\,", ",").replace("\\;", ";").replace("\\\\", "\\")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--upcoming", action="store_true")
    args = parser.parse_args()

    request = urllib.request.Request(ICS_URL, headers={"User-Agent": "thc-calendar-enrich"})
    ics = unfold(urllib.request.urlopen(request, timeout=30).read().decode("utf-8"))
    now = datetime.datetime.now(datetime.timezone.utc)

    events = []
    for block in ics.split("BEGIN:VEVENT")[1:]:
        fields = {}
        for line in block.splitlines():
            key, sep, value = line.partition(":")
            if sep:
                fields[key.split(";")[0]] = value if key.split(";")[0] not in ("DTSTART", "DTEND") else line
        start = parse_dt(fields["DTSTART"])
        end = parse_dt(fields["DTEND"]) if "DTEND" in fields else start
        if args.upcoming and end < now:
            continue
        description = unescape(fields.get("DESCRIPTION", ""))
        luma = re.search(r"https://luma\.com/[\w-]+", description)
        events.append({
            "name": unescape(fields.get("SUMMARY", "")),
            "start": start.isoformat(),
            "end": end.isoformat(),
            "location": unescape(fields.get("LOCATION", "")),
            "luma_url": luma.group(0) if luma else "",
            "event_id": fields.get("UID", "").split("@")[0],
        })

    events.sort(key=lambda e: e["start"])
    json.dump(events, sys.stdout, ensure_ascii=False, indent=1)
    print(f"{len(events)} events on the calendar", file=sys.stderr)


if __name__ == "__main__":
    main()
