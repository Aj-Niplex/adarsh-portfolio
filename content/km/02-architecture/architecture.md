---
id: "page.architecture"
title: "Architecture"
summary: "One process, one agent loop, tools behind a registry."
answer_first: "Kaizen Manas runs as one Python process. A gateway adapter receives a message, the agent loop calls the model and tools, and the reply goes back through the adapter."
status: "merged"
since: "2026-09-02"
updated: "2026-10-29"
see_also: ["page.concurrency", "page.state-and-storage"]
search_terms: ["architecture"]
---

## Main parts
- Launcher and supervisor: launch.py and deploy_watch.py.
- Gateways: Telegram and Discord.
- Agent loop: prompt, model call, tool rounds.
- Tool registry: 61 tools in 13 groups.
- Safety: approval gate, shell guard, content guard, file protection, vault.
- Sandbox: a limited Python subprocess.
- Memory and skills.
- Router: small, medium and power tiers.
- Scheduler.

## Shape
Gateways are thin. The agent loop does not know which chat app it is in. Safety checks sit in front of tools that can change things.

See data-flow.mmd for a picture and components.json for each module.
