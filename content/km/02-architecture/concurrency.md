---
id: "page.concurrency"
title: "Concurrency"
summary: "One message at a time per chat. Later messages wait in order."
answer_first: "Each Telegram chat and each Discord channel has its own lock. A second message waits until the first finishes. Different chats can run at the same time."
status: "merged"
since: "2026-09-02"
updated: "2026-10-29"
see_also: ["page.architecture"]
search_terms: ["concurrency"]
---

## Rules
- One asyncio lock per chat (Telegram) or channel (Discord).
- Waiting messages run in arrival order.
- The agent call runs in a worker thread so the bot stays responsive.

## Session ids
- Telegram: tg_<chat id>.
- Discord: dc_<channel id>. One agent and one approval session per channel, not per user.

## Limit
Allow Session in a Discord channel applies to everyone allowed in that channel.
