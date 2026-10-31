---
id: "page.state-and-storage"
title: "State and storage"
summary: "Where the bot keeps files and what survives a restart."
answer_first: "All state lives under the data folder as plain files. Pending approvals, settings and notes survive a restart. Time windows and Allow Session do not."
status: "merged"
since: "2026-09-02"
updated: "2026-10-29"
see_also: ["page.backup-and-restore"]
search_terms: ["state and storage"]
---

## Files under data
- global and sessions: notes.
- embeddings, episodic: vectors and event log.
- always_allow.json, pending_approvals: approvals.
- secrets_vault.json: secrets, plain JSON, not in git.
- runtime_provider.json: provider, key and model chosen with /setup.
- model_routing.json, escalations: routing.
- tool_categories.json: group switches.
- cron_jobs.json: scheduled jobs.
- sandbox_venv: packages for run_code.
- deploy_state.json, deploy_logs: supervisor.

## Lost on restart
The /allow window, Allow Session, terminal history and sub-agent notes.

## Backup
Copy the data folder and .env. See backup-and-restore.
