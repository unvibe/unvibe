# Contributing to Unvibe

Welcome to the Unvibe codebase! This document is your technical guide to extending, improving, and contributing new features or plugins to Unvibe.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Development Setup](#development-setup)
- [Plugin System & Extension Points](#plugin-system--extension-points)
- [Adding Plugins, Tools, and API Endpoints](#adding-plugins-tools-and-api-endpoints)
- [LLM Context & Workflows](#llm-context--workflows)
- [Structured Output Workflow](#structured-output-workflow)
- [Testing & Type Safety](#testing--type-safety)
- [Resources](#resources)

---

## Architecture Overview

Unvibe is built for extensibility, privacy, and LLM-powered workflows. Its core pieces are:

- **Frontend:** Vite, React, React Router, React Query
- **Backend:** Node.js, custom API and WebSocket server, Drizzle-ORM (SQLite)
- **Plugins:** First-class, type-safe (server and client)
- **LLM Context:** Dynamically composed for every request, with no agent black box

For a full architectural breakdown, see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Development Setup

1. **Clone the repo:**
   ```bash
   gh repo clone unvibe/unvibe ~/projects/unvibe
   cd ~/projects/unvibe
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up your .env** (see [README.md](./README.md) for variables)
4. **Push database migrations:**
   ```bash
   npx drizzle-kit push
   ```
5. **Run servers:**
   - Frontend: `npm run dev:client`
   - Backend: `npm run dev:server`
   - Both: `npm run dev`

---

## Plugin System & Extension Points

Unvibe is plugin-first. You can add features, diagnostics, tools, UI, and even new LLM models by creating plugins.

**Key extension points:**

| Extension Type | Where to Add                                      |
| -------------- | ------------------------------------------------- |
| Plugin         | `plugins/my-plugin/plugin.server.ts`/`.client.ts` |
| LLM Model      | `server/llm/models/`                              |
| Tool           | `plugins/_types/tools.ts` + in your plugin        |
| API Endpoint   | `server/api/endpoints/`                           |
| UI Component   | `lib/ui/` or plugin's client/components/ dir      |
| Type Def       | `plugins/_types/`                                 |

**Plugin Lifecycle:**

- `detect` → `setup` → `createContext`
- Plugins can augment project context, register tools, diagnostics, UI, etc.

---

## Adding Plugins, Tools, and API Endpoints

### Add a New Plugin

1. Create files in `plugins/my-plugin/`:
   ```ts
   // plugins/my-plugin/plugin.server.ts
   import type { ServerPlugin } from '../_types/plugin.server';
   export const Plugin: ServerPlugin = {
     id: 'my-plugin',
     description: 'Describe your plugin',
     metadata: {
       hooks: [],
       tools: [],
       system: [],
     },
     detect: async (project) => {
       // Return true if your plugin should be enabled for this project
       return true;
     },
     setup: async (project) => {
       // Optionally augment the project object
       return project;
     },
     createContext: async (project) => ({
       tools: {},
       systemParts: {},
     }),
     // Optionally: sourceCodeHooks: []
   };
   ```
2. Register the plugin in `plugins/plugins.server.ts` and/or `.client.ts`.

### Add a Tool

- Define via `make()` in `plugins/_types/tools.ts`, then add to your plugin's `tools` property.

### Add an API Endpoint

- Place file in `server/api/endpoints/`, import into the API registry (via `server/api/endpoints/index.ts`).

---

## LLM Context & Workflows

Every LLM run (chat, codegen, etc) dynamically assembles context from:

- Project state
- Plugin-provided context, tools, and diagnostics
- User input

**No agent abstraction:** Context and tools are composed per-request from the project and plugins.

**LLM Pipeline:**

```
[User Action] → [API Endpoint] → [Parse Project + Plugins]
  → [Build LLM Context] → [LLM Runner]
  → [Store/Update DB] → [WebSocket Event] → [UI Update]
```

---

## Structured Output Workflow

All significant changes (features, questions, refactors) use the **structured output** system.

Structured output is a strict JSON object (see `server/llm/structured_output/`) that describes file changes, shell scripts, and actions in a consistent, type-safe way.

**Example structured output:**

```json
{
  "message": "Summary of the proposed change.",
  "replace_files": [{ "path": "./src/index.js", "content": "// ..." }],
  "delete_files": [{ "path": "./config/old-config.json" }],
  "edit_ranges": [
    {
      "path": "./src/utils.js",
      "edits": [{ "start": 10, "end": 12, "content": "..." }]
    }
  ],
  "shell_scripts": ["bash setup.sh"]
}
```

- The `message` concisely summarizes the intent.
- Only files listed in `replace_files` or `delete_files` are affected.
- Shell scripts must be explicitly listed and only for project-mutating changes.
- For full schema and rules, see [`server/llm/structured_output/instructions.md`](./server/llm/structured_output/instructions.md).

---

## Testing & Type Safety

- Type boundaries are strictly enforced; always run type checks before submitting PRs
- Plugins should include their own tests
- Editing shared types? Run full type checks and update all contracts

---

## Resources

- [ARCHITECTURE.md](./ARCHITECTURE.md): Architecture, extension points, structured output system
- `plugins/README.md`: Plugin patterns, canonical examples
- `plugins/_types/`: Type contracts for plugins/tools
- `plugins/core`: Canonical plugin reference
- `server/llm/structured_output/`: Structured output schema and instructions

---

**Thank you for contributing to Unvibe!**
