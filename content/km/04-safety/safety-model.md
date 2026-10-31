---
id: "page.safety-model"
title: "Safety model"
summary: "Layers of checks and what each one covers."
answer_first: "Safety is several small checks, not one wall. They reduce mistakes and block known bad patterns. They are not a security boundary against a determined attacker."
status: "merged"
since: "2026-09-02"
updated: "2026-10-29"
see_also: ["page.threat-model", "page.approval-gate"]
search_terms: ["safety model"]
---

## Layers
1. Allow-list: who may talk to the bot.
2. Approval gate: risky code and commands wait for a button.
3. Hard blocks: some actions never run.
4. File protection: file tools cannot touch core code.
5. Sandbox limits: time, memory, processes.
6. Secret vault: placeholders and output redaction.
7. Content screening: injection-like text is flagged.
8. Page reader guard: non-public addresses are refused.

## Honest limit
Checks match patterns. New phrasing or a clever script can get past them. The host user runs everything.
