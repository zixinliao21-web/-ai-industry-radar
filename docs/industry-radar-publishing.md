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

1. Read the complete current `news-index.json` manifest and record the exact current `main` commit SHA, manifest blob SHA, `item_count`, `segment_size`, and complete segment list.
2. Check whether `news-items/<candidate-id>.json` already exists. If it exists, reconcile rather than creating a duplicate.
3. Read the current active index segment completely. For substantive dedupe, read additional bounded segments as needed; never require one unbounded aggregate blob.
4. Finish and freeze the canonical research article.
5. Construct the complete post-publication state **before moving `main`**:
   - new `news-items/<id>.json` with canonical `article_text`;
   - updated active segment, or the next sequential segment if the current segment is full/sealed;
   - updated tiny `news-index.json` manifest with the exact resulting counts/descriptors.
6. **Preferred path — atomic Git transaction:** when Git tree/commit/ref primitives are available, create one tree based on the exact current base tree containing all three changes, create one commit with the recorded `main` SHA as parent, re-read `main`, and fast-forward the ref only if it is still the recorded SHA. The repository must never expose item-only or segment-only commits in this path.
7. If `main` changed before the ref move, discard the prepared candidate, re-read the current manifest + active segment, deduplicate/reconcile, rebuild the tree, and retry. Never force-update over concurrent history.
8. **Fallback path only when an atomic Git transaction is unavailable:** staged item → segment → manifest writes may still be used with exact current blob SHAs. In that fallback, preserve the established recovery rules below and rely on the production release gate to keep partial candidates off the live site.
9. After the candidate commit, verify:
   - `news-items/<id>.json` exists and its `id` / `article_text` are correct;
   - the metadata entry exists exactly once in the active segment;
   - the manifest references that segment;
   - manifest `item_count` and segment counts reflect the publication;
   - no sealed historical segment was modified.
10. The commit is only a release candidate. It is live only after `VELNAR Content Validation`, `VELNAR Safe Pages Deploy`, and live verification succeed for the exact candidate SHA.

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
