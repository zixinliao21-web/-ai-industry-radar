# Repository Instructions

This repository is a lightweight static **VELNAR Research** product containing three independent research collections. Preserve separation of concerns between editorial data, collection renderers, browser-local state, and shared runtime infrastructure.

## Quick links

- [Industry Radar product contract](PRODUCT.md)
- [Industry Radar safe publishing procedure](docs/industry-radar-publishing.md)
- [Design language](DESIGN.md)
- [Multi-collection architecture](docs/multi-collection-architecture.md)
- [Consumer Radar content contract](docs/consumer-radar-contract.md)
- [Weekly Deep Read content contract](docs/deep-read-contract.md)
- [Design decision record](docs/plans/design-language.md)
- [Frontend design craft skill](.agents/skills/frontend-design/SKILL.md)

## Current architecture

### AI Industry Radar — mature existing collection

- `index.html` — directory / read-state interface
- `article.html` — long-form reading surface
- `news-index.json` — tiny canonical Industry Radar segment manifest
- `news-index-segments/segment-XXXX.json` — bounded compact metadata shards (max 8 items; sealed when full)
- `news-items/<id>.json` — canonical per-article Industry Radar records
- `news.json` — frozen legacy pre-split snapshot; do not append new publications
- `assets/research-discussion-bridge.js` — Industry notebook, excerpt capture, discussion handoff and strategic labels

### AI C 端产业雷达

- `consumer-radar.html` — Consumer Radar directory
- `consumer-article.html` — Consumer Radar article surface
- `consumer-radar.json` — canonical Consumer Radar published-content store
- `docs/consumer-radar-contract.md` — editorial/data contract

### Weekly Deep Read

- `deep-read.html` — curated reading directory
- `deep-read-article.html` — Deep Read reading-note surface
- `deep-read.json` — canonical Deep Read published-content store
- `docs/deep-read-contract.md` — editorial/data contract

### Shared implementation

- `assets/radar-runtime.css` / `assets/radar-runtime.js` — appearance, theme runtime, lightweight collection navigation and shared browser utilities
- `assets/collection-discussion-bridge.js` — Consumer / Deep Read notebook, excerpt capture and GPT discussion handoff
- `assets/share-export-fix.js` — existing Industry Share Card export path
- `service-worker.js` — PWA cache, navigation fallbacks and runtime enhancement loading

Read `docs/multi-collection-architecture.md` before changing collection boundaries, routing, caching or shared runtime behavior.

Do not introduce React, Next.js, a backend, a database, a CMS, or another framework merely to reduce static-file duplication. Current strategy is **isolation before abstraction**.

## Reserved VELNAR Home boundary

A future VELNAR Home/root gateway is intentionally reserved but is **not designed or implemented in the current phase**.

Do not replace the current root Industry Radar page or invent a company/research homepage without an explicit product decision.

## Product purpose

For Industry Radar, read `PRODUCT.md` before changing content behavior.

Industry Radar is **not an AI news site**. Its loop is:

```text
Observe → Understand → Question → Discuss → Update judgment
```

The website is the research / reading surface. GPT is the discussion / reasoning surface. Preserve that separation across all collections.

Consumer Radar and Weekly Deep Read have their own editorial contracts. Do not force them into the Industry Radar schema.

## Design changes

Before changing UI or motion:

1. Read `DESIGN.md`.
2. Follow `.agents/skills/frontend-design/SKILL.md` only where it does not conflict with `DESIGN.md`.
3. Preserve **Precision Sans** typography and **Precision Motion** budgets.
4. Treat the VELNAR blue-purple gradient as a scarce signature asset.
5. Keep article reading surfaces quieter than directory UI.
6. Preserve accessibility: semantic links, focus-visible states, reduced motion, normal browser link behavior.
7. New collections should reuse the established Radar visual language unless a later explicit design decision changes that direction.

## Editorial/content boundaries

Website implementation must not compress, rewrite or normalize research merely to fit UI.

### Industry Radar

Industry Radar uses segmented index V3. `news-index.json` is a tiny manifest; compact directory metadata lives in bounded `news-index-segments/segment-XXXX.json` shards; each full article lives in `news-items/<id>.json`. Full 8-item segments are sealed and immutable. `news.json` is a frozen legacy snapshot and must not receive new publications.

For every publication, follow `docs/industry-radar-publishing.md`: create the new per-item file first, update only the active bounded metadata segment, then update the tiny manifest using exact current blob SHAs. Never require a growing full-history index rewrite to add one signal.

For new single-artifact publications, `article_text` in the item file is the canonical website body and must preserve the research article delivered in chat. Structured fields may remain as secondary compatibility metadata.

Do not delete or mass-rewrite historical Industry items merely to restyle them. Factual corrections should be explicit rather than silently changing history.

### Consumer Radar

`consumer-radar.json` remains canonical.

Do not manufacture `S/A/B` grades or remap Consumer `kind` values into Industry grades. Preserve the Consumer contract's separation of Fact, User Evidence, Inference, Prediction and Hype / Uncertainty.

### Weekly Deep Read

`deep-read.json` remains canonical.

Deep Read is not a Radar feed. Do not add Radar grades or Radar-specific fields merely to make renderers look uniform. Preserve original-source metadata and access status honestly.

### Cross-collection rule

Routine publishing in one collection must not modify the other collections' canonical data or website implementation.

## Browser-local state

Read state, notes, excerpts, discussion-thread settings and appearance are browser-local. Never write them into any canonical JSON file, GitHub content commit, or server-side storage.

### Industry Radar

```text
ai-industry-radar-read-v1
ai-industry-radar-last-opened-v1
ai-industry-radar-return-scroll-v1
velnar-radar-notes-v1
velnar-radar-discussion-thread-v1
```

### Consumer Radar

```text
velnar-consumer-radar-read-v1
velnar-consumer-radar-last-opened-v1
velnar-consumer-radar-return-scroll-v1
velnar-consumer-radar-notes-v1
velnar-consumer-radar-discussion-thread-v1
```

### Weekly Deep Read

```text
velnar-deep-read-read-v1
velnar-deep-read-return-scroll-v1
velnar-deep-read-notes-v1
velnar-deep-read-discussion-thread-v1
```

### Shared appearance

```text
velnar-radar-theme-v1
```

Storage failures must not break primary reading.

## Research → Discussion Bridge

Preserve these behaviors where a collection supports them:

- article notebook control is icon-first
- selected article text can be captured through the small notebook-style action
- notes and excerpts auto-save locally per article
- directory may show a small notebook marker for articles with local notes
- **讨论** builds a collection-appropriate Discussion Packet, copies it, then opens the configured ChatGPT thread or ChatGPT home as fallback
- the bridge remains lightweight; do not turn the website into a chat app or general PKM system

Do not reintroduce an observer that repeatedly rewrites article DOM labels. A previous self-triggering `MutationObserver` caused the article page to freeze.

## PWA / Service Worker rules

`service-worker.js` must preserve independent navigation fallbacks for all six collection surfaces:

```text
/                       → index.html
/article.html           → article.html
/consumer-radar.html    → consumer-radar.html
/consumer-article.html  → consumer-article.html
/deep-read.html         → deep-read.html
/deep-read-article.html → deep-read-article.html
```

These canonical content stores remain **network-first with cached fallback**:

```text
news-index.json
news-index-segments/segment-XXXX.json
consumer-radar.json
deep-read.json
```

Do not revert them to long-lived cache-first behavior.

Frequently changed runtime/discussion scripts should also avoid stale-cache lock-in.

## Safe change rule

For UI-only work:

- do not alter canonical research content
- do not change scanning/recommendation cadence or notification behavior
- do not change local-storage schemas without an explicit migration
- do not collapse three editorial schemas into one generic schema

For content-only work:

- modify only the owning collection's canonical JSON (and its content contract when genuinely necessary)
- do not restyle HTML or edit PWA/runtime files as part of routine publication

For shared runtime work:

- verify Industry Radar behavior first because it is the mature baseline
- verify Consumer and Deep Read desktop/mobile, light/dark/system, read state, notes and navigation
- keep commits focused so regressions are easy to isolate and revert
