---
id: "page.content-screening"
title: "Content screening"
summary: "Checks on web text, skills and logs."
answer_first: "Web text and new skills are checked for injection phrasing and hidden text. Web text gets a warning banner. Skills are rejected. Logs and reports are redacted."
status: "merged"
since: "2026-09-02"
updated: "2026-10-29"
see_also: ["page.threat-model"]
search_terms: ["content screening"]
---

## Content guard
Looks for phrases such as ignore previous instructions, hidden HTML comments, invisible characters and instructions to send data to a URL. Scans up to 20,000 characters after Unicode normalisation.

## Privacy redaction
Removes authorization headers, cookies, URL credentials, token shapes and key=value secrets. Used for the event log, GitHub reports and progress previews. Capped at 8,000 characters.

## Limits
Pattern lists miss new phrasing. A banner does not stop the model from following text.
