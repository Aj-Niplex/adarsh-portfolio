---
id: "page.file-protection"
title: "File protection"
summary: "Which paths the file tools refuse."
answer_first: "File tools refuse core code folders, root files and secret data files. Both the written path and the resolved path are checked. Paths that escape the root count as protected."
status: "merged"
since: "2026-09-02"
updated: "2026-10-29"
see_also: ["page.threat-model"]
search_terms: ["file protection"]
---

## Protected
Code folders (agent, gateway, security, sandbox, terminal, memory, tools and others), root files such as launch.py and config.py, .env, .git and secret or setting files under data.

## Not covered
run_code and the shell can reach the filesystem directly. File protection covers the file tools only.

## Tests
tests/test_file_protection.py and tests/test_deploy_lists.py.
