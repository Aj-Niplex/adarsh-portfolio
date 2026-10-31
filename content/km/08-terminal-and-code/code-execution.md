---
id: "page.code-execution"
title: "Code execution"
summary: "How run_code runs Python."
answer_first: "Code is scanned, approved if needed, has secrets filled in, runs in the sandbox, and its output is cleaned."
status: "merged"
since: "2026-09-02"
updated: "2026-10-29"
see_also: ["page.sandbox"]
search_terms: ["code execution"]
---

1. Scan and score.
2. Approval request if MEDIUM or HIGH.
3. Fill {=NAME=} placeholders.
4. Run in the sandbox.
5. Clean output.
6. Store the result in terminal history.

Python only.
