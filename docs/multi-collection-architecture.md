# VELNAR Research — Multi-Collection Architecture

Status: **active implementation baseline**  
Date: **2026-09-18**

## Purpose

This repository now hosts three independent research collections inside one static VELNAR Research surface.

The collections share visual/runtime infrastructure where safe, but **do not share one editorial schema**.

```text
VELNAR Research
├─ AI Industry Radar
├─ AI C 端产业雷达
└─ Weekly Deep Read
```

A future **VELNAR Home** is intentionally reserved but is **not implemented or designed in this phase**. Do not replace the current root page with a speculative company/research homepage without an explicit product decision.

## Collection boundaries

### 1. AI Industry Radar

Existing mature collection. Preserve behavior unless a change explicitly targets it.

```text
index.html
article.html
news.json
```

Canonical content: `news.json`.

Editorial/product contract: `PRODUCT.md`.

### 2. AI C 端产业雷达

Independent Consumer AI / Personal Agent research collection.

```text
consumer-radar.html
consumer-article.html
consumer-radar.json
```

Canonical content: `consumer-radar.json`.

Content contract: `docs/consumer-radar-contract.md`.

Do not manufacture Industry Radar grades for Consumer items. Its `kind` values remain their own semantics:

- `baseline`
- `structural_signal`
- `category_update`

### 3. Weekly Deep Read

Independent long-form reading collection.

```text
deep-read.html
deep-read-article.html
deep-read.json
```

Canonical content: `deep-read.json`.

Content contract: `docs/deep-read-contract.md`.

Deep Read is not a Radar feed. Do not add S/A/B grades or Radar-specific research fields to make renderers look uniform.

## Shared implementation layer

The repository remains static HTML/CSS/JS.

Shared assets include:

```text
assets/radar-runtime.css
assets/radar-runtime.js
assets/velnar-symbol.svg
service-worker.js
```

`assets/radar-runtime.js` owns shared appearance behavior and the lightweight collection navigation. The three collections share the same browser-local appearance key:

```text
velnar-radar-theme-v1
```

Industry Radar keeps its existing Discussion Bridge:

```text
assets/research-discussion-bridge.js
```

Consumer Radar and Weekly Deep Read use:

```text
assets/collection-discussion-bridge.js
```

The newer bridge deliberately does **not** rewrite article section labels or observe article DOM mutations for strategic-label updates. This avoids reintroducing the previous MutationObserver self-trigger regression.

## Browser-local state

Never write read state, notes, excerpts, discussion thread URLs, or theme settings into the JSON content stores.

### Industry Radar

Existing keys remain unchanged:

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

Shared appearance:

```text
velnar-radar-theme-v1
```

## Service Worker contract

`service-worker.js` must treat each collection route independently.

Navigation fallback map:

```text
/                       → index.html
/article.html           → article.html
/consumer-radar.html    → consumer-radar.html
/consumer-article.html  → consumer-article.html
/deep-read.html         → deep-read.html
/deep-read-article.html → deep-read-article.html
```

Canonical JSON files are network-first with cached fallback:

```text
news.json
consumer-radar.json
deep-read.json
```

Do not revert these data files to long-lived cache-first behavior; research threads update them independently.

Discussion/runtime scripts that change frequently should remain network-first with cached fallback.

## Change discipline

### Website/UI thread may

- modify HTML/CSS/JS/PWA/navigation/runtime behavior;
- add rendering support for existing canonical fields;
- improve shared reading/notebook/discussion infrastructure;
- update service-worker routing/caching.

It must not silently rewrite research conclusions or normalize the three editorial schemas into one generic schema.

### Industry research thread may

- maintain `news.json` according to the Industry Radar contract.

It should not modify Consumer/Deep Read data or website implementation as part of routine publishing.

### Consumer research thread may

- maintain `consumer-radar.json` according to `docs/consumer-radar-contract.md`.

It should not modify `news.json`, `deep-read.json`, or website implementation as part of routine publishing.

### Weekly Deep Read thread may

- maintain `deep-read.json` according to `docs/deep-read-contract.md`.

It should not modify the two Radar data stores or website implementation as part of routine publishing.

## Current engineering strategy

Prefer **isolation before abstraction**.

The new collections intentionally have separate directory/article renderers while their schemas and workflows stabilize. Some duplicate static HTML/CSS/JS is acceptable at this stage.

Do not create a universal renderer, framework migration, backend CMS, database, React/Next.js app, or cross-collection schema merely to remove duplication.

Extract a shared implementation only after repeated stable behavior proves that the abstraction represents the same product responsibility rather than superficially similar markup.
