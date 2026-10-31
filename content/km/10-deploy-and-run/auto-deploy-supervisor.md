---
id: "page.auto-deploy-supervisor"
title: "Auto-deploy supervisor"
summary: "How the bot updates itself from GitHub."
answer_first: "With a GitHub token and AUTO_DEPLOY on, a supervisor checks the repo, updates the code, restarts the bot and rolls back if the new commit crashes early."
status: "merged"
since: "2026-10-12"
updated: "2026-10-29"
see_also: ["page.updating"]
search_terms: ["auto-deploy supervisor"]
---

- Polls every 120 s by default (minimum 30).
- Docs-only and test-only commits do not restart.
- A commit with a Python syntax error or no launch.py is rejected.
- An exit within 120 s of start triggers rollback.
- Crash restarts back off from 5 s to 300 s.
- Logs are capped at 50 MB.
- A new top-level code folder must be added to the deploy list or it never deploys.
