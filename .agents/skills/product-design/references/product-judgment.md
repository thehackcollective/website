# Product judgment

## Who lands here

- **Student builder** (most visitors): found THC via Google "London hackathons", a friend, or a Luma event. Wants to know if this is real and how to get in. Success: joins the WhatsApp or subscribes to the calendar.
- **Organiser or partner**: runs a hackathon, wants reach. Success: understands the audience size and emails or submits an event.
- **Sponsor**: evaluating credibility. Success: trusts the numbers and the partner list.

The page serves the first visitor first. The other two must not make the first scroll heavier.

## The brief (write this before any material change)

- Visitor and job.
- Current behaviour (what the section does today).
- Desired outcome and success signal (a click, a scroll depth, a fact understood).
- Non-goals.
- Open decisions, marked as such.

## Section order is the argument

Hero (what THC is, one action) → Stats (proof) → Partners (credibility) → Join (every exit). Each section answers a new visitor question. Adding a section means naming the question it answers; if an existing section already answers it, extend that section instead.

## Choosing an intervention

1. Remove or reorder before adding.
2. Change copy before changing layout.
3. Change layout before adding a component.
4. Add a component only if `src/components/ui/` has nothing that fits, and then add it there with a closed API.

## Events

Event-specific blocks (a hack with a date and a Luma link) are temporary by nature. They live in their own section file, their facts live in `content.ts`, and they are removed (not hidden) when the event passes. The Grok Bot section lives in git history (`git show df47a19:src/components/upcoming-hack-section.tsx`) as the pattern.

## Dark mode (revamp target)

Dark is a token change, not a component change. Tokens in `design-tokens.css` get `prefers-color-scheme: dark` values from the table in `DESIGN.md`; components never branch on theme. The logo swaps to the white variants through the same mechanism (CSS `picture`/`prefers-color-scheme` or a token-driven mask), never through JavaScript theme detection.

## Honest risks to name

- A stat that cannot be re-verified next month should not be on the page.
- Partner logos imply endorsement; use names only unless the partner has approved the mark.
- The contact email is a personal address until a THC address exists.
