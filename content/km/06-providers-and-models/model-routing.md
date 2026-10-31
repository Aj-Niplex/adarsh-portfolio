---
id: "page.model-routing"
title: "Model routing"
summary: "Small, medium and power model tiers and how a message picks one."
answer_first: "Routing lets you set up to three tiers, each with up to four model candidates. Only commands change it. The agent cannot edit it."
status: "merged"
since: "2026-10-24"
updated: "2026-10-29"
see_also: ["page.fallbacks"]
search_terms: ["model routing"]
---

## Tiers
small for quick replies, medium for everyday, power for hard tasks.

## Choosing
Regex rules and length thresholds on the message. Triggers for power: long_horizon, max_intelligence_request, low_confidence, complex_architecture.

## Commands
/routing, /model, /escalate (alias /fable).

## Keys
Keys are never stored in the routing file. The /setup key serves the /setup provider. Other providers use their .env key.

## Handoff
The power model receives the chat and writes a three-part answer. Handoffs are saved under data/escalations.
