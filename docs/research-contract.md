# VELNAR Intelligence Radar — Research Contract

Status: Active

## Purpose

VELNAR Intelligence Radar is not an AI news site. It is an external-world observation surface for VELNAR.

The loop is:

**Global AI signal → strategic interpretation → change to our mental model → questions worth discussing → GPT discussion → updated judgment**

The website handles reading, marking and lightweight note capture. GPT handles argument, synthesis, comparison with prior discussions and deeper strategic reasoning.

## Article identity

Each article should read like a strategic observation memo written for ourselves, not a press release, media report or generic consulting brief.

Facts are evidence. The value of the article is the **delta in our understanding**.

### Primary questions

1. **发生了什么** (`fact`)
   - Only the factual context required to understand the signal.
   - Concrete actors, timing, evidence and source attribution.
   - Do not turn this into a complete news report.

2. **为什么值得我们注意** (`why_it_matters`)
   - Why should *we* spend attention on this?
   - Connect to current strategic questions, assumptions or company-building problems only when the connection is real.
   - Avoid generic “important for the AI industry” language.

3. **它改变了我们什么判断** (`challenges_existing_assumptions`)
   - Which prior belief is strengthened, weakened, qualified or unchanged?
   - State the delta versus our existing mental model explicitly.

4. **我们不应该因此得出什么结论** (`hype_uncertainty`)
   - Counterevidence, limitations, marketing spin, missing data and execution risk.
   - Identify the tempting overreaction to avoid.
   - “Interesting, but no action now” is a valid conclusion.

5. **值得继续讨论的问题** (`discussion_question`)
   - Prefer one strong, concrete question.
   - At most three when the topic genuinely branches.
   - Questions should be suitable for returning to GPT and connecting to VELNAR’s actual stage, assets and choices.

### Optional supporting fields

- `what_is_new`: the precise novelty/delta when it adds value.
- `startup_implications`: separate **现在应行动 / 继续观察 / 暂时无关**.
- `map_change`: only when the AI Industry Map/control-point framework genuinely changes or needs refinement.
- `prediction`: only when a bounded forward scenario genuinely helps; clearly mark it as prediction.

## Title and deck

- Prefer an **insight-first title** that names the structural change or strategic observation.
- Company/product names may appear as evidence or context; they do not need to be the headline subject.
- Avoid “Company X announced Y” unless the event itself is the strategic point.
- `deck` should answer why the article is worth our attention, not merely summarize the event.

## Strategic context

Keep VELNAR’s current stage in view without force-fitting every signal:

- Progress is measured by real value, not by how many agents, skills or features exist.
- The current enterprise project remains a narrow, reliable Sales MVP.
- New industry concepts must not automatically trigger scope expansion or rearchitecture.
- Long-term themes under observation include Vertical AI, FDE → Productization → possible network effects, Domain/Enterprise Context, Semantic Authority/Ontology, Thick Domain Company, Agent Control Plane, Business Network, Agent Commerce and Physical AI.

## Research → Discussion bridge

The Radar intentionally does not become another chat product.

Browser-local tools support the transition:

- per-article reading notes;
- icon-only capture of selected passages;
- note presence indicator on the directory;
- generation of a Discussion Packet containing article identity, strategic interpretation, guardrails, personal notes and clipped quotations;
- optional locally stored URL for a dedicated GPT discussion thread.

Read state, notes, highlights and discussion settings remain browser-local and must never be written to `news.json`.

## Source discipline

- Prefer primary sources and high-quality reporting.
- Separate fact, inference and prediction.
- Preserve counterevidence and uncertainty.
- Never manufacture an implication or action merely because an article exists.

## Editorial test

Before publishing, ask:

> If the company name were removed, would this article still teach us something new about how the AI world is evolving or how we should think about our path?

If not, it is probably news, not Radar intelligence.
