export type ProjectDetails = {
  purpose: string;
  features: string[];
  architecture: string;
  workflow: string[];
  configuration: string[];
  limits: string[];
  commands?: { name: string; purpose: string }[];
  tools?: { name: string; purpose: string }[];
};

export type PortfolioProject = {
  name: string;
  eyebrow: string;
  description: string;
  tags: string[];
  status: string;
  href?: string;
  action?: string;
  slug?: string;
  attribution?: string;
  details?: ProjectDetails;
};

export const projects: PortfolioProject[] = [
  {
    name: "Niplex Research AI",
    slug: "niplex-research-ai",
    eyebrow: "Obsidian community plugin",
    description: "A mobile-first research assistant for Obsidian. It searches relevant notes, reads bounded line windows, answers with evidence, and keeps durable edits behind explicit approval.",
    tags: ["TypeScript", "Obsidian API", "Gemini", "Agnes AI", "MCP-compatible tools"],
    status: "Public · v0.1.23",
    href: "https://github.com/Aj-Niplex/Niplex-obsidian-Research-AI",
    action: "View repository",
    details: {
      purpose: "Research across a personal Obsidian vault without automatically sending the whole vault to a model. The plugin uses note names and metadata to find candidates, reads bounded line windows for relevant notes, and returns answers intended to be traceable to the context that was actually supplied.",
      features: [
        "Autonomous, bounded research loop: plans steps, searches vault notes, reads relevant line windows, calls available tools, and produces an evidence-grounded response.",
        "Stoppable execution timeline: the single circular composer control changes between Send and Stop while a run is active; cancellation leaves a stopped summary in the timeline.",
        "Mobile-first interface: keeps conversation and composer visible; less frequent controls live behind Actions, and optional shortcut icons are collapsed on mobile.",
        "Provider choice: supports user-configured Gemini and Agnes API keys stored through Obsidian SecretStorage.",
        "Provider recovery: rate limits, timeouts, temporary high-demand responses, and unavailable models trigger visible cooldown/fallback behavior rather than failing silently.",
        "Protected system policy: displays the protected project policy in a read-only panel. A separate custom prompt is additive and capped at 6,000 characters; it cannot replace the protected policy.",
        "Bounded inputs and context: documented caps include 6,000 characters for the research question and installed skill guidance, 20,000 for injected context, and 32,000 for provider message history.",
        "Explicit attachments: the + control selects Files or Folder. A folder contributes at most eight Markdown descendants, not an unrestricted folder upload.",
        "Local chat history: saves each user turn as readable Markdown under the vault's NIPLEX-OBSIDIAN/Chats folder and supports search, reopen, and delete.",
        "Research modes: Plan and Chat are read-only. Create & edit is required before write tools can be considered, and writes still use approval unless a narrow timed policy has explicitly been configured.",
        "Quick-action bar: users can choose up to three icon actions while the model and research-mode controls remain close to the composer.",
        "AI-discovered MOCs: finds note categories from bounded context, supports multi-category membership, and checkpoints longer runs so they can resume.",
        "Local skills: validated instruction-only packages live in NIPLEX-OBSIDIAN/Skills and do not require a companion plugin.",
        "Inline context and skills: @path/to/note.md or @Folder/ attaches bounded vault context; /skill opens skill selection and answer-size controls.",
        "Public video input: a focused question containing one public YouTube URL may be passed to Gemini using fileData.fileUri; the Agnes adapter currently receives the URL as text rather than claiming native video processing.",
        "Provider-neutral tool calling: normalizes tool names, JSON arguments, and bounded results across local vault tools and MCP-compatible providers."
      ],
      architecture: "The plugin is a standalone TypeScript Obsidian plugin. Its runtime coordinates research steps, uses vault search and bounded note reads for context, adapts provider tool definitions/results to a normalized internal contract, and stores chat/skill files in the vault. The MCP compatibility layer maps tools/list and tools/call to the same tool contract used by provider adapters. The MCP client uses Obsidian requestUrl with JSON-RPC, initialization, session headers, tool discovery, and tool execution.",
      workflow: [
        "The user asks a research question in the mobile-first conversation composer.",
        "The runtime plans bounded work and searches note titles/metadata to find candidate notes instead of collecting the whole vault.",
        "Relevant line windows, explicit files/folders, or safe @ mentions are selected within configured limits.",
        "Provider/model calls use the configured adapter and normalized tool contracts; timeouts and rate-limit responses can enter cooldown/fallback handling.",
        "The timeline presents action summaries and an answer grounded in the available context; the user can stop a long-running task.",
        "Read-only modes cannot intentionally perform persistent edits. Create & edit mode enables consideration of write tools, with explicit approval expected for durable changes.",
        "Chat turns and reusable skills are saved as readable Markdown within the user's own Obsidian vault."
      ],
      configuration: [
        "Install as an Obsidian community plugin; the repository manifest identifies it as not desktop-only and lists minimum Obsidian version 1.11.4.",
        "Add supported provider credentials from the plugin settings; the README says Gemini and Agnes keys are stored in Obsidian SecretStorage.",
        "Use Files or Folder for explicit context; folder selection is bounded to at most eight Markdown descendants.",
        "Use /skill for installed skills and answer-size preferences, and @path/to/note.md or @Folder/ for inline bounded context.",
        "Development commands documented in package.json: npm run dev, npm run build, npm run lint, npm test, npm run validate, and npm run package:release."
      ],
      limits: [
        "This page summarizes public README, manifest, and source files reviewed for the portfolio; behavior can change with future commits.",
        "A README-listed provider/model fallback order is time-sensitive and should be verified against current adapter code before treating individual model names as permanent guarantees.",
        "MCP compatibility is a client/adapter capability, not a statement that the plugin includes an MCP server.",
        "External provider requests mean selected note context and prompts leave the local device; users should configure providers carefully and avoid including sensitive vault content.",
        "The plugin README documents bounded context and approval-oriented writes, but this portfolio is not an independent security certification."
      ]
    }
  },
  {
    name: "NiPlex Harness",
    slug: "niplex-harness",
    eyebrow: "Personal AI agent harness",
    description: "A chat-controlled personal agent for Discord or Telegram, with provider setup, an approval-oriented Python sandbox, notes, memory, skills, web search, and a terminal interface.",
    tags: ["Python", "Discord", "Telegram", "Agent workflows", "Sandboxing"],
    status: "Public · In development",
    href: "https://github.com/Aj-Niplex/NiPlex-Harness",
    action: "View public repository",
    details: {
      purpose: "A personal AI-agent harness intended to be manageable from a phone through Discord or Telegram, including on modest/free Python hosts. The public project provides a gateway, provider configuration, agent runtime, workspace/notes, memory, skills, web search, and constrained execution components.",
      features: [
        "Two chat gateways: Discord or Telegram, selected with GATEWAY and started through launch.py.",
        "In-chat provider setup: /setup walks through provider, API key, and model selection, listing available models from the provider where supported.",
        "Provider breadth in the documented setup flow: Agnes, Google Gemini, OpenAI, Anthropic, OpenRouter, and custom OpenAI-compatible endpoints.",
        "Model selection: choose a listed model by number or model ID, or use the documented random option where supported.",
        "Approval-oriented Python sandbox: potentially risky commands can surface approval buttons instead of requiring users to type an approval phrase.",
        "Obsidian-ready notes: the vault directory is designed to hold regular Markdown files that can be opened directly in Obsidian.",
        "Memory directories: configuration creates global and session memory locations under the configured data/memory root.",
        "Skills: reusable instruction/workflow files are organized separately from the core agent.",
        "Web search: a separate component handles searches and feeds results into agent workflows.",
        "Terminal tools: command execution is exposed through a distinct terminal component and should be treated as a privileged capability.",
        "Allowlist-based entry: numeric Discord/Telegram user IDs can be configured and REQUIRE_ALLOWLIST defaults to true in the public config.",
        "Optional GitHub issue reporting: crash reporting is opt-in and disabled by default; sanitized reports should only be enabled deliberately.",
        "Deployment-friendly launcher: launch.py installs dependencies when requirements.txt changes and starts the selected gateway.",
        "Environment separation: gateway tokens and allowlists are configured at startup, while provider setup can save runtime provider selection separately."
      ],
      architecture: "The public repository separates launch/configuration from gateway adapters, agent logic, memory, skills, sandbox, security, terminal, tools, and web search. launch.py checks a hash marker before reinstalling Python requirements, loads .env if present, reads GATEWAY, then launches the corresponding Discord or Telegram gateway. config.py loads environment values into a Config object, parses user-ID allowlists, creates data and memory directories, and ensures a vault directory exists.",
      workflow: [
        "Deploy the public repository to a Python host or run it locally, then configure GATEWAY and the matching chat-bot token.",
        "Configure the numeric user ID allowlist; keep the default allowlist requirement enabled for personal deployments.",
        "Start with python launch.py. The launcher installs the requirements when the requirements file changes.",
        "Send /setup through the selected chat gateway, choose an AI provider, enter its key, and select a model.",
        "Use /help and normal chat or mention the Discord bot in a server. The help guide describes /reset for clearing the current chat session.",
        "Ask the agent to create Markdown notes under vault/, then open that folder in Obsidian.",
        "For terminal or sandbox actions that are deemed risky, review the approval UI and approve only commands you understand."
      ],
      configuration: [
        "Python 3.10+ according to docs/SETUP.md.",
        "Set GATEWAY to discord or telegram and provide the corresponding bot token.",
        "Set ALLOWED_DISCORD_IDS and/or ALLOWED_TELEGRAM_IDS for authorized numeric users; check the matching ID if the bot ignores a message.",
        "Provider API keys may be entered via /setup; docs say they do not need to be put in .env when using that flow.",
        "Optional sandbox settings include SANDBOX_MODE, SANDBOX_TIMEOUT, SANDBOX_MAX_MEMORY_MB, SANDBOX_URL, and SANDBOX_API_KEY.",
        "Optional GitHub reporting is controlled by ENABLE_GITHUB_ISSUES and should remain false unless intended."
      ],
      limits: [
        "The public README presents this as a personal agent harness, not a security-certified general-purpose multi-user service.",
        "Sandbox guarantees depend on the configured sandbox mode and host environment; setting a memory/time limit is not proof of OS-level isolation.",
        "Terminal, file-write, and web tools have meaningful authority. Use an allowlist and human review; never deploy with unrestricted access to untrusted users.",
        "A provider key entered into chat may briefly appear in the user's message history unless deletion succeeds; do not assume message deletion is guaranteed.",
        "The project is actively developed; treat integrations and controls as version-dependent and review their code/configuration before production use.",
        "This page documents the public repository only. It does not link to or reproduce private development material."
      ],
      commands: [
        { name: "/setup", purpose: "Configure provider, API key, and available models." },
        { name: "/help", purpose: "Display usage help." },
        { name: "/reset", purpose: "Reset the current agent session for the chat." }
      ]
    }
  },
  {
    name: "Rei-kun-Bot",
    slug: "rei-kun-bot",
    eyebrow: "AI Discord bot",
    description: "A persona-driven Discord assistant with multi-model fallback, conversation history, custom emoji management, a study-resource hub, code diagnostics, and administration tools.",
    tags: ["Python 3.13+", "discord.py", "OpenRouter", "JSON storage", "Discord UI"],
    status: "Public",
    href: "https://github.com/Aj-Niplex/Rei-kun-Bot",
    action: "View repository",
    details: {
      purpose: "A modular Python Discord bot that combines a fictional Rei-kun persona with AI chat, study-resource retrieval, emoji tools, code diagnostics, and owner/admin utilities. The README describes multi-model fallback and conversation memory. A separate architecture document describes modular command, core/security, utility, config, AI knowledge, and JSON persistence layers.",
      features: [
        "Multi-model AI support with automatic fallback across providers/models; the README lists DeepSeek, LLaMA, GPT, and Gemini through OpenRouter model configuration.",
        "Persona consistency: a protected identity/prompt layer is intended to keep the fictional bot persona recognizable when the underlying model changes.",
        "Conversation memory: recent messages are tracked per channel, with server memory integration described in the README.",
        "Intent routing: the documented system recognizes version, help, memory, and general-chat intents.",
        "Custom emoji sync: pulls application/server emojis into a searchable catalogue and supports named placeholders such as [[flower]] or [[purpleribbon]].",
        "Emoji administration: list/browse emojis, rename them, manually add an emoji, and use admin debugging tools.",
        "Study-resource hub: look up resources by code and search by topic, subject, or chapter; resource categories include notes, mind maps, audio, quizzes, and revision links.",
        "Interactive resource management: create, edit, and maintain entries with a wizard and role-based permission checks.",
        "Code Doctor: analyzes Python files/errors and offers diagnostic or patching assistance with interactive buttons; the repo also documents backup and smoke-test concepts.",
        "Hot reload: reload supported command modules without restarting the entire bot.",
        "Operational visibility: bot status, latency, logs, version, uptime, and system metrics are exposed through admin/help utilities.",
        "Access controls: ToS acceptance, owner/admin hierarchy, user block/unblock controls, DM gating, and environment-based secrets.",
        "Structured UI utilities: embeds, loading/typing feedback, message formatting/splitting, command catalog, logging, and concurrency helpers are separated into reusable modules.",
        "Optional error email safety: repository security documentation describes encrypted secret loading and in-memory email rate limiting for failure notifications."
      ],
      architecture: "The repository is organized into a startup layer (app.py), command modules, reusable utilities, core ownership/security/rate-limiting logic, configuration, AI prompt/knowledge files, JSON-backed storage, and setup guides. The AI utility mediates model calls and conversation context; command modules own user-facing Discord actions; storage/resource helpers persist resource catalogues and state; permission helpers guard admin operations.",
      workflow: [
        "Install Python and requirements, create a Discord application/bot, and configure DISCORD_TOKEN plus the configured AI-provider key using the environment template.",
        "Start the bot from app.py. Complete the ToS or onboarding prompt if enabled and check the configured access/DM permissions.",
        "Use ?ai for a conversational turn; the bot attaches recent channel history/context and asks the selected model adapter for a response.",
        "If the chosen model is unavailable or errors, the AI routing configuration attempts a fallback candidate rather than hard-failing immediately.",
        "Use ?resource with a code or the resource search command to retrieve learning materials; authorized users can create or edit resource records.",
        "Use emoji commands to sync or inspect emoji entries before inserting named placeholders in messages.",
        "Use owner/admin commands for logs, reloads, diagnostics, blocking, and permission changes; those operations should remain limited to trusted IDs/roles."
      ],
      configuration: [
        "The README lists Python 3.13+ and discord.py 2.6.4+ as the primary stack.",
        "Set DISCORD_TOKEN and the configured AI API key in the local environment; the README presents OpenRouter as the common multi-model route.",
        "OPENROUTER_MODELS is documented as a comma-separated fallback candidate list.",
        "Configure bot prefix/version, allowed admin and owner IDs, resource access roles/IDs, and the resource trigger channel according to .env.example.",
        "Keep .env and encryption/master-key material out of Git. Secret encryption is useful only if the key and ciphertext are stored with an appropriate separation of access.",
        "The repo has separate developer/security guides; read current implementations before enabling email or auto-patching features."
      ],
      limits: [
        "The README uses prefix commands such as ?help and ?ai, while BOT_ARCHITECTURE.md also describes slash-command modules. Check the actual synced command tree/configuration in the deployed revision before assuming both interfaces are active.",
        "Model availability and fallback behavior depend on the provider, account, configured model list, quotas, and network conditions.",
        "The persona is fictional; the README explicitly says Rei-kun is not a real person.",
        "Code-patching and reload features are privileged operations and should be restricted to trusted administrators.",
        "The security documentation is project-authored documentation, not an independent audit. Encryption does not protect a secret if an attacker obtains both the ciphertext and its master key.",
        "The page summarizes public docs/source; command availability can change with the deployed version."
      ],
      commands: [
        { name: "?ai <prompt>", purpose: "Chat with the AI persona." },
        { name: "?aihelp", purpose: "Show AI usage help and model guidance." },
        { name: "?emojisync", purpose: "Synchronize emoji catalog data (admin-only per README)." },
        { name: "?emojilist", purpose: "Browse available emoji entries." },
        { name: "?emojidebug [name]", purpose: "Inspect emoji details (admin tool)." },
        { name: "?emojiname <old> <new>", purpose: "Rename an emoji where permissions allow." },
        { name: "?emojiadd <name> <id> [anim]", purpose: "Add an emoji record manually." },
        { name: "?resource <code>", purpose: "Retrieve a study resource by code." },
        { name: "?resourceadd / ?resourceedit", purpose: "Create or edit resources via the documented resource flow." },
        { name: "?ai-code-detection <query>", purpose: "Search study resources by subject/topic." },
        { name: "?doctor [target] [--flags]", purpose: "Run code diagnostics and possible patch suggestions." },
        { name: "?reload <module>", purpose: "Reload a supported command module." },
        { name: "?logs [lines] / ?botinfo / ?ping", purpose: "Inspect operations, status, or latency." },
        { name: "?botblock / ?botunblock", purpose: "Block or unblock a user." },
        { name: "?promote / ?demote / ?admins", purpose: "Manage bot-admin access; ownership restrictions apply." },
        { name: "?help / ?userid [@user]", purpose: "Show help or look up a Discord user ID." },
        { name: "?save", purpose: "Save conversation history or a useful exchange." },
        { name: "?topic", purpose: "Set or view the conversation topic." },
        { name: "?remember", purpose: "Store important information in memory." },
        { name: "?resourcehub", purpose: "Open the study-resource catalog and its management/search workflows." },
        { name: "?fix", purpose: "Try a quick fix workflow for common issues." },
        { name: "?prompt / ?setprompt", purpose: "Inspect or customize the AI system prompt, subject to available permissions." },
        { name: "?tell", purpose: "Send a direct message or announcement via the configured bot workflow." },
        { name: "?quote", purpose: "Return a random quote." },
        { name: "?test_error", purpose: "Exercise the error-handling/testing path." },
        { name: "?admin_promo", purpose: "Run the documented promotional/admin utility." },
        { name: "?clearhistory / ?clearchat / ?resetai", purpose: "Clear channel conversation history and start fresh." }
      ]
    }
  },
  {
    name: "ThreadForge MCP",
    slug: "threadforge-mcp",
    eyebrow: "Multi-model conversational MCP server",
    description: "A persistent multi-turn chat server with model selection/fallback, background context compression, GitHub-backed thread storage, and shared Markdown artifacts for connected agents.",
    tags: ["Python", "FastMCP", "MCP", "Gemini API", "httpx", "Markdown"],
    status: "Public prototype",
    href: "https://github.com/Aj-Niplex/ThreadForge-MCP",
    action: "View repository",
    details: {
      purpose: "An MCP server intended to turn a host AI's single chat/tool connection into access to a reusable conversational memory service. Unlike a one-shot Q&A tool, ThreadForge supports thread IDs, stored conversation history, selected models, compressed context, and artifacts that both ThreadForge and connected host agents can read and update.",
      features: [
        "True multi-turn conversations: callers can pass a thread_id to continue context or omit it to start a new thread.",
        "Thread discovery and history: list recent threads and retrieve a chosen thread's messages/summary.",
        "Model preference: set a per-thread model preference, or use random/explicit model selection as documented.",
        "Automatic model fallback: tries configured candidate models when an upstream model fails or times out.",
        "Background context compression: uses a cheaper model to maintain a compact summary when long history would overflow a context window.",
        "GitHub-backed persistence: stores JSON metadata/messages plus readable conversation Markdown through the GitHub REST API.",
        "Shared artifacts: save/list/get/update/delete notes, snippets, decisions, and other Markdown artifacts associated with a thread.",
        "Host-agent interoperability: artifacts are exposed through the same MCP tools so the host agent and ThreadForge can share context without each caller needing direct repository access.",
        "Standalone or downstream deployment: can run on its own or be exposed through a larger MCP gateway.",
        "MCP Inspector workflow: the README documents running with mcp dev server.py for local inspection.",
        "Provider configuration through environment variables: the server code reads Gemini key, GitHub token, storage repository/root, and model choices from the environment.",
        "FastMCP protocol wrapper: the project defines a named ThreadForge server with instructions explaining how clients should use chat and artifact tools."
      ],
      architecture: "server.py builds a FastMCP server. Tool calls reach conversation/thread helpers, which read/write JSON and Markdown through GitHub's contents API. Each thread is represented by metadata, message history, conversation.md, summary.md, and an artifacts directory. The model-routing layer selects candidate models, falls back on failures, and compresses long context using a cheaper model. Secrets are expected through environment configuration rather than hard-coded source constants.",
      workflow: [
        "A client connects to the ThreadForge MCP endpoint and invokes chat with a message plus an optional thread ID/model preference.",
        "ThreadForge loads the thread metadata and message history from the configured storage location; a missing thread begins with an empty history.",
        "The request is sent to the preferred or selected model. Failures can cause another candidate to be attempted.",
        "As history grows, a background/cheap-model compression path creates a shorter summary to preserve continuity within context limits.",
        "The current user/assistant exchange, summary, metadata, and Markdown conversation are persisted back to GitHub-backed storage.",
        "The client can call list/get thread tools later to resume the discussion, or use artifact tools to share durable notes and decisions.",
        "Other connected host agents call the same artifact tools, allowing them to reuse the stored artifacts through MCP."
      ],
      configuration: [
        "Python 3.10+ and dependencies managed via uv are documented in the README.",
        "Run uv sync, provide GEMINI_API_KEY, and run uv run python server.py for local use.",
        "Set a GitHub token with permission to read/write the configured storage repository; alternatively, deploy with securely configured host secrets where supported.",
        "THREADFORGE_STORAGE_REPO and THREADFORGE_STORAGE_ROOT customize where thread files live.",
        "GEMINI_API_KEY is read for model requests; current model preferences/candidates are defined in server.py and can be version-dependent.",
        "Use uv run mcp dev server.py for local MCP Inspector testing."
      ],
      limits: [
        "This is documented as a prototype. Model IDs and provider behavior can change and should not be treated as permanent availability guarantees.",
        "GitHub Contents API is used as a storage backend; repository API rate limits, request latency, write conflicts, permissions, and outages affect persistence.",
        "Thread messages and artifacts may contain sensitive content. Choose the storage repository's visibility/access controls carefully and don't place personal secrets in conversations.",
        "The source contains a hard-coded owner namespace for the storage API, so deployments are shaped around that account unless refactored; configure the repository/root and token accordingly.",
        "A multi-model fallback list is not the same as independent testing across every provider/model.",
        "Do not expose the MCP endpoint publicly without appropriate authentication, access restrictions, and quota controls for the deployment environment."
      ],
      tools: [
        { name: "chat", purpose: "Send a message and optionally continue a specific thread or choose a model." },
        { name: "list_threads", purpose: "List recent stored conversation threads." },
        { name: "get_thread", purpose: "Retrieve the history and summary for a thread." },
        { name: "save_artifact", purpose: "Create or replace a thread artifact such as a note, decision, or snippet." },
        { name: "list_artifacts", purpose: "List the artifacts saved for a thread." },
        { name: "get_artifact", purpose: "Read an artifact by filename." },
        { name: "update_artifact", purpose: "Replace an existing artifact body." },
        { name: "delete_artifact", purpose: "Delete a saved artifact." },
        { name: "set_model_preference", purpose: "Set a preferred model for the thread." }
      ]
    }
  },
  {
    name: "NiPlex Harness Site",
    slug: "niplex-harness-site",
    eyebrow: "Static documentation site",
    description: "The public static landing and documentation site for NiPlex Harness, including product docs and a copy-prompt workflow for AI-agent onboarding.",
    tags: ["HTML", "CSS", "JavaScript", "Cloudflare Pages", "Static site"],
    status: "Public",
    href: "https://github.com/Aj-Niplex/niplex-harness-site",
    action: "View repository",
    details: {
      purpose: "A lightweight public website that explains the NiPlex Harness product and provides documentation. The repository describes itself as a pure static V1 site deployed on Cloudflare Pages; advanced community features are outside the documented V1 scope.",
      features: [
        "Landing page introducing the phone-controlled personal AI-agent harness.",
        "Documentation index at /docs for installation, product information, stack, and agent-oriented instructions.",
        "Agent-ready page that exposes a copy-prompt workflow for giving another AI the intended context.",
        "Dedicated 404 page and redirect configuration for static-host routing.",
        "Robots.txt and sitemap.xml for crawl/indexing guidance.",
        "Static assets and CSS/JavaScript suitable for a host that serves files without a runtime application server.",
        "Versioned scope distinction: the README says V1 has no authentication, forum, or voting; those are later-version ideas, not current features."
      ],
      architecture: "The repository root contains HTML entry pages, CSS/JavaScript assets, a docs directory, an agent-ready page, a 404 document, a redirect rules file, robots.txt, and sitemap.xml. Pages are delivered as static resources by Cloudflare Pages; no database or server-side application is required for the documented V1 behavior.",
      workflow: [
        "A visitor opens the static landing page to learn what the harness does.",
        "The visitor navigates to /docs/ to read setup and product guidance.",
        "An AI-assisted visitor opens /agent-ready/ and copies the prepared prompt/context into their preferred assistant.",
        "The static host serves the requested page or the 404 fallback; robots.txt and sitemap.xml inform crawlers."
      ],
      configuration: [
        "The README names Cloudflare Pages and project name niplex-harness as the deployment target.",
        "The deployable site is kept at the repository root.",
        "The current repository is a static-site project; there is no documented app authentication or database setup for V1."
      ],
      limits: [
        "V1 is explicitly static-only according to README.md.",
        "Authentication, forum/community discussions, and voting are not included in V1.",
        "This site is documentation/marketing for the harness, not the agent runtime itself.",
        "Private planning notes are intentionally not replicated into this public site dossier."
      ]
    }
  },
  {
    name: "OpenDots",
    slug: "opendots",
    eyebrow: "Public upstream template / fork",
    description: "An attributed exploration of the OpenDots open-source template for persistent AI coworkers, Spaces, specialist Dots, computer tools, human review, voice, and Slack.",
    tags: ["TypeScript", "React", "CopilotKit", "AG-UI", "Agent UI"],
    status: "Public template · Attribution required",
    href: "https://github.com/Aj-Niplex/OpenDots",
    action: "View public repository",
    attribution: "OpenDots is described by its README as a template built with CopilotKit and AG-UI. This page does not claim that the upstream product or code originated with NiPlex.",
    details: {
      purpose: "OpenDots is an open-source starting point for building persistent AI coworkers, called Dots, that can move between text, calls, and Slack. Its README describes a template that a developer hosts and configures, not a turnkey hosted product. This portfolio labels it as an attributed template/fork rather than an original NiPlex product.",
      features: [
        "Spaces: work areas for documents with searchable pages, grid/list browsing, nested subpages, and a focused visual editor.",
        "Page editing: rich formatting, slash commands, undo/redo, Markdown source mode, autosave state, and protection against stale edits overwriting newer revisions.",
        "Specialist Dots: configure a name, role, instructions, permitted tools, and default destination Space for each assistant.",
        "Conversation-backed documents: save a conversation as a page and ask a specialist to create or revise content for a destination Space.",
        "Per-Dot computers: use separate computer services with persistent browser profile/workspace files where the computer services have been installed and connected.",
        "Computer panel: browser control, human takeover, files, terminal output, and activity display with browser/file/shell permissions configured per Dot.",
        "Human-in-the-loop review: pause a proposed page/draft for Approve & save or Decline before writing it into an authorized Space.",
        "Text and voice calls: the README describes realtime voice, a separate compute agent for longer work, call receipts, captions, mute controls, and a minimized call view.",
        "Slack connection: the README describes managed Slack channel integration, Dot mentions, threads, and an explicit workspace/user allowlist.",
        "Permissioned agent workflows: the experience centers on ask, inspect, approve, then save rather than silently writing all generated content.",
        "Service setup: requires separately configured CopilotKit Intelligence or supported local/self-hosted evaluation/deployment and optional computer/voice/Slack providers.",
        "Template-first customization: developers host the project and configure their own infrastructure, services, Dots, and tools."
      ],
      architecture: "The README presents a React/TypeScript agent workspace built with CopilotKit and AG-UI. Spaces provide the document/library layer; Dots represent configured specialist agents; conversation threads and pages connect chat with editable artifacts. Optional computer services expose a browser/files/terminal through permission-scoped per-Dot access. Human review gates page-saving actions. Voice and Slack are integrations that need separate provider/connection setup.",
      workflow: [
        "Deploy the template and configure CopilotKit Intelligence in hosted, local evaluation, or licensed self-hosted mode.",
        "Create a Space and add work pages; use the library and editor for direct document work even before conversation services are configured.",
        "Configure a specialist Dot with a role, instructions, allowed tools, and target Space.",
        "Ask the Dot to research or draft. Inspect source links, results, and any computer/tool actions shown in the conversation.",
        "When the Dot proposes a saved page, review the human-in-the-loop card and approve or decline; an approved page is written to an authorized Space.",
        "Optionally connect computer services for browser/file/terminal operations, voice providers for realtime calls, and Slack through a managed channel integration."
      ],
      configuration: [
        "This is a template and requires its own deployment and service configuration; it is not a hosted NiPlex service.",
        "Read docs/SETUP.md and docs/COMPUTERS.md for service setup and computer-service requirements.",
        "Conversation features require CopilotKit Intelligence; the README lists hosted use, local Docker evaluation, or licensed self-hosting.",
        "Computer tools require the separately built/pinned computer services; an unconfigured template does not run shell commands on the user's host.",
        "Voice requires separate provider configuration, and Slack requires connecting the managed integration and configuring access restrictions."
      ],
      limits: [
        "The repository labels itself alpha/early development; the README distinguishes locally verified behavior from connected-service testing.",
        "Features dependent on CopilotKit Intelligence, computer services, realtime voice, and Slack will not work until their respective services are configured.",
        "This is a public template/fork that credits CopilotKit and AG-UI; attribution and upstream license terms must be preserved.",
        "This page does not present upstream OpenDots as an original NiPlex product.",
        "Review service credentials, per-Dot permissions, allowlists, and human approval behavior before enabling tools that can browse, write files, or execute commands."
      ]
    }
  }
];

export const kaizenPreviewFeatures = [
  { title: "Chat-first control", description: "A personal assistant controlled from messaging platforms with access gated to allowed users." },
  { title: "Provider configuration", description: "A setup flow for configuring supported providers or compatible endpoints without rewriting the app." },
  { title: "Human approval", description: "Riskier actions can pause for an approve-or-deny decision instead of running silently." },
  { title: "Bounded code execution", description: "Python tasks can run through a resource-limited execution path, with credentials kept out of visible output." },
  { title: "Persistent memory", description: "Global/session notes, lightweight relationship links, and searchable saved context." },
  { title: "Files and knowledge vault", description: "A constrained workspace for files and Markdown notes, including Obsidian-friendly vaults." },
  { title: "Reusable skills", description: "Small instruction files for repeated tasks, intended to be reviewed and loaded deliberately." },
  { title: "Web research", description: "Search and page reading with basic safeguards against prompt-injection patterns and unsafe destinations." },
  { title: "Scheduled read-only jobs", description: "Background retrieval and reporting without unrestricted unattended write or execution." },
  { title: "Sub-agents", description: "Delegate a focused task to a helper and collect its report." }
];

export const publicPortfolioContext = [
  "Adarsh Jaiswal (NiPlex) is an independent developer focused on AI tools, agent workflows, developer tooling, and open source.",
  "Niplex Research AI is a public Obsidian plugin for bounded vault research, evidence-grounded answers, local Markdown history, skills, and approval-oriented edits.",
  "NiPlex Harness is a public personal agent harness controlled through Discord or Telegram, with provider setup, sandbox/approval workflows, Markdown vault, memory, skills, web search, and terminal tools.",
  "Rei-kun-Bot is a public Python Discord bot with multi-model fallback, persona continuity, conversation memory, study resources, emoji tools, diagnostics, and admin utilities.",
  "ThreadForge MCP is a public prototype for persistent multi-turn threads, model routing/fallback, compressed context, and shared artifacts.",
  "NiPlex Harness Site is a static landing/docs site; V1 has no authentication, forum, or voting.",
  "OpenDots is an attributed public template/fork built with CopilotKit and AG-UI, not an original NiPlex product.",
  "KaizenManas / NiPlex Harness future direction: chat-first control, provider configuration, action approvals, bounded code execution, searchable memory, constrained files/vault, skills, web research, scheduled read-only jobs, and sub-agents.",
  "Never claim unfinished features are production-ready. Do not disclose private repositories, source code, credentials, saved user data, personal notes, or internal implementation details. When asked about private work, say the public portfolio only documents public-facing information."
].join(" ");
