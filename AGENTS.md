# Repository Instructions

VELNAR Intelligence Radar is a lightweight static research product. Preserve its separation of concerns.

## Quick links

- [Product Contract](PRODUCT.md)
- [Design Language](DESIGN.md)
- [Design decision record](docs/plans/design-language.md)
- [Frontend design craft skill](.agents/skills/frontend-design/SKILL.md)

## Architecture

- `index.html` — directory / read-state interface
- `article.html` — long-form reading surface
- `news.json` — canonical content archive
- `assets/radar-runtime.css` / `assets/radar-runtime.js` — shared appearance and sticky runtime behavior
- `assets/research-discussion-bridge.js` — browser-local notebook, excerpt capture, discussion handoff and strategic article labels
- `assets/share-export-fix.js` — Share Card export path
- `service-worker.js` — PWA caching plus runtime asset injection

Do not introduce React, Next.js, a backend, a database, or another framework unless a separate product requirement explicitly justifies the migration.

## Product purpose

Read `PRODUCT.md` before changing content behavior.

The Radar is **not an AI news site**. Its loop is:

```text
Observe → Understand → Question → Discuss → Update judgment
```

The website is the research / reading surface. GPT is the discussion / reasoning surface. Preserve that separation.

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

New articles should follow the strategic-observation contract in `PRODUCT.md`:

- 发生了什么
- 为什么值得我们注意
- 它改变了我们什么判断
- 我们不应该因此得出什么结论
- 值得继续讨论的问题

Facts are evidence; the value is the delta in our understanding. Avoid official news tone and generic “why the AI industry matters” prose.

Do not delete or mass-rewrite historical items merely to restyle them. Factual corrections should be explicit rather than silently changing history.

## Browser-local state

Preserve these keys:

```text
ai-industry-radar-read-v1
velnar-radar-notes-v1
velnar-radar-discussion-thread-v1
velnar-radar-theme-v1
```

Read state, notes, excerpts, discussion-thread settings and appearance are browser-local. Never write them into `news.json`, GitHub content commits, or server-side storage.

Storage failures must not break primary reading.

## Research → Discussion Bridge

Preserve these behaviors:

- article notebook control is icon-first
- selected article text can be captured through the small notebook-style action
- notes and excerpts auto-save locally per article
- directory may show a small notebook marker for articles with local notes
- **讨论** builds a Discussion Packet, copies it, then opens the configured ChatGPT thread or ChatGPT home as fallback
- this bridge must remain lightweight; do not turn Radar into a chat app or general PKM system

## Safe change rule

For UI-only work:

- do not alter `news.json` content
- do not change scanning cadence or notification behavior
- do not change local-storage schemas without an explicit migration

For content-only work:

- do not restyle `index.html` or `article.html`
- append only genuinely new Radar items unless making an explicit factual correction

Keep commits focused so content and interface changes remain independently reviewable.