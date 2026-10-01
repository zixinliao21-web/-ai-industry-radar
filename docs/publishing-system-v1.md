# VELNAR Research Publishing System V1

Status: **gate-ready**

## Goal

Prevent partial content releases from breaking the Research website while preserving the existing static HTML/CSS/JS product.

## Production rule

The production site must deploy only a commit that has passed both validators:

```text
push / PR
   ↓
scripts/validate-publish.js
   ↓
scripts/validate-runtime.js
   ↓
VELNAR Content Validation
   ↓ success only
VELNAR Safe Pages Deploy
   ↓
validated GitHub Pages artifact
```

A validation failure leaves the production site on the previous successful deployment.

## Validators

### Canonical content

`scripts/validate-publish.js` checks:

- Industry segmented-index schema and bounded segment rules
- manifest count = actual segment count
- duplicate Industry IDs
- every indexed Industry article file exists and matches its index identity
- canonical `article_text` exists when `body_format=article_text`
- Consumer V2 verbatim items contain `body_markdown`
- Deep Read published-verbatim items contain `content_markdown`
- duplicate IDs in Consumer / Deep Read
- production `release-lock.json` is idle

Recoverable orphan Industry item files are reported as warnings rather than automatically published.

### History integrity

`scripts/validate-history.js` compares a candidate release with its previous/base commit and blocks silent historical damage:

- Consumer historical IDs may not disappear and canonical `body_markdown` may not be silently rewritten.
- Industry and Deep Read sealed segments are byte-immutable.
- Previously active segmented indexes are append-only.
- Historical indexed IDs and canonical article bodies must remain present.
- Collection item counts may not decrease.

This protects against valid-looking but truncated JSON and accidental history rewrites.

For production pushes, history validation prefers the SHA recorded by the **currently live validated release** as its trusted history baseline. If that live metadata is temporarily unavailable, it falls back to the candidate's previous commit. Pull requests compare against their PR base. This prevents an undeployed/failed commit left on `main` from silently becoming the trusted historical baseline for a later candidate.

### Runtime

`scripts/validate-runtime.js` checks:

- shared JavaScript syntax
- inline JavaScript syntax on all six surfaces
- required shared runtime references
- Service Worker collection routes and canonical data references
- web manifest JSON validity

## Release health

`scripts/generate-release-status.js` generates `release-status.json` inside the deployment workspace after validation. It is release metadata, not canonical research content.

The generated snapshot records:

- validated commit SHA
- collection item counts
- collection last-update values
- Industry storage / segment count
- validators used

The generator does not commit or rewrite research content.

## Atomic content transactions

For segmented collections (Industry Radar and Weekly Deep Read), the preferred publisher writes the new canonical item, bounded segment mutation/new segment, and tiny manifest as **one Git tree + one commit + one fast-forward ref update**.

The publisher must record the current `main` SHA before preparing the tree and re-check it immediately before moving the ref. A race invalidates the prepared transaction and requires a rebuild against the new latest state.

Staged multi-commit publishing remains a compatibility fallback only. The release gate can keep partial candidates off production, but atomic publication is preferred because it also keeps `main` itself internally complete.

## Concurrency / race handling

`VELNAR Safe Pages Deploy` deploys the exact commit that passed validation and verifies that commit is still the latest `main` before deployment. A slower validation for an older commit cannot overwrite a newer release.

## GitHub Pages setting

The repository must use **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Legacy “Deploy from a branch” starts Pages deployment before the validation workflow and therefore cannot provide a release gate.

## Boundaries

This safety layer does not:

- rewrite research conclusions
- unify the three editorial schemas
- introduce a backend, CMS or database
- move browser-local state into canonical content
- change website UI


## Health audit

`.github/workflows/research-health.yml` runs once per day and may also be started manually. It:

- re-runs canonical content validation;
- re-runs runtime validation;
- records current item counts and last content-update ages;
- checks all six production surfaces;
- checks the live `release-status.json` against the deployed canonical stores.

Content age is informational. The health workflow does not invent research cadence or publish content.

The safe deployment workflow also performs a post-deploy live-site check against the exact validated commit.
