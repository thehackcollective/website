---
name: verification
description: Verify shipped behaviour on the running hack-collective app, not "it compiles" and not "the gate is green". Use after you build or fix anything a visitor or a member sees, any Worker route, or when you reproduce a reported bug. Starts the stack with ./c up, walks the feature map of each feature the change touches, and leaves proof that the next session can reproduce.
---

# Verification

> Verification beats generation. A green gate is not acceptance. Proof artifacts are.

A change is not done until it ran on the product at the layer the user touches. Types, lint and the commit gate are guardrails. They do not prove that the feature works.

## The loop

1. **Read the feature map.** Each feature has a `feature-map.md`: what it does, how a user gets to it, what usually lies and how to prove it. When the map is wrong after your change, fix it in the same change. The map is the data this skill runs on.
2. **Run the real stack.** See the preconditions below.
3. **Drive the user path.** Walk the map's "How to get to it" section end to end in a browser. Take a screenshot of every step at **1440px and 390px**. Collect page errors and console errors. Any error fails the run. For a Worker route, call it and check the status codes, including the response without a session.
4. **Capture proof.** Report the artifacts with the change: the screenshots at both widths, the console errors you saw and the command output. Do not put them in the repo or in `.c-runtime/`.
5. **Compare and report.** State what you saw against what the change was meant to do, with the numbers. If you could not run the app, say so. Do not report a typecheck as a verification.

## Preconditions

- `./c up site` serves hackcollective.uk on :5173. `./c up work` serves app.hackcollective.uk (client and Worker) on :5281. `./c status` shows them. `./c quit` stops them.
- `./c up` runs under `op run --environment`. The Environment holds the Clerk dev keys, so the work app asks for a Clerk sign-in to the invite-only dev instance. `./c up work dev-member` skips the keys and opens signed in as the dev member, which is the way to drive the app without an invited account.
- `./c up work mock-data:empty` or `./c up work mock-data:full` resets the local work data first.
- Locate an element by its role and its label (`getByRole`, `getByLabel`). StyleX class names are hashes that change on each build, so never select by a class.
- Run scripts from the scratchpad, not from the repo.

## Proof bar

- Drive the app through the visible UI, the keyboard and the nav, on a fresh `./c up`. Read DOM state only after the user path ran. A capture from an old build is not evidence.
- Read the map of each feature the change touches. Exercise each reachable entry point and the success, cancel, error, empty and persistence paths the change can affect.
- Show the trigger and the stable end state in the same capture, at 1440px and at 390px.
- Check side effects, not only pixels: the network request and its response, a reload, the stored row.
- On the landing, also check reduced motion, one `h1`, no horizontal overflow and that every external link opens its real target.

## Skip reporting

For each path you cannot reach on a local run:

1. Name the path.
2. Say what blocks it: a credential, a quota, the data or the device.
3. Cover the closest real path that remains, and say which one.

Report the skips next to the proof. A silent skip is a false claim.

## Feature map contracts

There are two contracts, one for each surface. `./c check structure` enforces both.

A site feature map (`src/features/<name>/feature-map.md`) has these H2 sections: Sub-features, How to get to it, Gotchas and Verify.

A Work feature map (`internal/work/features/<name>/feature-map.md`) has these four H2 sections, in this order (`web-feature-map-sections`):

1. `## Sub-features`: one bullet per behaviour, as `name: what a user does and sees`.
2. `## How to get to it (user POV)`: the route, the nav item or the row that opens it, then the numbered user path.
3. `## Driving it with agent-browser`: the locators (role, label, text) and the steps a stranger can follow cold, ending in the 1440px and 390px screenshots.
4. `## Gotchas`: what usually lies: timers, polling, mock data against production data, state that only a finished run has. Each requirement that is not built yet is an "Open:" gotcha.

Keep entries at the level of behaviour. Do not list files: the feature folder shows them.

## Feature map index

- website (`src/features/website/feature-map.md`): the public landing page at `/`.
- Work features: one map per folder in `internal/work/features/<name>/feature-map.md`. The CRM modules are not built yet (`docs/work-platform/map.md`).

## Hard rules

- "It compiles" and "the gate passes" are not verification. Exercise the surface the user touches.
- Verify at the highest layer that changed. A UI change needs the UI driven. A Worker change needs scripted requests against the running Worker.
- Reproduce before you fix. Capture the failure, then the fix, then the absence of the failure.
- Feature maps are maintained infrastructure. When a flow changes, its `feature-map.md` changes in the same commit.
