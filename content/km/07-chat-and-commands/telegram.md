---
id: "page.telegram"
title: "Telegram"
summary: "How the Telegram adapter behaves."
answer_first: "In Telegram, just type. Replies are plain text. Pending updates from while the bot was down are dropped at start."
status: "merged"
since: "2026-09-02"
updated: "2026-10-29"
see_also: ["page.discord"]
search_terms: ["telegram"]
---

- Messages are split at 4,000 characters.
- Buttons use inline keyboards.
- Button presses are checked against the allow-list.
- /start shows Telegram's start text.
