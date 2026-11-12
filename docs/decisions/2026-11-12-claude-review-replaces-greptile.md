# The review gate: one `./c review`, not Greptile

Status: accepted
Date: 2026-11-12
Scope: how a PR gets the review that `./c merge` reads, in this repo.
Decision:
1. One review agent, one review request. `./c review <PR>` starts one `claude -p` session with Claude's built-in code-review skill (`/code-review <PR>`) and posts its result on the PR, marked with the reviewed head (`<!-- thc-review sha=<head> -->`).
2. Push the whole batch once, run `./c review` once, fix what is real in one batch, push once and run it again.
3. `./c merge <PR>` needs a `./c review` comment by a repo owner, member or collaborator on the head, or on the head before clean merges of main. `greptile-score-min` is deleted from `base.rules.yaml`.
4. The `rules-approved` label stays for a loosened rule and for a change to the code that `./c merge` runs. Add it after the last `./c review` comment, and after its last edit.
Rationale: Greptile and Codesmith are no longer available (Louis, 2026-11-12: "one unlucky thing is that greptile is no longer available at all", and "codesmith is also not available anymore as well, any refernece to it is also stale"). Louis, 2026-11-12: "claude has an internally built code-review skill. The script can be as simple as starting 1 claude programmatic sesion with the skill to review the PR or changes. I think all projects overcomplicated that process. 1 review agent 1 review request is fine".
Evidence: `scripts/c/review`; `scripts/c/merge`.
Exceptions: none.
Bad example: merging a head that `./c review` never saw; several review rounds for each small fix.
Good example: push the final head, `./c review 7`, fix the real findings, push once, `./c review 7`, then `./c merge 7`.
Open decisions: none.
