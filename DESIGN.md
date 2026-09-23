# VELNAR Intelligence Radar — Design Language

Version: **V0.6**  
Status: **active**  
Product contract: [`PRODUCT.md`](PRODUCT.md)

> **Precision Editorial × Quiet Technology.** Radar is a persistent intelligence product: precise, calm, research-first, technically credible, and quietly branded. It should feel like serious analysis inside a refined software product — never a generic AI-news site, AI-SaaS landing page, or decorative magazine template.

## 1. Source of truth

This document governs visual and interaction changes. `PRODUCT.md` governs product purpose and editorial behavior.

Implementation evidence:

- `index.html` — directory / read-state surface
- `article.html` — long-form reading surface
- `assets/radar-runtime.css` / `assets/radar-runtime.js` — shared appearance and sticky runtime behavior
- `assets/research-discussion-bridge.js` — notes, excerpt capture, strategic labels, GPT discussion handoff
- `assets/share-export-fix.js` — Share Card export
- `service-worker.js` — PWA cache and runtime injection
- `news-index.json` — tiny Industry Radar segmented-index manifest
- `news-index-segments/segment-XXXX.json` — bounded compact directory / navigation metadata shards
- `news-items/<id>.json` — canonical per-article Industry Radar records
- `news.json` — frozen legacy snapshot

Rules:

1. Preserve product behavior before visual polish.
2. Extend existing tokens before inventing new ones.
3. Keep the static HTML/CSS/JS architecture unless a real product requirement justifies migration.
4. UI-only work must not compress research or mutate Industry/Consumer/Deep Read content semantics.
5. Reading remains primary; utility controls remain compact and secondary.

## 2. Typography — Precision Sans

Approved stack:

```css
-apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Helvetica Neue", Arial, sans-serif
```

Rules:

- no serif display face without a new explicit decision
- hierarchy comes from size, weight, spacing, measure and line-height
- article body stays near `16px` with generous leading
- article reading measure stays near `660px`
- metadata remains visually secondary
- avoid typography that makes Radar look like a magazine, Substack clone, or marketing page

## 3. Color and appearance

Light baseline:

```css
--bg: #f3f4f7;
--card: #ffffff;
--text: #111214;
--muted: approximately #767781 / #777983;
--line: #e3e5ea;
--line-strong: #d7d9e1;
--brand: #080c43;
--accent: #396ee3;
```

Dark baseline is near:

```css
--bg: #111318;
--card: #17191f / #181a20;
--text: #f2f3f5;
--muted: #969aa5;
--line: #2a2d35;
--line-strong: #393d47;
--accent: #7f9cff;
```

Appearance selector is a three-state control:

- 跟随系统
- 浅色
- 深色

The choice is browser-local under `velnar-radar-theme-v1`.

Dark mode is not a simple inversion. Every interaction state must be checked independently: normal, read, unread, hover, focus-visible, active, sticky navigation, previous/next article cards, dialogs and note surfaces.

### VELNAR gradient budget

The blue-purple gradient is a signature brand asset, not a general decoration language.

Allowed by default:

1. VELNAR symbol
2. article reading-progress indicator
3. rare brand-signature artifacts with clear product purpose

Do not introduce gradient buttons, gradient text, ambient glows or generic gradient cards.

## 4. Surfaces and sticky chrome

Radar should remain visually flat and precise.

### Directory

- one-column information architecture
- large editorial/product hero followed by compact state statistics
- list-as-directory, not dashboard-card content layout
- structural `1px` borders
- minimal shadow
- unread first, read second
- unread uses a narrow accent rule; read uses reduced emphasis

### Article

- article surface on neutral canvas
- rounded outer shell
- narrow `660px` reading measure inside a wider product shell
- do not turn every section into a card
- section hierarchy comes from typography, spacing and quiet rules

### Sticky hierarchy

The fixed reading stack is intentional:

```text
VELNAR header
→ section guide
→ article content
```

The header must sit flush to the viewport top and use an opaque background so article text never shows through. The section guide sits immediately beneath it without a transparent gap. Sticky chrome may use borders, but avoid unnecessary floating-card framing or glassmorphism.

## 5. Layout

Directory shell:

```css
max-width: 1040px;
```

Article product shell:

```css
max-width: approximately 900px;
```

Article reading column:

```css
--reading: 660px;
```

Rules:

- preserve generous whitespace without creating dead zones
- directory rows remain compact and scannable
- article rhythm is materially calmer than directory rhythm
- mobile preserves hierarchy rather than merely shrinking desktop
- article archive navigation collapses to one column on narrow screens

## 6. Motion — Precision Motion

Canonical easing:

```css
--ease-velnar: cubic-bezier(.23,1,.32,1);
```

Typical durations:

```css
--dur-press: 120ms;
--dur-hover: 160ms;
--dur-state: 220ms;
--dur-enter: 240ms;
--dur-brand: 560ms;
```

Rules:

- use the cheapest mechanism that works
- prefer transform / opacity for spatial motion
- never use `transition: all`
- gate hover movement behind `(hover:hover) and (pointer:fine)`
- `prefers-reduced-motion` is mandatory
- do not animate information for decoration
- no paragraph stagger, per-section reveal, parallax or cinematic page transition

## 7. Long-form reading system

Required article behaviors:

- reading time derived from actual text
- section and source counts derived from real data
- sticky horizontally scrollable section navigator when justified
- stable section anchors
- active section indication via `IntersectionObserver`
- top reading-progress indicator
- read/unread toggle
- newer/older article navigation from the archive ordering
- back-to-top only after meaningful scroll depth
- directory return-position restoration where possible

Strategic section labels should reinforce the product purpose. Preferred primary labels are:

- 发生了什么
- 为什么值得我们注意
- 它改变了我们什么判断
- 我们不应该因此得出什么结论
- 值得继续讨论的问题

Optional sections may appear when they add genuine information.

## 8. Research → Discussion Bridge

Radar is intentionally not a chat application. The reading surface should help the user leave with better questions and move those questions into GPT.

### Notebook

- notebook control is icon-first
- icon may show a small accent dot when an article has local notes
- notes auto-save per article
- notes remain browser-local
- notebook opens as a restrained side sheet on desktop and a mobile-appropriate sheet on narrow screens

### Selection capture

When article text is selected, a small notebook-style icon may appear near the selection. Clicking it stores the excerpt in the article notebook.

The action must be visually compact and should not cover the text being read.

### Directory note marker

Articles with local notes may show a very small notebook marker in directory metadata. This is a utility signal, not a new primary state.

### Discussion handoff

The **讨论** action:

1. builds a Discussion Packet from article context + local notes / excerpts
2. copies it to the clipboard
3. keeps the reader on the Radar page and gives an explicit handoff cue for ChatGPT Desktop

A dedicated ChatGPT web-thread URL may be configured locally only as an explicit secondary fallback. The primary action must not automatically open ChatGPT web, and the web page must never pretend it can inject the packet into ChatGPT automatically.

## 9. Share Artifact System

Article sharing is a product surface, not merely a copied URL.

Current Share Card contract:

- preview ratio: **4:3**
- logical composition: approximately **1440 × 1080**
- high-resolution PNG export: approximately **2880 × 2160**
- local generation only
- VELNAR identity, grade, date, title, themes, deck, article URL and Radar signature
- dynamic article QR code integrated into the lower-right functional area
- QR remains black-on-white for reliability
- Share Card remains a stable light brand artifact even when the reading UI is dark
- file-based Web Share is used where supported; otherwise save PNG
- copy-link remains an independent fallback

The card should read as a research artifact, not a social-media marketing poster.

## 10. Interaction and accessibility

Requirements:

- article entries remain semantic anchors
- preserve normal browser behavior: keyboard activation, context menu, open-in-new-tab
- visible `:focus-visible`
- skip-to-content / skip-to-article links
- touch devices do not inherit desktop hover motion
- reduced-motion support
- controls provide immediate press feedback
- sticky chrome never hides target headings
- storage failures do not break primary reading
- Share Card modal and note sheet have explicit close paths
- icon-only notebook controls always have accessible labels / titles

## 11. Browser-local state

These states remain local and must never enter `news.json`:

```text
ai-industry-radar-read-v1
velnar-radar-notes-v1
velnar-radar-discussion-thread-v1
velnar-radar-theme-v1
```

## 12. Brand presence

VELNAR should be recognizable without dominating research.

Default expression:

- VELNAR symbol
- `VELNAR` wordmark treatment
- deep navy in light mode / calibrated light treatment in dark mode
- scarce signature gradient
- precise spacing and motion discipline
- `Intelligence Radar` remains the product identity

Avoid repeating the logo, gradient or brand name so often that the product becomes promotional.

## 13. Explicit anti-patterns

Do not introduce by default:

- neon AI glow
- particle backgrounds
- cursor-following light effects
- 3D tilt cards
- large glassmorphism panels
- decorative blur everywhere
- gradient text
- playful spring bounce
- giant animated heroes
- generic three-card SaaS layouts
- excessive pill containers
- motion that delays content access
- fake live / health indicators
- fabricated utility metadata
- marketing-style Share Cards
- a chat box embedded into Radar merely because GPT discussion exists elsewhere
- full PKM / Notion-style complexity around the notebook

## 14. Per-change checklist

Before shipping a UI change:

- [ ] read/unread still works
- [ ] notes / excerpts remain local and safe
- [ ] discussion handoff still builds a useful packet
- [ ] normal browser link behavior still works
- [ ] directory return position remains sensible
- [ ] desktop and mobile hierarchy remain intact
- [ ] light / dark / system modes all remain readable
- [ ] typography remains Precision Sans
- [ ] new colors fit the neutral palette and accent budget
- [ ] motion stays inside existing duration/easing rules
- [ ] reduced motion is handled
- [ ] article readability is not sacrificed for utility UI
- [ ] Share Card remains local, 4:3, high-resolution and QR-readable
- [ ] no new framework or dependency was introduced without a product-level reason

## 15. Open questions

These remain undecided until a real product need appears:

- whether future VELNAR research products outside Radar should use a separate editorial-serif system
- whether a shared cross-product VELNAR design system should be extracted
- whether article imagery / diagrams need a standardized treatment
- whether archive scale will justify search or topic filtering
- whether a future Discussion Queue becomes useful after real note volume accumulates

Do not resolve these by inference.