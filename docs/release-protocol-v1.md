# VELNAR Research Release Protocol V1

## Purpose

Prevent partial content publication from reaching the production website.

## Release states

```text
idle
 |
 v
preparing
 |
 v
validated
 |
 v
released
```

A failed validation must not become a production release.

## Transaction rule

A release must update all required artifacts together:

- canonical content
- collection index
- runtime manifest
- release status

If one artifact is incomplete, the release remains unreleased and requires reconciliation.

## Current phase

Foundation only. This document does not change existing website behavior.
