# VELNAR Intelligence Radar — Design Language Proposal

Status: **approved — Direction A / Precision Sans**

Approved on 2026-09-16. This proposal is now the decision record behind the root `DESIGN.md`.

> **Precision Editorial × Quiet Technology** — VELNAR Intelligence Radar should feel like a serious research publication operating inside a precise software product: restrained, information-first, responsive, and recognizably VELNAR without turning into an AI-SaaS landing page.

## 1. Product character

The Radar is neither a marketing website nor a generic blog. It is a persistent intelligence product.

Desired qualities:

- precise
- calm
- mature
- research-first
- technically credible
- quietly branded
- high signal-to-decoration ratio

Avoid:

- neon / glow-heavy AI aesthetics
- decorative gradients outside branded moments
- particle effects
- large parallax scenes
- 3D tilt cards
- excessive glassmorphism
- playful bounce
- motion that competes with reading
- generic SaaS dashboard chrome

## 2. Color and brand accent budget

Current evidence: `index.html`, `article.html`, `assets/velnar-symbol.svg`.

Base system:

- canvas: `#f5f5f7`
- primary surface: `#ffffff`
- primary text: `#111214`
- muted text: approximately `#77777d` / `#78787e`
- structural line: `#e5e5ea`
- VELNAR deep brand navy: `#080c43`

### Gradient rule

The blue-purple VELNAR gradient is a **signature asset, not a general decoration system**.

Allowed by default:

1. VELNAR logo
2. reading progress indicator
3. rare future brand-signature states with explicit justification

Not allowed by default:

- gradient buttons
- gradient text
- gradient cards
- large gradient hero backgrounds
- blue-purple glow as ambient page decoration

## 3. Motion language — Precision Motion

Current evidence: motion tokens in `index.html` / `article.html`.

Motion personality:

- responsive
- controlled
- quiet
- physical
- intentional

Primary easing:

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
- Prefer `transform` and `opacity` for spatial motion.
- High-frequency interactions should be almost imperceptible.
- Hover motion must be gated behind `(hover:hover) and (pointer:fine)`.
- `prefers-reduced-motion` is mandatory.
- No bounce unless a future direct-manipulation gesture genuinely creates momentum.
- Article reading surfaces use materially less motion than the directory UI.
- Never delay access to information for choreography.

### Directory motion

Allowed:

- restrained brand entrance
- short capped list cascade
- subtle hover translation
- press feedback
- read-state transition

### Article motion

Allowed:

- restrained VELNAR brand entrance
- linear reading progress line
- micro hover/focus feedback on controls and links

Default prohibited:

- per-section scroll reveals
- article paragraph stagger
- parallax
- cinematic page transitions

## 4. Layout and surfaces

### Directory

- one primary column
- unread first, read second
- list-as-directory rather than dashboard cards
- thin structural borders
- little or no elevation
- compact metadata

The UI should remain navigational rather than promotional.

### Long-form article

- outer product shell: approximately `800px` maximum
- reading column: `660px` maximum
- generous body line-height (`~1.88` desktop)
- section labels small and secondary
- body content carries the visual weight
- title and deck are allowed stronger hierarchy
- sources remain visually quiet but clearly interactive

## 5. Accessibility and interaction quality

- semantic anchors for article navigation
- normal browser link behaviors preserved
- visible `:focus-visible` treatment
- skip-to-content / skip-to-article link
- reduced-motion handling
- touch devices must not inherit desktop hover movement
- local read state remains browser-local

Accessibility is part of visual quality, not a later compliance pass.

## 6. Approved typography — Precision Sans

Use the native/system sans stack throughout:

```css
-apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Helvetica Neue", Arial, sans-serif
```

Character:

- product / intelligence-system first
- precise and technical
- strongest continuity between directory and article
- avoids drifting into magazine / Substack styling

Article differentiation comes from scale, line-height, spacing, measure and weight — not a second type family.

No serif display face should be introduced into the Radar without a new explicit design decision.

## 7. Decision record

**Selected: A — Precision Sans.**

The root `DESIGN.md` is the operational design contract. This file remains as the approval history and rationale.
