---
id: "page.packages"
title: "Packages"
summary: "Installing packages for run_code."
answer_first: "pip installs run in the sandbox venv and need approval. reset_sandbox_venv deletes them all."
status: "merged"
since: "2026-09-02"
updated: "2026-10-29"
see_also: ["page.requirements"]
search_terms: ["packages"]
---

- The venv lives under data/sandbox_venv and is created on first use.
- pip install is MEDIUM risk.
- The host's own packages come from requirements.txt.
- Deploys never delete installed packages.
