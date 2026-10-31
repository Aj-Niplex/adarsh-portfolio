---
id: "page.quickstart"
title: "Quickstart"
summary: "Seven steps from clone to first reply."
answer_first: "You need a bot token, your user id and a model key. After setup you chat with the bot. Each step lists what you should see."
status: "merged"
since: "2026-09-02"
updated: "2026-10-29"
see_also: ["page.requirements"]
search_terms: ["quickstart"]
---

1. Get Python 3.12 or 3.13. Expect: python --version prints it.
2. Clone the repo and run pip install -r requirements.txt. Expect: no errors.
3. Copy .env.example to .env. Set GATEWAY, the bot token and your user id. Expect: no real values in git.
4. Run python launch.py. Expect: a log line that the bot is connected.
5. Message the bot (mention it in a Discord server). Expect: a reply or a /setup hint.
6. Run /setup. Choose provider, send key, pick a model. Expect: Setup complete.
7. Say hello. Expect: Manas replies.
If step 7 returns a model error, pick another model with /setup.
