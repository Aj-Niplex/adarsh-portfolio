---
id: "page.threat-model"
title: "Threat model"
summary: "Threats, what stops them, how well, and what is left."
answer_first: "This table lists main threats. None of the checks is a security boundary. Run the bot on a host where a mistake costs little."
status: "merged"
since: "2026-09-02"
updated: "2026-10-29"
see_also: ["page.safety-model"]
search_terms: ["threat model"]
---

| Threat | What stops it | How well | What is left |
|---|---|---|---|
| A stranger messages the bot | Allow-list, fails closed | Strong if ids are right | A stolen account of an allowed user |
| Model runs a destructive command | Approval gate, hard blocks | Medium. Pattern based | Disguised commands, a tired owner pressing Allow |
| Code uses too much memory or time | Sandbox limits | Good | Slow abuse inside limits |
| Code reads host files | Environment scrub only | Weak | Anything the bot's user can read |
| Code leaks a secret | Placeholders, output redaction | Medium | Encoded or reversed output |
| Prompt injection from a web page | Content guard banner | Weak | New phrasing; model may still obey |
| Agent edits its own safeguards | File protection | Good for file tools | run_code and shell can write files |
| Private network requests | Page reader guard | Good | Other tools with network access |
| Lost or leaked data folder | Gitignore, plain files | Weak | Vault is unencrypted |
| Bad update | Supervisor syntax check, rollback | Medium | Bugs that start fine |
| Shared Discord channel | Per-channel session | Weak | Allow Session covers everyone in it |
