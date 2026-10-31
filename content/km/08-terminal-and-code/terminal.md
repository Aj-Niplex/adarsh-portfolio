---
id: "page.terminal"
title: "Terminal"
summary: "Terminal sessions for run_code and the optional shell."
answer_first: "A terminal is a record of recent run_code results. The shell is a separate, persistent bash session that is off by default."
status: "merged"
since: "2026-10-28"
updated: "2026-10-29"
see_also: ["page.code-execution"]
search_terms: ["terminal"]
---

## run_code terminals
Keep the last 20 results. They are not processes.

## Shell
Persistent sessions, up to 4 by default, 900 s per command, idle close at 1,800 s. Enabled only with SHELL_ENABLED.

## Guard
Hard blocks never run. Risky commands wait for a button. The shell runs as the bot's user, so it is not isolated.
