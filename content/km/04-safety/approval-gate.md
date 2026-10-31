---
id: "page.approval-gate"
title: "Approval gate"
summary: "How risky code and shell commands are scored and approved."
answer_first: "Every run_code call is scanned and scored FREE, LOW, MEDIUM or HIGH. MEDIUM and HIGH wait for a button press. See approval-gate.json for the decision table."
status: "merged"
since: "2026-09-02"
updated: "2026-10-29"
see_also: ["page.sandbox", "page.allow-list"]
search_terms: ["approval gate"]
---

## Levels
- HIGH: recursive delete, disk tools, curl piped to a shell, subprocess, eval, exec, sockets, edits to protected paths.
- MEDIUM: git push, git reset --hard, package installs, chmod, chown, writing files.
- LOW and FREE: everything else that is simple. LOW runs when AUTO_APPROVE_LOW is on.

## Buttons
Allow Once, Allow Session, Always Allow (exact command), Deny.

## Saved state
Pending requests are saved per session. Always Allow is saved in a shared file. Allow Session and the /allow window are memory only.

## Limits
Scanning is by pattern. A command can be disguised.
