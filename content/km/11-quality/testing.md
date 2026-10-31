---
id: "page.testing"
title: "Testing"
summary: "How the tests are run and what they cover."
answer_first: "There are 484 pytest tests. Run them with pytest -q. A CI workflow exists but GitHub cannot start jobs now, so the author runs them by hand."
status: "merged"
since: "2026-10-10"
updated: "2026-10-29"
see_also: ["page.security-review"]
search_terms: ["testing"]
---

- Python 3.12 and 3.13 both pass 484 collected tests.
- Extra verify scripts check progress lines, the shell and routing over HTTP.
- See test-summary.json.
