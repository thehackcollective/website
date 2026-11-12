# The review: one Claude code-review near the end of a PR, not Greptile

Status: accepted
Date: 2026-11-12
Scope: how a PR is reviewed before it merges, in this repo.
Decision:
1. One review agent, one review request. `./c review <PR>` posts one Claude code-review of the PR head on the PR: one `claude -p` session with the built-in code-review skill.
2. A PR merges only after a clean review. The agent that owns the PR reads the review and judges it. No script parses the review: a review is a probabilistic opinion, and a verdict regex would dress it up as a deterministic fact.
3. The review is one of the last steps of a PR, and it does not block the work. When the work of the PR is nearly done, push it and start `./c review` in the background. Keep working on the proof while it runs. When it ends, fix the real findings in one batch, push once, then run `./c merge`.
4. `./c merge <PR>` checks only facts: main is in the head and `./c check structure` passes on the head. A loosened rule only warns. There is no approval label or status (Louis, 2026-11-12: "i never really cared about the rules approved label anyway"). `greptile-score-min` is deleted from `base.rules.yaml`.
5. The review session reviews `PR.diff`, written from the merge base to the pinned head, inside a `git archive` export of the head with symlinks removed. It runs with no settings sources (Claude's built-in skills only, no personal skills, hooks or instructions), no MCP servers, an explicit `default` permission mode, and only Read, Grep and Glob inside the export, plus the Skill tool. It has no shell, no git, no `gh` token and no remote.
6. Known limits, accepted with the label gone: nothing checks that a review ran on the merged head, and a PR can change the gate code that `./c merge` runs on it. The review is where such a change gets read.
Rationale: Greptile and Codesmith are no longer available (Louis, 2026-11-12: "one unlucky thing is that greptile is no longer available at all", and "codesmith is also not available anymore as well, any refernece to it is also stale"). Louis, 2026-11-12: "claude has an internally built code-review skill. The script can be as simple as starting 1 claude programmatic sesion with the skill to review the PR or changes. I think all projects overcomplicated that process. 1 review agent 1 review request is fine". Louis, 2026-11-12: "merging needs a clean review, but since review are probablistic, we can ingrane a code review as amongst the last step in the SDLC, where agents will wait and check in with a spawned review agent non-block session that started when a chunk of change is near completition so that we get review statements soon right after all work from that PR is done, so we can quickly get review feedback, fix once, then merge". Louis, 2026-11-12: "we are regex parsing and turning a probabilistic process into a non-deterministic outcome too much".
Evidence: `scripts/c/review`; `scripts/c/merge`.
Exceptions: none.
Bad example: a merge gate that greps a verdict line out of model text; waiting idle for a review that was started only after the proof was done; a review round for each small fix.
Good example: push the nearly done PR, start `./c review 7` in the background, finish the proof, read the review, fix the real findings in one push, then `./c merge 7`.
Open decisions: none.
