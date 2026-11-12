# The review gate: `./c review`, not Greptile

Status: accepted
Date: 2026-11-12
Scope: how a PR gets the review that `./c merge` reads, in this repo.
Decision: the gate follows cf0's Greptile-less gate of 2026-11-02 (`cf0.ai/docs/decisions/2026-11-02-claude-review-replaces-greptile.md`, as of `97e5718f9~1`).
1. Each PR gets one review of its final head. Write the whole batch first and push once. A second review is only for the batch of P1 fixes. `./c review` refuses a fourth review of a PR. Then cut the feature that keeps getting findings, or split the PR.
2. On a Mac with the `claude` CLI, `./c review <PR>` runs one Opus `claude -p` session of the PR head by default. `--sessions 2` or `3` splits the lenses: correctness and failure paths; the repo rules and the design rules; security, data and the user-visible result. Each session reads a `git archive` export of the head and the diff against the PR's base.
3. With no `claude` CLI, spawn one adversarial review agent (up to three), write the findings to a file (`- P1 path:line — problem` or `- P2 …`), and run `./c review <PR> --record <file>`.
4. Both paths post one PR comment with the findings and the marker `<!-- thc-review sha=<head> p1=<count> -->`.
5. `./c merge <PR>` reads the last marker of each comment by a repo owner, member, collaborator or bot. The review must be of the head, or of the head before clean merges of main, and must have no P1. `greptile-score-min` is deleted from `base.rules.yaml`.
6. P1 means that the change is wrong, unsafe or breaks something for a user. Each finding labelled P1 counts, in any list format. A P2 does not block; answer each P2 that you do not fix in the PR. To drop a false P1, record the checked findings with `- Dropped: path:line — reason` on the same head.
7. The `rules-approved` label stays for a loosened rule and for a change to the code that `./c merge` runs. Add it after the last `./c review` comment. A label older than that review does not count.
Rationale: Greptile and Codesmith are no longer available (Louis, 2026-11-12: "one unlucky thing is that greptile is no longer available at all", and "codesmith is also not available anymore as well, any refernece to it is also stale"). `./c merge` needs a review that a script can read and that the author cannot skip on the local path. cf0 ran this gate when Greptile stopped on 2026-11-02.
Evidence: `scripts/c/review`; `scripts/c/merge`; the jq marker filter tested on sample comments (an untrusted author is ignored, the last marker of a comment counts); the P1 label pattern tested on bullet, numbered, bold, quoted, dropped and inline findings.
Exceptions: none.
Bad example: merging because a PR "looked fine"; a review of an earlier head; a P1 answered only in chat.
Good example: push the final head, `./c review 7`, fix the P1 batch, push once, `./c review 7`, then `./c merge 7`.
Open decisions: none.
