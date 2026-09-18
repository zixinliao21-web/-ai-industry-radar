# AI Industry Radar — Safe Publishing Procedure

Status: Active

This procedure exists because `news.json` is a long-lived canonical archive. A routine Radar publication must never risk truncating or replacing historical items.

## Canonical format

`news.json` must remain valid, human-readable pretty JSON:

- UTF-8
- 2-space indentation
- trailing newline
- one structural element per line
- never minify / compress back to a single line

The readable format is operationally important: GitHub-connected agents can retrieve the archive safely in line ranges when a full-file response is too large for one tool result.

## Safe append workflow

For a normal new Radar item:

1. Read the current `news.json` from the latest `main`.
2. Parse it as JSON before editing.
3. Record:
   - current blob SHA
   - existing item count
   - complete set of existing item IDs
4. Append only the new item unless an explicit factual correction is required.
5. Update `updated_at`.
6. Serialize with 2-space indentation and a trailing newline.
7. Before writing, verify:
   - JSON parses successfully
   - no duplicate item IDs exist
   - every pre-existing item ID is still present
   - expected item count is preserved or increased exactly as intended
8. Write using the exact blob SHA read in step 3 so concurrent changes fail instead of being silently overwritten.
9. Re-read after the commit and verify:
   - the new item exists
   - old IDs are still present
   - final item count is correct

## Large-file retrieval rule

A truncated tool preview is **not** a valid source for a full-file rewrite.

If a GitHub connector truncates the visible response:

- use line-ranged reads against the pretty-printed file, or
- use a tool/runtime that can fetch and parse the complete blob internally before writing.

Never reconstruct `news.json` from a truncated excerpt.

## Failure behavior

If complete current content cannot be verified, do not publish and do not overwrite the archive.

Pause the write, preserve the researched item separately in the working discussion, and retry only after a safe read path is available.

## Scope

This procedure applies to `news.json` only.

`consumer-radar.json` and `deep-read.json` keep their own editorial contracts, but the same general rule applies: never overwrite canonical history from a truncated preview.
