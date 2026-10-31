---
id: "page.progress-updates"
title: "Progress updates"
summary: "Live tool lines while a turn runs."
answer_first: "While the agent works, the bot can show short lines for each tool call. Set TOOL_PROGRESS to off to hide them."
status: "merged"
since: "2026-10-28"
updated: "2026-10-29"
see_also: ["page.ui-gallery"]
search_terms: ["progress updates"]
---

- Argument previews are redacted.
- Tool results are cut to 400 characters in events.
- Long replies are split by a helper that keeps code fences intact on Discord.
- Scheduled-job sends still cut text blindly.
