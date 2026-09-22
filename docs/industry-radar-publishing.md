# AI Industry Radar — Safe Publishing Procedure

Status: Active  
Storage schema: segmented index V3

The Industry Radar uses a bounded segmented metadata index so routine publishing never depends on reading or rewriting one ever-growing JSON blob.

## Canonical storage

```text
news-index.json
news-index-segments/segment-XXXX.json
news-items/<id>.json
```

- `news-index.json` is a **small manifest only**. It contains schema/storage metadata, total item count, segment size, and the ordered segment list. It must not contain article metadata entries or full bodies.
- `news-index-segments/segment-XXXX.json` contains bounded compact directory metadata. A segment may contain at most **8 items**.
- A full segment is **sealed** and must never be modified by routine publishing.
- `news-items/<id>.json` is the canonical full record for one Radar article.
- `news.json` remains the frozen legacy pre-split snapshot. Never append new publications to it.

## Why V3 exists

Split Archive V2 removed the growing full-body bottleneck, but the single compact `news-index.json` still grew until automation-side GitHub reads could truncate it. V3 removes that remaining unbounded mutable file.

Routine publication now touches only:
1. one article item file;
2. one bounded index segment;
3. the tiny manifest.

Historical sealed segments are never rewritten.

## Manifest shape

```json
{
  "schema_version": "3.0",
  "storage": "segmented_index",
  "updated_at": "...",
  "item_count": 36,
  "segment_size": 8,
  "segments": [
    {
      "id": "0001",
      "path": "news-index-segments/segment-0001.json",
      "count": 8,
      "sealed": true
    }
  ]
}
```

## Segment shape

```json
{
  "schema_version": "3.0",
  "segment": "0001",
  "items": [
    {
      "id": "YYYY-MM-DD-A1",
      "date": "YYYY-MM-DD",
      "grade": "A",
      "title": "...",
      "themes": ["..."],
      "deck": "...",
      "body_format": "article_text"
    }
  ]
}
```

Do not put full bodies, sources, Fact/Inference sections or browser-local state in a segment.

## Safe publication workflow

For each genuinely new Radar signal:

1. Read the complete current `news-index.json` manifest and record its exact blob SHA, `item_count`, `segment_size`, and complete segment list.
2. Check whether `news-items/<candidate-id>.json` already exists. If it exists, reconcile rather than creating a duplicate.
3. Read the current last index segment completely. For substantive dedupe, read additional bounded segments as needed; never require one unbounded aggregate blob.
4. Finish and freeze the canonical research article.
5. Create `news-items/<id>.json` **first**. `article_text` is the canonical body and must preserve the frozen research article except JSON escaping.
6. Publish compact metadata:
   - If the current last segment has fewer than 8 items, append exactly one metadata entry to that segment using its exact current blob SHA.
   - If the current last segment has 8 items / is sealed, create the next sequential segment with the new metadata entry as its first item.
   - When a segment reaches 8 items, mark that segment sealed in the manifest.
7. Only after the item file and index segment are safely present, update the tiny `news-index.json` manifest with its exact current blob SHA:
   - update `updated_at`;
   - increment `item_count` exactly once;
   - update the active segment count/sealed state or append the newly created segment descriptor.
8. If any SHA changed because another publication landed, do not overwrite. Re-read the tiny manifest and active bounded segment, deduplicate/reconcile, then retry.
9. After publication, verify:
   - `news-items/<id>.json` exists and its `id` / `article_text` are correct;
   - the metadata entry exists exactly once in the active segment;
   - the manifest references that segment;
   - manifest `item_count` and segment counts reflect the publication;
   - no sealed historical segment was modified.

## Failure behavior

Prefer a recoverable partial state over unsafe history rewrite.

- **Item exists, segment missing:** create/reconcile the metadata entry; do not create a second article.
- **Item + existing active segment updated, manifest update conflicts:** re-read the manifest and active segment. If the item is already present in the listed segment, reconcile manifest counts; do not append again.
- **Item + new segment exist, manifest does not reference the new segment:** treat the segment as an orphan shard and attach it after re-validating sequence/counts.
- **Manifest unreadable:** stop the write step. It is intentionally tiny; do not reconstruct it from guesses.
- Never modify sealed historical segments merely to recover the latest publication.

## Website read path

The website loads the tiny manifest, fetches all listed compact segments, validates the total item count, and then renders the directory/navigation. Full article bodies are still fetched one-at-a-time from `news-items/<id>.json`.

## Browser-local state

Read/unread state, notes, excerpts, speech-reader progress and discussion-thread state remain browser-local and must never enter the manifest, segments or article item files.
