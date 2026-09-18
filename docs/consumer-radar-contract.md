# VELNAR Research — Consumer AI Radar Content Contract

Status: Active  
Schema: `consumer-radar.json` V2.0

## Scope

`consumer-radar.json` is the canonical published-content store for the **AI C 端产业雷达** collection.

It is independent from:

- `news.json` — existing AI Industry Radar;
- Weekly Deep Read data;
- browser-local read / note / discussion state;
- website UI and routing implementation.

This collection is maintained by the Consumer AI / Personal Agent research thread. Website rendering, navigation, styling, PWA behavior and cross-collection product design remain owned by the VELNAR Research website thread.

## Canonical-content rule

The published article body is **not a rewrite, summary, or schema reconstruction**.

For every published item:

- `body_markdown` is the canonical article.
- It must be copied from the final research response produced in this ChatGPT thread.
- Preserve wording, ordering, headings, paragraphs, lists, block quotes and code blocks.
- Do not compress the article to fit the website.
- Do not rewrite the article into `fact` / `inference` / `prediction` fields.
- Do not re-search the topic merely because it is being published.
- Metadata may be added for indexing, but metadata must never replace or mutate the article body.

The website article page should render `body_markdown` as the source of truth.

ChatGPT-specific rich citation/entity tokens may require presentation-layer handling, but the research prose itself must not be edited during publication.

## Publication gate

Only publish a research response after it has reached a sufficiently complete conclusion for the thread.

Do not publish:

- raw brainstorming;
- unfinished back-and-forth;
- superseded drafts;
- messages later explicitly withdrawn.

When a published article later becomes outdated or factually corrected, preserve the original body and add a separate correction/update record rather than silently rewriting history.

## Item schema

Required metadata:

- `id` — stable unique ID.
- `date` — research/publication date in `YYYY-MM-DD`.
- `title` — the original article title.
- `themes` — indexing only.
- `control_points` — indexing only.
- `publication_mode` — must be `verbatim`.
- `body_markdown` — canonical full article text.

Optional metadata:

- `article_type` — e.g. `radar_update`, `baseline_report`.
- `source_thread` — identifies the originating research thread.
- `notes` — publication-only notes; must not alter the article text.

## Website use

Directory pages may use metadata such as `id`, `date`, `title`, `themes`, and `control_points`.

Article pages must render the complete `body_markdown` rather than generating a shorter article from metadata.

This contract does **not** prescribe page routes, visual treatment, filtering, navigation, local-storage keys, service-worker caching, or any other implementation detail.
