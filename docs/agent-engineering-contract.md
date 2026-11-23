# Agent Engineering — Research & Publishing Contract V1.0 (Candidate)

Independent fourth first-level collection within VELNAR Research. Shares the existing Content Validation → Publication Promoter → Safe Pages Deploy → exact-SHA live verification infrastructure. No second deployment system.

## Editorial purpose

Production engineering of reliable AI Agents: architecture, state and workflow, memory and context, knowledge and data, evaluation and reliability, development collaboration, and infrastructure.

## Grading

S: major verified architecture/reliability insight with actionable engineering impact; A: substantial evidence-backed implementation lesson; B: useful but narrower technical finding. Evidence maturity (HYPOTHESIS / EXPERIMENTAL / PRODUCTION_VALIDATED) is separate from editorial grade. No publication quota.

## Canonical storage

- `engineering-index.json` manifest
- `engineering-index-segments/segment-NNNN.json` immutable sealed segments
- `engineering-items/<id>.json` canonical body
- `agent-engineering.html` listing
- `engineering-article.html?id=<id>` article

All articles must include engineering problem, mechanism, failure modes, evidence versus inference, tradeoffs, verification approach, and applicability limits. An LLM output alone is not engineering proof. Never expose private customer data or credentials.

## Publishing invariants

Each candidate may modify canonical content of only one collection; runtime and canonical content must not mix in the same release. Existing items and sealed segments must be immutable; active segments append-only. Candidate branch `engineering/publish-*` must be explicitly supported by existing Promoter before publication. Deploy only validated exact SHA. Failed checks do not advance live content.

## Integration blockers

This feature branch adds frontend and initial canonical validator, but DOES NOT YET alter existing shared validation, Promoter, Service Worker, Pages release verification or global navigation. The branch must not be merged until these are implemented and tested.
