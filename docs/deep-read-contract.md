# Weekly Deep Read — Content Contract

Status: Active  
Collection: `weekly-deep-read`  
Canonical content store: `deep-read.json`

## 1. Purpose

Weekly Deep Read is a long-term curated reading collection for VELNAR Research.

It is **not** a news stream and **not** a tag or subfeed of VELNAR Intelligence Radar.

Its job is to preserve a small number of articles, essays, reports, research papers, and business cases that remain worth reading beyond the day they were published.

The content loop is:

```text
Selection
→ verify the original source
→ judge why the piece deserves sustained attention
→ extract the core argument
→ record durable takeaways
→ add VELNAR reading notes / reflection where useful
→ preserve questions worth discussing
→ publish as a Deep Read entry
```

## 2. Separation from Intelligence Radar

`news.json` remains the canonical archive for VELNAR Intelligence Radar.

Weekly Deep Read uses `deep-read.json`.

Do not:
- write Deep Read entries into `news.json`;
- reuse Radar grades or force Deep Read into Radar themes;
- require Radar fields such as `fact`, `what_is_new`, `hype_uncertainty`, or `map_change`;
- treat a Deep Read as a current signal merely because it was recently published;
- modify Radar content when publishing or correcting a Deep Read entry.

Radar asks: **What changed in the outside world, and how does it change our map?**

Deep Read asks: **Why is this source worth sustained reading, what is its argument, and what should we retain after reading it?**

## 3. Selection scope

Primary themes include:

- AI / Agent and technological innovation
- entrepreneurship, strategy, and organizational management
- market analysis and business models
- social, cultural, and long-term trends
- early-stage startup building
- company / business case studies
- teams, leadership, founder and manager qualities
- organizational capability building

Prefer substantial long-form reading, normally around 40 minutes or more. Shorter pieces may be included only when their insight density and long-term value justify an exception.

Paywalled or restricted-access sources are allowed when the access condition is recorded honestly.

## 4. Publication gate

An entry should not be published until the following are verified from the original source or a reliable first-party record where possible:

- title
- author(s), when available
- publication / institution
- canonical source URL
- original publication date at the precision the source actually provides
- enough of the source to judge its core argument and reading value

Do not manufacture missing metadata.

If the source only provides a year or month, preserve that precision:
- `YYYY-MM-DD`
- `YYYY-MM`
- `YYYY`

Historical ChatGPT recommendations are candidates, not evidence. Re-verify them before adding them to `deep-read.json`.

## 5. Data contract

Top level:

```json
{
  "schema_version": "1.0",
  "collection": "weekly-deep-read",
  "updated_at": "YYYY-MM-DD",
  "items": []
}
```

Each item uses:

```json
{
  "id": "DR-YYYY-NNN",
  "added_date": "YYYY-MM-DD",
  "title": "string",
  "author": ["string"],
  "publication": "string",
  "institution": "string",
  "source_type": "article | report | research_paper | working_paper | case_study | essay | other",
  "source_url": "https://...",
  "original_publish_date": "YYYY-MM-DD | YYYY-MM | YYYY",
  "estimated_reading_time": "string",
  "topic": "string",
  "themes": ["string"],
  "why_read": "string",
  "core_argument": "string",
  "key_takeaways": ["string"],
  "our_notes": "string",
  "discussion_questions": ["string"],
  "access": {
    "type": "free | paywalled | restricted | unknown",
    "note": "optional string"
  }
}
```

### Field intent

- `id`: stable Deep Read identity; do not derive meaning from Radar IDs.
- `added_date`: when VELNAR Research added the item to this collection. It is not the automation schedule.
- `original_publish_date`: source publication date, retaining only the precision supported by evidence.
- `topic`: one primary editorial bucket for scanning.
- `themes`: secondary concepts; no need to match Radar theme vocabulary.
- `why_read`: why this source deserves sustained attention.
- `core_argument`: the source's central thesis, stated compactly and without turning our interpretation into the author's claim.
- `key_takeaways`: durable ideas worth retaining after reading.
- `our_notes`: VELNAR / ChatGPT reading notes or reflection. Keep source claims and our interpretation distinguishable.
- `discussion_questions`: include only when there is a concrete question worth returning to.
- `access`: practical access status; never imply a source is freely available when it is not.

If an optional field is genuinely unavailable or adds no value, omit it rather than inventing filler.

## 6. Scheduling boundary

The Tuesday / Thursday / Saturday recommendation cadence belongs to the ChatGPT automation layer.

Do not write cadence, next-run time, notification state, or automation metadata into individual Deep Read items or `deep-read.json`.

## 7. Editorial discipline

A Deep Read entry should be source-centric and durable.

Prefer:
- the strongest available original source;
- clear separation between the author's thesis and our reflection;
- a small number of high-signal takeaways;
- corrections when earlier chat recommendations contained inaccurate metadata.

Avoid:
- rewriting the source into a news story;
- padding notes merely to make an entry look complete;
- duplicating a paper and its short announcement as separate entries when the deeper source subsumes the shorter one;
- archiving every recommendation automatically.

The collection should remain selective enough that an old entry still feels worth opening months later.
