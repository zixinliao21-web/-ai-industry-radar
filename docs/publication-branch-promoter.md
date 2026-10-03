# Publication Branch Promoter

GPT retains all research, selection and article generation. No model calls or API keys are used by GitHub.

Create a single atomic commit whose sole parent is the current `main` SHA, then create a new branch:

| Collection | Allowed prefix | Allowed files |
| --- | --- | --- |
| Industry | `radar/publish-` | `news-index.json`, `news-index-segments/segment-NNNN.json`, `news-items/<id>.json` |
| Consumer | `consumer/publish-` | `consumer-radar.json` |
| Deep Read | `deep-read/publish-` | `deep-read-index.json`, `deep-read-index-segments/segment-NNNN.json`, `deep-read-items/<id>.json` |

Suffixes use lowercase letters, digits and hyphens. Only regular non-executable files may be added or modified. Deletions, renames, empty commits, merges, infrastructure edits and mixed collections are rejected.

The `create` signal workflow has read-only permissions and executes no candidate files. Its successful completion triggers the privileged `workflow_run` Promoter from the default branch. The Promoter binds the branch to the signal's exact SHA, checks out trusted main, proves the candidate parent and scope, then runs the unchanged content, scope, history (both main and live production baseline), runtime and idle-lock gates. It checks both remote refs again before promotion. The final update uses an exact main-SHA lease after proving the candidate is a direct child: a compare-and-swap fast-forward, never an overwrite of concurrent history. Branches remain for diagnosis. The privileged workflow never consumes signal artifacts or executes candidate workflow code.

All failures before promotion leave main and production unchanged. Rebuild candidates on a newer main; do not rebase automatically. Retry an existing unchanged branch via the Promoter's manual workflow on main. Branch updates alone do not trigger promotion.

After promotion, explicitly dispatch Content Validation on main with the promoted SHA and parent. Dispatch validation verifies both identities and runs every existing gate. Its final step explicitly dispatches Safe Pages Deploy with the exact SHA and validation run ID. Before deployment, Safe Pages verifies through GitHub's API that this main Content Validation run completed successfully for that SHA; it re-runs every existing deployment gate, latest-main check and post-deploy live check. Only after live verification does it dispatch Research Health Audit for the exact deployed SHA. The existing push-driven chain remains unchanged. Explicit handoffs avoid relying on downstream workflow_run events for GITHUB_TOKEN-originated runs, which did not fire in the integration test.

If dispatch fails after the atomic update, main already contains the validated candidate, production remains on its previous artifact, and the run fails visibly. Recover by manually dispatching Content Validation on main with the reported candidate and parent SHAs. Downstream deployment failures likewise preserve the previous artifact; no automatic rollback rewrites main.

Repository branch protection is respected. No PAT, protection bypass, approval removal or new secret is configured. If branch rules deny promotion, the candidate is retained and the run fails.

Run `node scripts/test-publication-promoter.js` for isolated safety fixtures. For a non-mutating integration check, set `PROMOTION_DRY_RUN=true` and `PUBLICATION_BRANCH` in a trusted main checkout. Live completion requires successful promoter, exact-SHA Content Validation, Safe Pages Deploy/live verification and Health Audit runs.
