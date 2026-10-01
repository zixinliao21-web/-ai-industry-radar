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
