---
id: "page.overview"
title: "Kaizen Manas overview"
summary: "What Kaizen Manas is, what it does and what it does not do."
answer_first: "Kaizen Manas is a personal AI agent harness that you control from Telegram or Discord. The agent inside it is called Manas. It runs on a small Python host and asks you before it does anything risky."
status: "merged"
since: "2026-09-02"
updated: "2026-10-29"
see_also: ["page.positioning", "page.name-and-history"]
search_terms: ["overview", "what is kaizen manas"]
---

## What it is
A harness is the code around a language model. It receives chat messages, gives the model a set of tools, checks risky actions and keeps memory.

## What it does
- Chats through Telegram or Discord.
- Offers 61 tools in 13 groups. Five are always on.
- Runs Python in a limited sandbox. Risky code waits for a button.
- Keeps notes, a small graph, vector search and an event log.
- Runs scheduled prompts.
- Routes work between a small, a medium and a power model.

## What it does not do
- It does not host a model. You bring your own key.
- It is not a container platform. The sandbox is a limited subprocess.
- It does not read photos or files you send.
- No performance numbers exist.

## Who made it
Adarsh Jaiswal. The code is MIT licensed. The source repository is private.
