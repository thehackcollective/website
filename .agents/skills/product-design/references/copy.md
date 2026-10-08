# Copy

## Rules

- One sentence per paragraph. If a thought needs two, cut one.
- Plain words a first-year can repeat. No "ecosystem", "leverage", "empower", "unlock", "vibrant", "passionate".
- Exact names, verbatim: The Hack Collective, WhatsApp, Luma, Kickstart Global, Hacker's Unity, HackEurope, FINEDA, UCL.
- Numbers as proof, formatted as they appear in `AGENTS.md`: `1,000+`, `400+`, `#2`. Never round up or add a qualifier the source lacks.
- British spelling (organiser, colour, programme).
- Headings are statements, not labels: "Every London hackathon on one calendar" beats "Calendar".
- Buttons name the destination or the result: "Join the WhatsApp", "Subscribe on Luma", "Submit an event", "Partner with us". Never "Learn more", "Click here", "Get started".
- No exclamation marks. No emoji.
- Eyebrows are short, uppercase via CSS, never typed in caps.

## Accessible names

- Logo link: `aria-label="The Hack Collective home"`.
- External links: visible text already names the destination, so no extra `aria-label`; add `rel="noreferrer"` and `target="_blank"`.
- Icons are decorative (`aria-hidden`) unless they are the only content of a control.

## Tone check

Read the section aloud. It should sound like a UCL student telling a friend what THC is, not like a sponsor deck. If a sentence would be at home on a corporate careers page, rewrite it.
