# Weekly Deep Read — Content Contract

Status: Active  
Schema: `deep-read.json` V2.0  
Canonical content store: `deep-read.json`

## 1. Product identity

Weekly Deep Read is a long-term curated reading product.

It is not a news stream, not an Intelligence Radar tag, and not a place to regenerate shorter summaries for the website.

The authoritative artifact is the **finished Deep Read produced in this ChatGPT thread**.

The publishing flow is:

```text
ChatGPT selects and reads a source
→ ChatGPT writes the finished Deep Read
→ that finished Deep Read becomes the publication artifact
→ store it in deep-read.json
→ website renders that artifact
```

There is no second editorial rewrite between ChatGPT and the website.

## 2. Verbatim publishing rule

For a published item, `content_markdown` is the canonical body.

It must preserve the finished Deep Read from this thread at full length, including:

- title and section hierarchy;
- paragraphs and emphasis;
- quoted framing;
- code / text blocks;
- examples and analogies;
- the original-source link;
- analysis, interpretation and concluding judgment contained in that finished Deep Read.

Do not compress the body into `why_read`, `core_argument`, `key_takeaways`, a card summary, or a Radar-style memo.

Do not re-search an already finished Deep Read merely to create a different web version.

Do not silently rewrite or “improve” historical prose during publishing.

If a factual correction becomes necessary later, handle it explicitly as correction metadata or a new editorial decision; do not silently mutate the historical artifact.

Mechanical adaptation needed to make a ChatGPT rich link clickable on the website is allowed, but it must not alter the visible prose or argument.

## 3. Metadata is secondary

Metadata exists only for indexing, sorting, filtering and source access.

A minimal item is:

```json
{
  "id": "DR-YYYY-NNN",
  "added_date": "YYYY-MM-DD",
  "title": "string",
  "author": ["string"],
  "publication": "string",
  "source_url": "https://...",
  "original_publish_date": "YYYY-MM-DD | YYYY-MM | YYYY",
  "estimated_reading_time": "string",
  "themes": ["string"],
  "content_markdown": "full finished Deep Read"
}
```

Fields may be omitted when they were not known in the original artifact and are not needed for indexing.

The website must not synthesize the article body from metadata.

## 4. Separation from the two Radar collections

- `news.json` remains VELNAR Intelligence Radar.
- `consumer-radar.json` remains AI C 端产业雷达.
- `deep-read.json` remains Weekly Deep Read.

The three collections do not share an editorial schema.

Radar asks what changed in the world and how it changes our map.

Deep Read preserves a finished reading artifact and the reasoning that made the source worth reading.

Never write Deep Read content into either Radar collection.

## 5. Selection scope

The existing scope remains:

- AI / Agent and technological innovation
- entrepreneurship, strategy and organizational management
- market analysis and business models
- social, cultural and long-term trends
- early-stage startup building
- company / business case studies
- teams and leadership qualities

The Tuesday / Thursday / Saturday cadence belongs to ChatGPT automation and must not be copied into article data.

## 6. Historical migration rule

Past Deep Reads already written in this thread should be migrated from the **actual finished assistant response**, not reconstructed from a later summary.

If a prior website entry contains only a short structured synopsis, that synopsis is not the canonical body and should be replaced or superseded by the original full Deep Read.

Repeated recommendations of the same source do not need duplicate website entries. Choose the intended finished artifact and preserve that artifact verbatim.

## 7. Website-team contract

The VELNAR Research website thread owns rendering and UI.

For Weekly Deep Read it should:

1. read `deep-read.json`;
2. use metadata for directory/index surfaces;
3. render `content_markdown` as the full article body;
4. keep `source_url` accessible as the original-source link;
5. not truncate, summarize, or map the body into Radar sections unless explicitly requested.

This content thread owns selection and the full Deep Read artifact. The website thread owns presentation only.
