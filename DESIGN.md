# VELNAR Intelligence Radar — Design Language

Version: **V0.1**  
Status: **active**  
Decision record: [`docs/plans/design-language.md`](docs/plans/design-language.md)

> **Precision Editorial × Quiet Technology.** The Radar is a persistent intelligence product: precise, calm, research-first, technically credible, and quietly branded. It should read like serious analysis inside a refined software product — never like a generic AI-SaaS landing page or a decorative magazine template.

## 1. Source of truth

This document governs visual and interaction changes to the Radar.

Implementation evidence:

- [`index.html`](index.html) — directory, read state, directory motion, interaction patterns
- [`article.html`](article.html) — long-form reading surface, progress indicator, article controls
- [`assets/velnar-symbol.svg`](assets/velnar-symbol.svg) — VELNAR brand symbol and signature gradient

For future UI work:

1. Preserve the product behavior first.
2. Extend existing tokens before inventing new ones.
3. Keep the current static HTML/CSS/JS stack unless a separate product requirement justifies migration.
4. Do not restyle content data in `news.json` as part of a UI-only change.

## 2. Typography — Precision Sans

Approved direction: **Precision Sans**.

Use the system-native stack already present in `index.html` and `article.html`:

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

Current examples:

- Directory title: `34px`, tight line-height, negative tracking.
- Article title: `34px` desktop / `28px` mobile.
- Article body: `16px`, approximately `1.88` line-height.
- Metadata and section labels remain visually secondary.

## 3. Color system

Current tokens:

```css
--bg: #f5f5f7;
--card: #ffffff;
--text: #111214;
--muted: #77777d / #78787e;
--line: #e5e5ea;
--brand: #080c43;
```

Principles:

- Neutral canvas and surfaces dominate.
- Primary text is off-black, not pure black.
- Borders are structural and quiet.
- Accent color is scarce.
- Do not add multiple competing accent families.

### VELNAR gradient budget

The blue-purple VELNAR gradient is a **signature brand asset**, not a general decoration language.

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

## 4. Surfaces and elevation

The Radar should remain visually flat and precise.

Directory:

- one-column information architecture
- list-as-directory, not a dashboard card grid
- `1px` structural borders
- little or no shadow
- compact metadata
- unread first, read second

Article:

- white article surface on neutral canvas
- rounded outer shell, currently `22px` desktop / `18px` mobile
- narrow reading measure inside a wider product shell
- no decorative card segmentation for every article section

Use elevation only when it communicates hierarchy. Do not add generic shadows to make surfaces feel "premium."

## 5. Layout and spacing

Directory shell:

```css
max-width: 900px;
```

Article product shell:

```css
max-width: 800px;
```

Article reading column:

```css
--reading: 660px;
```

Rules:

- Preserve generous whitespace.
- Keep directory density compact enough for scanning.
- Keep article rhythm materially more relaxed than directory rhythm.
- Do not force symmetric spacing when optical balance calls for a small adjustment.
- Mobile layouts should preserve hierarchy rather than merely shrink the desktop view.

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

Default prohibited:

- paragraph or section stagger
- per-section scroll reveals
- parallax
- cinematic page transitions
- ambient looping motion that competes with reading

## 7. Interaction and accessibility

These are design requirements, not later compliance work:

- article entries are semantic anchors, not click-only containers
- preserve normal browser link behavior: keyboard activation, context menu, open-in-new-tab
- visible `:focus-visible` states
- skip-to-content / skip-to-article links
- touch devices must not inherit desktop hover movement
- `prefers-reduced-motion` support
- controls should provide immediate press feedback
- local read/unread state remains browser-local

Do not remove browser-native behavior in the name of visual polish.

## 8. Brand presence

VELNAR should be recognizable without dominating the research content.

Default brand expression:

- VELNAR symbol
- `VELNAR` wordmark text treatment
- deep navy brand color
- signature gradient used sparingly
- precise spacing and motion discipline

Avoid repeating the logo, gradient or brand name so often that the page becomes promotional.

## 9. Explicit anti-patterns

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
- generic three-card SaaS layouts
- excessive pill-shaped containers
- motion that delays content access
- a second typography family without explicit approval

## 10. Per-change checklist

Before shipping any UI change:

- [ ] Existing read/unread behavior still works.
- [ ] Article navigation still works with normal browser link behaviors.
- [ ] Desktop and mobile hierarchy remain intact.
- [ ] Typography remains Precision Sans.
- [ ] New colors fit the neutral palette and accent budget.
- [ ] VELNAR gradient is used only for a sanctioned brand-signature role.
- [ ] Motion uses existing duration/easing tokens where applicable.
- [ ] Hover movement is pointer-gated.
- [ ] Reduced motion is handled.
- [ ] Long-form article readability is not sacrificed for visual novelty.
- [ ] No new dependency or framework was introduced without a product-level reason.

## 11. Open questions

These are intentionally **not** decisions yet:

- whether future VELNAR research products outside the Radar should use a separate editorial-serif system
- whether Radar eventually needs a dark appearance
- whether a shared VELNAR design system should be extracted across multiple products
- whether article imagery / diagrams should gain a standardized treatment

Do not resolve these by inference. They require a future explicit design decision when the product need appears.
