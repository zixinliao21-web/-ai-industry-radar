# VELNAR Research — Consumer AI Radar Content Contract

Status: Active  
Schema: `consumer-radar.json` V1.0

## Scope

`consumer-radar.json` is the canonical published-content store for the **AI C 端产业雷达** collection.

It is independent from:

- `news.json` — existing AI Industry Radar;
- Weekly Deep Read data;
- browser-local read / note / discussion state;
- website UI and routing implementation.

This collection is maintained by the Consumer AI / Personal Agent research thread. Website rendering, navigation, styling, PWA behavior and cross-collection product design remain owned by the VELNAR Research website thread.

## Editorial rule

Only publish research that has reached a relatively stable conclusion. Do not sync raw chat history, brainstorms, drafts, or claims later rejected by research.

Every item must distinguish:

1. **Fact** — what has actually happened.
2. **User Evidence** — real behavior, retention, commercial value, adoption or the explicit absence of such evidence.
3. **Inference** — what the evidence changes in the current mental model.
4. **Prediction** — bounded forward-looking judgment, clearly separated from fact.
5. **Hype / Uncertainty** — missing data, counterevidence and conclusions we should not draw.

A product announcement without meaningful evidence or structural delta is not sufficient for publication.

## Item schema

Required base fields:

- `id` — stable unique ID.
- `date` — research/publication date in `YYYY-MM-DD`.
- `kind` — `baseline`, `structural_signal`, or `category_update`.
- `title` — insight-first title.
- `themes` — product/category lenses such as `Personal Agent`, `AI Glasses`, `Agent Commerce`.
- `control_points` — relevant control layers such as `Personal Context`, `Identity`, `Permission`, `Memory`, `Action`, `Payment`, `Hardware`.

Required research fields:

- `fact`
- `user_evidence`
- `inference`
- `prediction`
- `hype_uncertainty`
- `discussion_questions` — one to three concrete questions.
- `sources` — source objects with `label` and `url`.

## Website use

A future directory can rely on `id`, `date`, `kind`, `title`, `themes`, and `control_points`.

A future article page should render the complete research fields rather than compressing them into generic news prose.

This contract does **not** prescribe page routes, visual treatment, filtering, navigation, local-storage keys, service-worker caching, or any other implementation detail.
