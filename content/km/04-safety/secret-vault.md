---
id: "page.secret-vault"
title: "Secret vault"
summary: "Placeholders for secrets and how output is cleaned."
answer_first: "Secrets are stored by name and used as {=NAME=} placeholders. The real value is filled in just before code runs, and known values are hidden in output."
status: "merged"
since: "2026-09-02"
updated: "2026-10-29"
see_also: ["page.threat-model"]
search_terms: ["secret vault"]
---

## How it works
- The model sees only the placeholder.
- The scan happens before filling.
- Output is cleaned by exact-value match. Values of 3 characters or fewer match as whole words only.

## Limits
- The file is plain JSON, kept out of git.
- No chat command stores a secret yet.
- A script can print a transformed secret (reversed, encoded) that the cleaner will not recognise.
