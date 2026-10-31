---
id: "page.tool-groups"
title: "Tool groups"
summary: "How the 13 tool groups and five always-on tools work."
answer_first: "There are 61 tools. Five are always on and 56 sit in 13 groups. A group can be switched off so its tools are hidden from the model."
status: "merged"
since: "2026-09-02"
updated: "2026-10-29"
see_also: ["group.memory", "group.shell"]
search_terms: ["tool groups"]
---

## Always on
who_am_i, report_status, get_progress, list_tool_categories, set_tool_category.

## Default off
shell (operator only), git, voice.

## Who switches
The agent can switch a group when the owner asks. The shell group cannot be switched by the agent.

## Calls to a switched-off tool
The agent gets: currently disabled. Ask the user if they want it turned on.

See groups.json, tools/<group>.json and tool-index.csv.
