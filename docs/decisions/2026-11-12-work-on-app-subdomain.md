# Work runs on app.hackcollective.uk

Date: 2026-11-12. Decided by Louis.

## Decision

1. Work, the THC CRM, is served at app.hackcollective.uk, not work.hackcollective.uk.
2. The product name stays Work. Only the domain changes.
3. The Clerk production instance is on app.hackcollective.uk. Its DNS records (`clerk.`, `accounts.` and `clkmail.app.hackcollective.uk`) are live.

## Reason

A Clerk production instance serves one domain. Louis set the instance up on app.hackcollective.uk, so Work moves to that domain.

## Keys

The 1Password Environment `hackcollective` (`escb5g6qj6obx3ozvjtixcczkq`) holds the dev and the prod Clerk key pairs. `./c up` uses the dev pair. Production reads `CLERK_SECRET_KEY` as a Worker secret and `CLERK_PUBLISHABLE_KEY` as a build variable, both from the prod pair.
