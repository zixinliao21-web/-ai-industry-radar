# Repository Instructions

VELNAR Intelligence Radar is a lightweight static research product. Preserve its separation of concerns.

## Quick links

- [Design Language](DESIGN.md)
- [Design decision record](docs/plans/design-language.md)
- [Frontend design craft skill](.agents/skills/frontend-design/SKILL.md)

## Architecture

- `index.html` — directory / read-state interface
- `article.html` — long-form reading surface
- `news.json` — canonical content archive
- `assets/` — brand/static assets

Do not introduce React, Next.js, a backend, a database, or another framework unless a separate product requirement explicitly justifies the migration.

## Design changes

Before changing UI or motion:

1. Read `DESIGN.md`.
2. Follow `.agents/skills/frontend-design/SKILL.md` only where it does not conflict with `DESIGN.md`.
3. Preserve **Precision Sans** typography and **Precision Motion** budgets.
4. Treat the VELNAR blue-purple gradient as a scarce signature asset.
5. Keep article reading surfaces quieter than the directory UI.
6. Preserve accessibility: semantic links, focus-visible states, reduced motion, normal browser link behavior.

## Content changes

Website design must not compress or rewrite research merely to fit UI.

`news.json` is the canonical article archive. The directory may show concise metadata, but the article page should render the complete available analysis fields.

Do not delete or rewrite historical items merely to restyle them. Factual corrections should be explicit rather than silently changing history.

## Read state

Read/unread state is browser-local.

Preserve the current localStorage key:

```text
ai-industry-radar-read-v1
```

Never write read state into `news.json`, GitHub commits, or server-side storage.

## Safe change rule

For UI-only work:

- do not alter `news.json` content
- do not change the article schema
- do not change scanning cadence or notification behavior
- do not change the local read-state model

For content-only work:

- do not restyle `index.html` or `article.html`
- append only genuinely new Radar items unless making an explicit factual correction

Keep commits focused so content and interface changes remain independently reviewable.
