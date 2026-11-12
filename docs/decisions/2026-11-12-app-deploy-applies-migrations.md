# Each App deploy applies the D1 migrations first

Date: 2026-11-12. Decided by Louis.

This record supersedes decision 6 of `docs/decisions/2026-11-12-cf-cli.md` ("Production migrations are applied by hand … A deploy does not apply them").

## Decision

1. The Workers Builds trigger "App production" deploys the App Worker `hack-collective-app` on each merge to `main`.
2. Its build command is `bun install && cd internal && bunx vite build`.
3. Its deploy command is `cd internal && bunx cf d1 migrations apply a6feccfd-24d4-4b6e-8109-62848796ff76 --dir ../workers/internal/migrations && bunx cf deploy --prebuilt --mode production`.
4. The migrations apply first. If the apply fails, the deploy does not run.
5. Its build variable `CLERK_PUBLISHABLE_KEY` holds `CLERK_PROD_PUBLISHABLE_KEY` from the 1Password Environment `hackcollective`. The Worker secret `CLERK_SECRET_KEY` holds `CLERK_PROD_SECRET_KEY`. The `CLERK_DEV_*` pair never reaches production.

## Rule for migrations

A migration applies before the new Worker code goes live. If the deploy then fails, the old code runs on the new schema. So a migration must work with the code that is live before it:

1. Add columns and tables in one PR. Make the code use them in the same or a later PR.
2. Drop or rename a column only after a merged PR has stopped using it.

## Reason

Louis asked for the same flow as elearning, whose trigger runs `cf d1 migrations apply` before `cf deploy`. A hand step before each merge is easy to forget.

## Evidence

- Build `9de745ec-7305-4c7e-9bb0-7773e8f3b41b` ran the deploy command on `main`. The apply printed `[]`, which means no pending migrations, and `hack-collective-app` deployed.
- On the same day, elearning's trigger applied migrations 0064 and 0065 non-interactively with the same command shape.
- Clerk's API matched each pair to its instance: the `CLERK_DEV_*` pair to development and the `CLERK_PROD_*` pair to production.
