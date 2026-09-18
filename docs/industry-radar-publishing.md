# AI Industry Radar — Safe Publishing Procedure

Status: Active  
Storage schema: split archive V2

The Industry Radar no longer appends full articles to one large `news.json`.

## Canonical storage

```text
news-index.json
news-items/<id>.json
```

- `news-index.json` is the compact directory / navigation manifest.
- `news-items/<id>.json` is the canonical full record for one Radar article.
- `news.json` is a frozen legacy snapshot of the pre-split archive. Do not append new items to it and do not use it as the routine publishing target.

## Safe publication workflow

For each genuinely new Radar signal:

1. Read the complete current `news-index.json`.
2. Record its exact blob SHA, complete ID set and item count.
3. Deduplicate against that compact index.
4. Finish the canonical research article in ChatGPT first.
5. Create `news-items/<id>.json` containing the full record.
6. For new single-artifact publications, `article_text` is the canonical body and must preserve the exact research article delivered in chat, except JSON escaping.
7. Only after the item file exists, append compact metadata to `news-index.json` and update `updated_at`.
8. Update the index with its exact current blob SHA. Concurrent changes must fail rather than overwrite another publication.
9. Re-read the index and the new item and verify the new ID exists exactly once, every old ID remains, the count increased exactly as intended, IDs match, and `article_text` matches the frozen chat article.

## Compact index entry

```json
{
  "id": "YYYY-MM-DD-A1",
  "date": "YYYY-MM-DD",
  "grade": "A",
  "title": "...",
  "themes": ["..."],
  "deck": "...",
  "body_format": "article_text"
}
```

Do not put full bodies, sources, Fact/Inference sections or browser-local state in the index.

## Failure behavior

If item creation succeeds but the index update loses a SHA race, do not overwrite anything. Re-read the latest small index, deduplicate again and retry the index update. An orphan item file is recoverable; deleting historical Radar records is not.

If the complete compact index cannot be verified, stop only the write step. Never reconstruct an index from a truncated response.

## Historical items

Pre-split articles were migrated verbatim into individual `news-items/*.json` files. Their existing structured fields remain valid and are rendered through the legacy structured layout.

`news.json` is retained only as a historical snapshot and must not receive new publications.

## Browser-local state

Read/unread state, notes, excerpts and discussion-thread state remain browser-local and must never enter the index or item files.
