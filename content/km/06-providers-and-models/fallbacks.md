---
id: "page.fallbacks"
title: "Fallbacks"
summary: "What happens when a model fails or a tier is empty."
answer_first: "Each tier tries its candidates in order. An empty tier falls back one level. If the power model and its fallbacks fail, the everyday model does the task."
status: "merged"
since: "2026-10-24"
updated: "2026-10-29"
see_also: ["page.model-routing"]
search_terms: ["fallbacks"]
---

## Order
small -> medium -> the model chosen in /setup. Power empty means there is nothing to escalate to.

## Limits
Up to four candidates per tier. A candidate is model or provider:model.

## Known issue
If /setup does not take effect, the bot may keep failing on the old model. See known-issues.json.
