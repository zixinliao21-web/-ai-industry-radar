# Weekly Deep Read — Content Contract

Status: Active  
Storage schema: segmented index V3  
Legacy snapshot: `deep-read.json` (frozen)

## 1. Product identity

Weekly Deep Read is a long-term curated reading product. It is not a news stream and must not regenerate shorter website summaries from finished research.

The authoritative artifact is the finished Deep Read produced in the owning ChatGPT research thread.

```text
ChatGPT selects and reads a source
→ writes the finished Deep Read
→ freezes that exact artifact
→ stores one complete item file
→ updates bounded index metadata
→ validated production deployment
```

There is no second editorial rewrite between ChatGPT and the website.

## 2. Canonical storage

Active storage is:

```text
deep-read-index.json
deep-read-index-segments/segment-XXXX.json
deep-read-items/<id>.json
```

- `deep-read-index.json` is a tiny manifest only.
- Index segments contain bounded directory/navigation metadata, maximum 8 items each.
- Full 8-item segments are sealed and immutable.
- `deep-read-items/<id>.json` is the canonical complete record for one Deep Read.
- `deep-read.json` is the frozen V2 legacy snapshot and must not receive new publications.

## 3. Verbatim publishing rule

For a published item, `content_markdown` in the per-item file is the canonical body. Preserve the finished Deep Read at full length, including headings, paragraphs, emphasis, quotations, lists, code/text blocks, examples, source link, analysis and concluding judgment.

Do not compress the body into `why_read`, `core_argument`, `key_takeaways`, a card summary, or a Radar-style memo. Mechanical adaptation of ChatGPT-only rich links is allowed only when visible prose and reasoning remain unchanged.

Historical legacy items without a recovered canonical body may remain explicitly marked `legacy_summary_do_not_render_as_body`; the old summary must not masquerade as the article.

## 4. Compact index metadata

Segments may contain metadata needed for the directory and archive navigation, including:

- `id`
- `added_date`
- `title`
- author/publication metadata
- `source_url`
- `original_publish_date`
- `estimated_reading_time`
- `topic`
- `themes`
- `access`
- `content_status`

Never put `content_markdown` or other full long-form bodies in the manifest or index segments.

## 5. Safe publication order

For one new Deep Read:

1. Read the complete current `deep-read-index.json` and record its exact blob SHA, item count, segment size and descriptors.
2. Check whether `deep-read-items/<id>.json` already exists. Reconcile rather than duplicate.
3. Read the current active segment completely.
4. Finish and freeze the canonical Deep Read.
5. Create `deep-read-items/<id>.json` first.
6. Append compact metadata to the active segment using its exact SHA; if it is full/sealed, create the next sequential segment.
7. Update the tiny manifest last using its exact current SHA: increment item count exactly once, update `updated_at`, and update/append the active segment descriptor.
8. On any SHA race, re-read and reconcile. Never overwrite concurrent history.
9. Verify the item exists exactly once, the index entry exists exactly once, counts agree, and sealed historical segments did not change.
10. Production is not considered live until `VELNAR Content Validation` and `VELNAR Safe Pages Deploy` succeed for the candidate SHA.

A recoverable orphan item is safer than rewriting history. Do not auto-publish an orphan merely because its file exists.

## 6. Separation from other collections

Industry Radar, Consumer Radar and Weekly Deep Read retain independent editorial schemas. Routine Deep Read publication must not modify Industry, Consumer, HTML/CSS/JS/PWA, or browser-local state.

## 7. Selection scope

The established scope remains AI/Agent and technological innovation; entrepreneurship, strategy and organizational management; market analysis and business models; social/cultural/long-term trends; early-stage startup building; business/company cases; teams and leadership.

The Tuesday / Thursday / Saturday cadence belongs to ChatGPT automation and must not be copied into article data.

## 8. Website contract

The directory reads compact V3 index metadata. The article page fetches only the selected `deep-read-items/<id>.json` and renders `content_markdown` as the complete article body. It must not truncate, summarize, or remap that body into Radar sections.
