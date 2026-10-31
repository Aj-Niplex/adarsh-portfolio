---
id: "page.allow-list"
title: "Allow-list"
summary: "Who may use the bot."
answer_first: "Only user ids on the allow-list may talk to the bot. If the list is empty and REQUIRE_ALLOWLIST is true, everyone is refused."
status: "merged"
since: "2026-09-02"
updated: "2026-10-29"
see_also: ["page.safety-model"]
search_terms: ["allow-list"]
---

## Settings
ALLOWED_TELEGRAM_IDS, ALLOWED_DISCORD_IDS, REQUIRE_ALLOWLIST (default true).

## Where it is checked
Both gateways check messages. Telegram also checks button presses.

## Warning
Setting REQUIRE_ALLOWLIST to false lets anyone spend your model key and use your tools.
