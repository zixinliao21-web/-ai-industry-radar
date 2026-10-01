# VELNAR Research Release Protocol V1

Status: **active once GitHub Pages source is GitHub Actions**

## Invariant

Production may advance only to a commit for which **VELNAR Content Validation** completed successfully.

## Release sequence

```text
candidate commit on main
        ↓
canonical content validation
        ↓
runtime validation
        ↓
validation success
        ↓
safe Pages workflow receives exact validated SHA
        ↓
verify SHA is still current main
        ↓
generate release-status.json in deployment workspace
        ↓
upload immutable Pages artifact
        ↓
deploy
```

If validation fails, the candidate remains in Git history for diagnosis but is not a production release.

## Industry publication contract

Routine Industry publishing still follows `docs/industry-radar-publishing.md`:

1. create the per-item article first;
2. update only the active bounded metadata segment (or create the next segment);
3. update the tiny manifest last;
4. use exact current SHAs and reconcile races instead of overwriting.

The release gate is defense in depth. It does not justify unsafe publisher behavior.

## Release lock

`release-lock.json` must be `idle` for a production deployment.

Future publishers may use intermediate states such as `preparing` while assembling a release, but the final candidate commit must return the lock to `idle`. A non-idle lock fails validation and cannot deploy.

## Recoverable partial state

An Industry item file may temporarily exist without an index entry. The validator reports this as a warning and does not auto-publish it.

Index entries that point to missing or inconsistent canonical item files are fatal validation errors.

## Rollback

Git history is the canonical rollback source. Because Pages deploys immutable validated artifacts, production remains on the previous successful artifact when a candidate fails.

A manual rollback is performed by restoring a previously validated commit to `main`, after which it passes through the same validation/deployment gate.
