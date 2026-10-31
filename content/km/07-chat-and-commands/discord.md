---
id: "page.discord"
title: "Discord"
summary: "How the Discord adapter behaves."
answer_first: "In servers, mention the bot. In DMs, type normally. Commands use a prefix, not slash commands. Approval buttons time out after 300 seconds."
status: "merged"
since: "2026-09-02"
updated: "2026-10-29"
see_also: ["page.telegram"]
search_terms: ["discord"]
---

- One agent and approval session per channel.
- Replies are split at 1,900 characters.
- Embeds and buttons are used for approvals and /allow.
- The slash command tree is synced but empty.
- Setup replies still cut text blindly.
