# VELNAR Research Publishing System V1

Status: Phase 1 active

## Goal

Prevent partial content releases from breaking the Research website.

The website remains a static research product. This layer only adds release safety.

## Release principle

```text
Research content
      |
      v
Canonical data files
      |
      v
Validation
      |
      v
Release
      |
      v
Website
```

## Phase 1 validator

`scripts/validate-publish.js` is a read-only safety check.

It validates:

- Industry Radar segmented index counts
- duplicate article IDs
- Consumer verbatim articles have canonical body content
- Weekly Deep Read verbatim articles have canonical body content

The validator does not modify data.

## Future phases

Phase 2:

- draft / published separation
- release artifacts
- rollback snapshots

Phase 3:

- health monitoring
- publication status dashboard

## Boundary

This system must not change:

- research conclusions
- collection editorial schemas
- local browser state
- website visual design
