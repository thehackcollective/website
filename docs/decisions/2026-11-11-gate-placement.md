# The gate: where `./c check` runs, and how a change reaches main

Status: accepted
Date: 2026-11-11
Scope: every change to the repo: the public site, Work, the kit, the tokens, the docs and the toolchain.
Decision: the gate runs as in elearning (`elearning/docs/decisions/2026-11-09-merge-through-c-merge.md`, ported from `cf0.ai/docs/decisions/2026-10-30-pr-only-shipping.md`).
1. `build` is `vite build` only. It does not run the check. A deploy does not run the check either. The gate sits on the commit, the push and the merge instead.
2. The pre-commit hook (`scripts/git-hooks/pre-commit`) runs `./c check --staged`. Each hook step whose path pattern matches a staged path runs on a copy of the staged files. `./c pre-commit` runs the same gate by hand.
3. The pre-push hook (`scripts/git-hooks/pre-push`) refuses a push to `main`. For every other push it runs the full `./c check`.
4. `./c merge <PR>` is the only way into main. It brings main into the branch if the head does not have it. It waits for Greptile Review on the head, and the check must pass with a score of at least `greptile-score-min` (5, in `base.rules.yaml`). It then runs `./c check structure` on the head against `origin/main`, and squash-merges, pinned to that head. A red step stops the merge.
5. A loosened rule, or a change to `c`, `scripts/c`, the hooks or a guarded config, needs an Opus review after the last push. Then the orchestrator adds the `rules-approved` label, after Greptile's review of the head. Without the label, `./c merge` stops. The loosening goes in its own PR, with each loosened rule and its reason in the PR description.
6. `./c hooks` points git at `scripts/git-hooks`.
7. Production ships through Workers Builds on a merge to main, with `cf deploy` (`docs/decisions/2026-11-12-cf-cli.md`). Nobody deploys by hand.
Rationale: Louis set the gate placement on 2026-11-11 to match elearning. The check runs before code leaves the machine, not in the build. The hooks catch a red change before it leaves the machine, and `./c merge` catches a loosening and a red structure check before it reaches main.
Evidence: `docs/plans/2026-11-11-cf0-port.md` (Progress, Louis 2026-11-11: "`build` = `vite build`, with `./c check --staged` in pre-commit, the full check in pre-push, and `./c merge` refusing red"); `scripts/git-hooks/pre-commit`; `scripts/git-hooks/pre-push`; `scripts/c/merge`; `package.json` (`build`).
Exceptions: none. A merge in the GitHub UI or with `gh pr merge` skips `./c merge`, and a commit with `--no-verify` skips the hook. Both are forbidden by agreement (`AGENTS.md`).
Bad example: `git commit --no-verify`; `gh pr merge 12 --squash`; `git push origin main`; a PR that widens an `exempt` glob together with a feature change.
Good example: commit on a branch, push it, open a PR with `gh pr create`, then run `./c merge <PR>`.
Open decisions: none.
