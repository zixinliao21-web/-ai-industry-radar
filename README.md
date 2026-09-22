# VELNAR Research

A lightweight static research product for maintaining several independent VELNAR research collections while keeping research/reading on the website and deeper discussion in GPT.

## Live site

https://zixinliao21-web.github.io/-ai-industry-radar/

## Current collections

### AI Industry Radar

- `index.html` — directory / unread-read interface
- `article.html` — long-form article reader
- `news-index.json` — tiny Industry Radar segmented-index manifest
- `news-index-segments/segment-XXXX.json` — bounded compact directory metadata shards
- `news-items/<id>.json` — canonical per-article Industry Radar records
- `news.json` — frozen legacy pre-split snapshot

### AI C 端产业雷达

- `consumer-radar.html` — Consumer AI directory
- `consumer-article.html` — Consumer AI research reader
- `consumer-radar.json` — canonical Consumer Radar archive
- `docs/consumer-radar-contract.md` — content contract

### Weekly Deep Read

- `deep-read.html` — curated long-read directory
- `deep-read-article.html` — Deep Read reading-note surface
- `deep-read.json` — canonical Deep Read archive
- `docs/deep-read-contract.md` — content contract

## Shared infrastructure

- `assets/radar-runtime.css` / `assets/radar-runtime.js` — shared appearance, theme and collection navigation
- `assets/research-discussion-bridge.js` — Industry Radar notebook / GPT bridge
- `assets/collection-discussion-bridge.js` — Consumer Radar and Deep Read notebook / GPT bridge
- `service-worker.js` — PWA cache, multi-collection navigation fallbacks and network-first content updates
- `assets/velnar-symbol.svg` — VELNAR brand symbol

## Architecture contract

Read [`docs/multi-collection-architecture.md`](docs/multi-collection-architecture.md) before changing collection boundaries, routing, service-worker behavior or shared runtime infrastructure.

The three collections deliberately **do not share one editorial schema**.

Current implementation strategy is **isolation before abstraction**: separate static renderers are acceptable while the collections stabilize.

A future VELNAR Home is reserved but is not implemented in the current phase.

## Design direction

**Precision Editorial × Quiet Technology**

Before changing UI, read [`DESIGN.md`](DESIGN.md). New collection surfaces currently reuse the established Radar design language rather than introducing a separate visual system.
