---
id: "page.scheduled-jobs"
title: "Scheduled jobs"
summary: "Prompts that run on a timer in the chat that created them."
answer_first: "A job is a saved prompt with a schedule: every Nh, every Nm or daily HH:MM in UTC. The scheduler checks every 30 seconds."
status: "merged"
since: "2026-09-02"
updated: "2026-10-29"
see_also: ["page.goals-and-todo"]
search_terms: ["scheduled jobs"]
---

- A job with no earlier run starts at once.
- Runs may use only a read-only tool list: memory search, file listing, web search, progress, skill search, job and sub-agent listing, identity, group listing.
- No write tools in scheduled runs.
