# Enterprise AI Service Dev Tools and Skills

Last checked: 2026-06-24

This file is the first curated tool and Skill pool for building enterprise AI service projects such as the Youyixing intelligent quote system.

## Selection Rule

Use tools that help with one of these jobs:

- Build customer-facing or internal AI tools faster.
- Connect APIs, spreadsheets, CRM, Feishu/Lark, GitHub, web pages, and local data.
- Test web apps and workflows before delivery.
- Build RAG / knowledge-base features for customer files.
- Observe, evaluate, and debug LLM behavior in production-like workflows.
- Turn repeated development workflows into reusable Skills.

Avoid installing large tool collections blindly. Pick the smallest tool or Skill for the current project problem.

## First Batch: Install Or Keep Ready

### Agent Skills

| Name | Source | Use For | Priority |
|---|---|---|---|
| `skill-creator` | https://github.com/anthropics/skills | Turn proven workflows into reusable Skills. | P0 |
| `mcp-builder` | https://github.com/anthropics/skills | Build MCP servers for custom customer data/tools. | P0 |
| `webapp-testing` | https://github.com/anthropics/skills | Test local web apps and browser workflows. | P0 |
| `frontend-design` | https://github.com/anthropics/skills | Improve UI quality for customer-facing tools. | P1 |
| `codebase-onboarding` | https://github.com/affaan-m/ECC | Quickly understand an unfamiliar codebase before editing. | P0 |
| `code-tour` | https://github.com/affaan-m/ECC | Explain architecture and key files in a repo. | P1 |
| `browser-qa` | https://github.com/affaan-m/ECC | Browser QA checks for web tools. | P0 |
| `api-design` | https://github.com/affaan-m/ECC | Design stable internal APIs and integration boundaries. | P0 |
| `database-migrations` | https://github.com/affaan-m/ECC | Handle schema changes safely. | P1 |
| `docker-patterns` | https://github.com/affaan-m/ECC | Package/deploy customer tools repeatably. | P1 |

### Skill Managers and Directories

| Name | Source | Use For | Priority |
|---|---|---|---|
| Anthropic Agent Skills | https://github.com/anthropics/skills | Official Skill baseline and examples. | P0 |
| ECC | https://github.com/affaan-m/ECC | Large engineering Skill library. Pull only specific Skills. | P1 |
| awesome-claude-code | https://github.com/hesreallyhim/awesome-claude-code | Find Skills, hooks, commands, plugins. | P1 |
| antigravity-awesome-skills | https://github.com/sickn33/antigravity-awesome-skills | Large installable Skill catalog. Use as search pool, not bulk install. | P2 |
| skills-manager | https://github.com/EfanWang/skills-manager | Manage/install/update Skills if local Skill count grows. | P2 |
| claude-skillify | https://github.com/0xMH/claude-skillify | Convert a finished workflow into a Skill. | P1 |
| skill-test-skill | https://github.com/youngfreeFJS/skill-test-skill | Check Skill quality/compliance before reuse. | P1 |

## MCP Tools For Development

| Tool | Source | Use For | Priority |
|---|---|---|---|
| GitHub MCP Server | https://github.com/github/github-mcp-server | Let agents inspect/manage repos, issues, PRs. | P1 |
| Playwright MCP | https://github.com/microsoft/playwright-mcp | Browser automation and UI testing. | P0 |
| Firecrawl MCP Server | https://github.com/firecrawl/firecrawl-mcp-server | Web scraping/search for public site research. | P1 |
| Context7 MCP variants | Search: `context7 mcp` | Up-to-date programming docs. Verify package before install. | P2 |
| n8n MCP / workflow builders | Search: `n8n mcp workflow builder` | Build and manage automation workflows with AI assistance. | P1 |

## Enterprise AI Service Tool Stack

### Workflow and App Builders

| Tool | Source | Use For | Priority |
|---|---|---|---|
| Dify | https://github.com/langgenius/dify | Agentic workflow apps, customer demos, internal AI apps. | P0 |
| n8n | https://github.com/n8n-io/n8n | Workflow automation, integrations, customer operations automations. | P0 |
| Flowise | https://github.com/FlowiseAI/Flowise | Visual AI agents and quick prototypes. | P1 |

### RAG and Knowledge Base

| Tool | Source | Use For | Priority |
|---|---|---|---|
| LlamaIndex | https://github.com/run-llama/llama_index | Document agents, RAG, OCR-oriented data workflows. | P0 |
| Haystack | https://github.com/deepset-ai/haystack | Production RAG pipelines with explicit retrieval/control. | P1 |
| Qdrant | https://github.com/qdrant/qdrant | Vector database for production-like semantic search. | P1 |
| Chroma | https://github.com/chroma-core/chroma | Lightweight local vector search/prototypes. | P1 |

### Agents, SDKs, and Model Gateway

| Tool | Source | Use For | Priority |
|---|---|---|---|
| LangGraph | https://github.com/langchain-ai/langgraph | Durable multi-step agents and stateful workflows. | P1 |
| LiteLLM | https://github.com/BerriAI/litellm | Multi-model gateway, cost tracking, retries, load balancing. | P0 |
| Vercel AI SDK | https://github.com/vercel/ai | TypeScript AI apps, streaming UI, Next.js AI products. | P1 |

### Observability and Evaluation

| Tool | Source | Use For | Priority |
|---|---|---|---|
| Langfuse | https://github.com/langfuse/langfuse | Prompt management, traces, datasets, evals, cost/latency metrics. | P0 |

## Recommended Default Stack For Youyixing Quote System

Start small:

1. App code in this repo.
2. Frontend/backend stack decided after code inventory.
3. LiteLLM only if multiple model providers are needed.
4. Langfuse once real prompt/API traces need debugging.
5. Playwright MCP or local Playwright for UI smoke tests.
6. n8n only for external workflow automation, not core quote calculation.
7. Dify / Flowise only for prototype/demo workflows, not the core pricing engine unless proven useful.

For the first development window, use:

- `codebase-onboarding`
- `api-design`
- `webapp-testing`
- `browser-qa`

Then decide whether the quote system needs:

- a custom app,
- an n8n workflow,
- a Dify workflow,
- or a hybrid.

## Watchouts

- Do not put private customer data, API keys, or raw quote sheets into public GitHub.
- The current GitHub repo is public. If real customer data or business rules become sensitive, make it private before adding them.
- Avoid using large platforms just because they are popular. For pricing logic, plain code plus tests may beat a visual workflow tool.
- Install Skills after the workflow proves useful. Do not bulk install giant catalogs.

