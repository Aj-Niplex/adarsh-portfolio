---
id: "page.security-review"
title: "Security review"
summary: "Findings from the repo's own audits."
answer_first: "The repo records fixes from reviews between 2026-09-02 and 2026-10-28. This pack did not run its own audit."
status: "merged"
since: "2026-09-02"
updated: "2026-10-29"
see_also: ["page.threat-model"]
search_terms: ["security review"]
---

- Fixed: scanner bypass, path traversal, injection guard, approval persistence, DNS rebinding, private address ranges, redaction of tokens.
- Open: see known-issues.json.
- SECURITY.md has one paragraph about DNS rebinding that is older than the fix in PR #22.
