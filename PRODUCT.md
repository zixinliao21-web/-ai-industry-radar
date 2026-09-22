# VELNAR Intelligence Radar — Product Contract

Version: **V1.0**  
Status: **active**

## 1. Product purpose

VELNAR Intelligence Radar is **not an AI news site**.

Its job is to turn the outside world into better internal strategic thinking:

```text
Global AI signals
→ identify what is actually new
→ connect it to our existing mental model
→ identify what changes / does not change
→ capture our own questions
→ return to GPT for deeper discussion
→ update our mental model
```

The website is the **research / reading surface**. GPT remains the **discussion / reasoning surface**.

Do not collapse these two roles into one product.

## 2. Editorial identity

Each article should feel like a sharp strategic observation note written for ourselves, not a press release, newspaper story, or generic consulting report.

Facts are evidence. The value of an article comes from the change it creates in our understanding.

### Required primary questions

1. **发生了什么** — only the factual context needed to understand the signal.
2. **为什么值得我们注意** — why this deserves *our* attention, not generic industry importance.
3. **它改变了我们什么判断** — which prior belief is strengthened, weakened, qualified, or left unchanged.
4. **我们不应该因此得出什么结论** — counterevidence, missing data, hype, execution risk, and the tempting overreaction to avoid.
5. **值得继续讨论的问题** — a concrete question worth bringing back to GPT.

Optional sections may include precise novelty, map change, startup implications, and bounded predictions when they genuinely add information.

### Tone

- insight-first, not event-first
- analytical, skeptical, concise where possible
- willing to say “this does not change our map”
- willing to say “interesting, but no action now”
- connect to VELNAR only where the connection is real
- never force a company-building implication merely because an article exists

### Titles

Prefer the structural insight as the title. Company / product names may appear as evidence or context rather than automatically becoming the headline subject.

## 3. Current strategic context

Relevant lenses include, without forcing every article into them:

- AI Industry Control Points
- Enterprise / Personal Context
- Semantic Authority / Ontology
- Vertical AI / Thick Domain Company
- FDE → Productization → possible network effects
- Workflow ownership vs workflow automation
- Agent Runtime / Durable Execution
- Agent Control Plane / Identity / Policy / Governance
- Agent Commerce
- Physical AI
- infrastructure concentration, bubbles, and consolidation

Current enterprise engineering remains narrow: reliable real workflow closure first. New industry concepts must not automatically trigger scope expansion or rearchitecture.

## 4. Research → Discussion Bridge

Reading and discussion are intentionally separate but connected.

### Article notes

Each article has a local notebook.

- notebook control is icon-first
- notes auto-save locally
- selected text can be captured through a small notebook-style selection control
- captured excerpts remain associated with the article
- the notebook is not a general-purpose knowledge-management system

### Discussion handoff

The **讨论** action builds a Discussion Packet containing relevant article context plus the reader’s notes / excerpts and copies it to the clipboard. The website must not imply that clipboard content has been injected into ChatGPT automatically.

The default handoff targets the ChatGPT desktop app: after copying, show the platform-appropriate desktop shortcut when available and ask the reader to paste the packet into the intended discussion thread. Do not automatically open ChatGPT web as part of the primary action. A saved ChatGPT web-thread URL may remain as an explicit secondary fallback.

When the page is opened inside the ChatGPT desktop app’s built-in browser and WebMCP site tools are available, expose a read-only tool that returns the current article’s Discussion Packet, including browser-local notes and excerpts. This is a progressive enhancement; normal reading and clipboard handoff must remain available without WebMCP.

The packet should ask GPT to:

- identify the true delta versus existing assumptions
- connect the signal to prior VELNAR / industry-map thinking
- separate now-actionable implications from watch-only implications
- challenge overreaction
- avoid expanding current engineering scope merely because a new industry concept appeared

## 5. Local state contract

The following state is browser-local and must never be committed to `news.json`:

```text
ai-industry-radar-read-v1
velnar-radar-notes-v1
velnar-radar-discussion-thread-v1
velnar-radar-theme-v1
```

Storage failures must not break primary reading.

### Cross-device continuity

Read/unread state, recent article, reading position and speech-reader progress may optionally synchronize across the user's own devices through a local-first sync layer. Cloud availability must never become a prerequisite for reading. Article notes and excerpts remain device-local in Sync V1.

## 6. Directory behavior

The directory remains concise.

- unread first, read second
- title / grade / date / themes / ID only
- note presence may be indicated with a small notebook icon
- no article body expansion on the directory
- no search unless archive scale later creates a real need

The directory is for deciding what to read, not for reproducing the article.

## 7. Article behavior

The article page is a quiet reading surface with:

- sticky VELNAR header
- sticky section guide
- reading progress
- previous / next article navigation
- share artifact system
- notebook / excerpt capture
- GPT discussion handoff

Reading must remain primary. Utility controls should stay compact and visually secondary.

## 8. Non-goals

Do not turn Radar into:

- a general AI news aggregator
- a media publication optimized for article volume
- a chat application
- Notion / Obsidian / PKM replacement
- a dashboard overloaded with metrics
- a social feed

Do not add features simply because a research tool *could* have them. Add only what improves the loop:

```text
Observe → Understand → Question → Discuss → Update judgment
```

## 9. Success criterion

The Radar is working when reading it changes the quality of our questions and decisions — not when it publishes more articles.