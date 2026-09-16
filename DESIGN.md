# VELNAR Intelligence Radar — Design Language

Version: **V0.4**  
Status: **active**  
Decision record: [`docs/plans/design-language.md`](docs/plans/design-language.md)

> **Precision Editorial × Quiet Technology.** The Radar is a persistent intelligence product: precise, calm, research-first, technically credible, and quietly branded. It should read like serious analysis inside a refined software product — never like a generic AI-SaaS landing page or a decorative magazine template.

## 1. Source of truth

This document governs visual and interaction changes to the Radar.

Implementation evidence:

- [`index.html`](index.html) — directory, read state, directory motion, return-position behavior
- [`article.html`](article.html) — long-form reading surface, section navigation, share/read controls, progress, archive traversal
- [`assets/velnar-symbol.svg`](assets/velnar-symbol.svg) — VELNAR brand symbol and signature gradient

For future UI work:

1. Preserve product behavior first.
2. Extend existing tokens before inventing new ones.
3. Keep the current static HTML/CSS/JS stack unless a separate product requirement justifies migration.
4. Do not alter `news.json` content or semantics as part of a UI-only change.

## 2. Typography — Precision Sans

Approved direction: **Precision Sans**.

Use the system-native stack present in `index.html` and `article.html`:

```css
-apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Helvetica Neue", Arial, sans-serif
```

Rules:

- No serif display face in the Radar without a new explicit design decision.
- Hierarchy comes from size, weight, spacing, measure, tracking and line-height — not extra font families.
- Large titles may use negative tracking and balanced wrapping.
- Body copy stays near 16px with generous line-height.
- Changing numbers and metadata use tabular figures.
- Long-form article body measure stays near the current `660px` reading column.
- Avoid typography that makes the site read as a magazine, Substack clone, or marketing landing page.

Current implementation:

- Directory hero title: responsive `42–68px`, tight line-height, strong negative tracking.
- Directory row title: approximately `16px`, medium/semi-bold weight.
- Article title: responsive `34–48px` desktop, approximately `31px` mobile.
- Article body: `16px`, approximately `1.92` line-height.
- Metadata and section labels remain visually secondary.

## 3. Color system

Current tokens:

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

Principles:

- Neutral canvas and surfaces dominate.
- Primary text is off-black, not pure black.
- Borders are structural and quiet.
- Accent color is scarce and state-driven.
- Do not add multiple competing accent families.
- Do not introduce decorative status colors unless they communicate a real product state.

### VELNAR gradient budget

The blue-purple VELNAR gradient is a **signature brand asset, not a general decoration language**.

Allowed by default:

1. VELNAR symbol
2. article reading-progress indicator
3. rare future brand-signature states with explicit justification

Not allowed by default:

- gradient buttons
- gradient text
- gradient cards
- large blue-purple hero gradients
- ambient blue-purple glow backgrounds
- generic gradient state indicators

## 4. Surfaces and elevation

The Radar should remain visually flat and precise.

Directory:

- one-column information architecture
- one large editorial/product hero, followed by compact state statistics
- list-as-directory rather than a dashboard-card content layout
- `1px` structural borders
- almost no shadow
- compact metadata
- unread first, read second
- unread state uses a narrow solid accent rule; read state uses reduced emphasis rather than recoloring the full row

Article:

- white article surface on neutral canvas
- rounded outer shell, approximately `24px` desktop / `19px` mobile
- narrow `660px` reading measure inside a wider product shell
- no decorative card segmentation for every article section
- section hierarchy comes from typography, spacing, short structural rules, and restrained tonal labels
- Sources and Discussion Question may use dedicated presentation because they are distinct reading functions
- sticky section navigation may use translucent material because it is functional chrome, not decorative glassmorphism

Use elevation only when it communicates hierarchy. Do not add generic shadows to make surfaces feel “premium.”

## 5. Layout and spacing

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

- Preserve generous whitespace.
- The hero may be significantly more spacious than the article directory below it.
- Keep directory rows compact enough for scanning.
- Keep article rhythm materially more relaxed than directory rhythm.
- Do not force symmetric spacing when optical balance calls for a small adjustment.
- Mobile layouts should preserve hierarchy rather than merely shrink the desktop view.
- Statistics should stay compact on narrow screens.
- Article archive navigation collapses from two columns to one column on mobile.

## 6. Motion — Precision Motion

Motion personality:

- responsive
- controlled
- quiet
- physical
- intentional

Canonical easing:

```css
--ease-velnar: cubic-bezier(.23,1,.32,1);
```

Duration palette:

```css
--dur-press: 120ms;
--dur-hover: 160ms;
--dur-state: 220ms;
--dur-enter: 240ms;
--dur-brand: 560ms;
```

Rules:

- Use the cheapest mechanism that works; prefer CSS for deterministic UI motion.
- Use `transform` and `opacity` for spatial motion wherever practical.
- High-frequency interactions should be almost imperceptible.
- Never use `transition: all`.
- Hover movement must be gated behind `(hover:hover) and (pointer:fine)`.
- `prefers-reduced-motion` is mandatory.
- Do not animate information merely for decoration.
- No bounce unless a future direct-manipulation gesture genuinely carries momentum.
- Do not introduce a motion library for effects CSS can handle.
- High-frequency scroll-derived updates should be frame-throttled when JavaScript is required.

### Directory motion budget

Allowed:

- restrained VELNAR brand entrance
- short capped list cascade
- subtle hover translation
- press feedback
- read-state transition

The list cascade must not accumulate indefinitely. Current implementation caps delay after the first six items.

### Article motion budget

Allowed:

- restrained brand entrance
- linear reading-progress indicator
- micro hover/focus feedback on controls and sources
- restrained active-section underline
- subtle archive-navigation hover
- small back-to-top reveal

Default prohibited:

- paragraph or section stagger
- per-section scroll reveals
- parallax
- cinematic page transitions
- ambient looping motion that competes with reading

## 7. Long-form reading system

The article page is a reading product, not only a styled document.

Required behaviors:

- Dynamic reading time derived from actual article text.
- Dynamic section count and source count where present.
- Sticky, horizontally scrollable section navigator only when an article has enough sections to justify it.
- Stable deep-link anchors for article sections.
- Active section indication driven by `IntersectionObserver`, not manual scroll polling.
- Reading progress indicator at the top of the page.
- Share control uses the native Web Share API when available, clipboard fallback otherwise.
- Read/unread control is a true toggle in the current session.
- Newer/older article navigation is derived from the same archive ordering as the directory.
- Back-to-top appears only after meaningful scroll depth.
- Returning to the directory restores the prior directory scroll position when possible.

Utility metadata and navigation must be derived from real data; never invent live status, popularity, completion rate, or other unsupported claims.

## 8. Interaction and accessibility

These are design requirements, not later compliance work:

- article entries are semantic anchors, not click-only containers
- preserve normal browser link behavior: keyboard activation, context menu, open-in-new-tab
- visible `:focus-visible` states
- skip-to-content / skip-to-article links
- touch devices must not inherit desktop hover movement
- `prefers-reduced-motion` support
- controls should provide immediate press feedback
- local read/unread state remains browser-local
- local/session storage access must fail safely if browser storage is malformed or unavailable
- navigation utilities must retain readable labels and not depend on icon-only interpretation

Do not remove browser-native behavior in the name of visual polish.

## 9. Brand presence

VELNAR should be recognizable without dominating the research content.

Default brand expression:

- VELNAR symbol
- `VELNAR` wordmark text treatment
- deep navy brand color
- signature gradient used sparingly
- precise spacing and motion discipline
- `Intelligence Radar` acts as the product identity; avoid inventing additional public-facing VELNAR sub-brand names without approval

Avoid repeating the logo, gradient or brand name so often that the page becomes promotional.

## 10. Explicit anti-patterns

Do not introduce by default:

- neon AI glow
- particle backgrounds
- cursor-following light effects
- 3D tilt cards
- large glassmorphism panels
- decorative blur everywhere
- gradient text
- playful spring bounce
- giant animated hero sections
- generic three-card SaaS feature layouts
- excessive pill-shaped containers
- motion that delays content access
- a second typography family without explicit approval
- fake online/live/health indicators used only as decoration
- fabricated utility metadata

## 11. Per-change checklist

Before shipping any UI change:

- [ ] Existing read/unread behavior still works.
- [ ] Article navigation still works with normal browser link behaviors.
- [ ] Directory return position behaves sensibly.
- [ ] Desktop and mobile hierarchy remain intact.
- [ ] Typography remains Precision Sans.
- [ ] New colors fit the neutral palette and accent budget.
- [ ] VELNAR gradient is used only for a sanctioned brand-signature role.
- [ ] Motion uses existing duration/easing tokens where applicable.
- [ ] Hover movement is pointer-gated.
- [ ] Reduced motion is handled.
- [ ] Long-form article readability is not sacrificed for visual novelty.
- [ ] Section navigation and article traversal are derived from real article data.
- [ ] Storage failures do not break the primary reading flow.
- [ ] No new dependency or framework was introduced without a product-level reason.

## 12. Open questions

These are intentionally **not** decisions yet:

- whether future VELNAR research products outside the Radar should use a separate editorial-serif system
- whether Radar eventually needs a dark appearance
- whether a shared VELNAR design system should be extracted across multiple products
- whether article imagery / diagrams should gain a standardized treatment
- whether archive scale will eventually justify topic filtering or search

Do not resolve these by inference. They require a future explicit design decision when the product need appears.
