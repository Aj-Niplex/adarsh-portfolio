---
id: "page.memory"
title: "Memory"
summary: "Notes, graph, vector search and event log."
answer_first: "Memory has four parts: Markdown notes, a graph, optional vector search and an append-only event log. Notes need no key. Vector search needs a Google key."
status: "merged"
since: "2026-09-02"
updated: "2026-10-29"
see_also: ["page.vault-obsidian"]
search_terms: ["memory"]
---

## Notes
Global notes are shared across chats. Session notes belong to one chat. Search by keyword.

## Prompt context
A slice of notes goes into the prompt, up to 12,000 characters in total.

## Vector search
Uses Google gemini-embedding-001 with 768 dimensions. Without a key, search falls back to keywords and says so.

## Event log
One JSONL file per UTC day, append only. Event text is redacted and cut to 4,000 characters.

See memory-types.json.
