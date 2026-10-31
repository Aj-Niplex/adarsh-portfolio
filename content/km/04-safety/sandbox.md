---
id: "page.sandbox"
title: "Sandbox"
summary: "The Python sandbox: a limited subprocess, not a container."
answer_first: "run_code runs Python in a subprocess with memory, CPU, file and process limits and a cleaned environment. It is not a container or a virtual machine."
status: "merged"
since: "2026-09-02"
updated: "2026-10-29"
see_also: ["page.threat-model"]
search_terms: ["sandbox"]
---

## Builtin mode (default)
- Own virtual environment under data/sandbox_venv.
- Memory 512 MB, wall time 60 s, 256 open files, 200 MB files, no core dumps.
- Process budget: current count plus 24.
- No new privileges. Own process group, killed on timeout.
- Fresh temporary working folder. Python only.

## External mode
Code is sent by HTTP to a sandbox service you run. The limits are then that service's.

## What it does not stop
Network use, reading files the bot's user can read, and slow abuse within limits.

See sandbox-limits.json.
