# Industry Radar Autonomous Publisher

Status: active infrastructure contract

## Purpose

Keep the existing product behavior fully autonomous:

```text
scheduled scan
→ web research
→ S/A/B editorial decision
→ canonical article generation
→ atomic Git publication candidate
→ existing Content Validation
→ existing Safe Pages Deploy
→ live verification
```

The website remains the reading surface and GPT remains the discussion surface. There is no owner approval step in routine Industry Radar publication.

## Execution boundary

Production Git mutation is owned by GitHub Actions, not by a ChatGPT scheduled automation. Scheduled ChatGPT execution may be useful for discussion or monitoring, but it must not be the canonical Industry publisher because its connector mutation permissions are not a stable production contract.

`.github/workflows/industry-radar-publisher.yml` is the autonomous scheduler/publisher. `scripts/run-industry-radar.js` is the deterministic publisher implementation plus the bounded AI research call.

## Research model

The workflow calls the OpenAI Responses API with web search and Structured Outputs. The API credential is supplied only through the GitHub Actions secret `OPENAI_API_KEY`; it must never be committed to the repository. `OPENAI_RADAR_MODEL` may be supplied as a GitHub Actions repository variable; otherwise the script uses its documented default.

The model decides what is worth retaining and produces the canonical article. Deterministic code owns storage shape, IDs, segment rollover, deduplication guards and file mutation.

## Atomic publication

The research script changes the workflow checkout only. It does not call the GitHub Contents API and does not push files one by one.

For a qualifying scan, all new `news-items/<id>.json` files, the active/new bounded segment, and `news-index.json` are staged into one local Git commit. Before push, the workflow:

1. runs canonical/runtime validation;
2. runs publication change-scope validation;
3. runs history validation;
4. re-fetches `origin/main`;
5. pushes only when the recorded base is still current.

A concurrent change makes the candidate stale. The workflow does not force the ref; it leaves the candidate unpushed and lets the next scheduled run rebuild against the new main.

## Production release

The autonomous publisher only creates a candidate on `main`. It does not bypass the existing release gate.

GitHub suppresses ordinary workflow triggers for commits pushed with the built-in `GITHUB_TOKEN`. Therefore, after an autonomous atomic push, the publisher explicitly dispatches `VELNAR Content Validation` on `main`. That dispatched validation is treated as a normal release candidate and may trigger Safe Pages Deploy only after it succeeds.

The existing chain remains authoritative:

```text
VELNAR Content Validation
→ VELNAR Safe Pages Deploy
→ live-site verification
→ VELNAR Research Health Audit
```

A publication is live only after that chain succeeds for the exact candidate SHA.

## No-signal behavior

There is no publication quota. If web research finds no genuinely useful new S/A/B signal after deduplication, the workflow exits without a Git commit.

## Failure behavior

- Missing `OPENAI_API_KEY`: scheduled/manual production run is skipped before research; no repository mutation occurs.
- OpenAI/web research failure: no repository mutation occurs.
- Invalid model output: no repository mutation occurs.
- Repository contract drift: self-test fails rather than guessing a new storage shape.
- Validation failure: candidate remains local and is not pushed.
- `main` race: candidate is not pushed; next run rebuilds.
- Production validation/deploy failure after push: existing release gate keeps the previous successful Pages artifact live.

## Legacy ChatGPT automation

Once this GitHub-native publisher has completed a real scheduled production cycle successfully, the old `AI产业机会雷达` ChatGPT automation should be disabled to prevent duplicate scans and repeated connector-write blockers. Do not disable it before the GitHub-native research credential and first live cycle are verified.
