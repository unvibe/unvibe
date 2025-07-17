# ARCHITECTURE.md

## Project Purpose & Vision

Unvibe aims to make creating and managing complex projects easy, goal-oriented, and collaborative, without compromising on quality, type safety, or extensibility. Its vision is to provide a robust, plugin-first architecture where humans and LLM-driven logic seamlessly co-create, extend, and maintain codebases, unlocking new levels of project understanding and automation.

---

## Quickstart: System at a Glance

- **Frontend**: Vite, React, React Router, React Query
- **Backend**: Node.js, custom API + WebSocket server, Drizzle-ORM (SQLite)
- **Plugins**: First-class, type-safe, support both server and client
- **LLM-driven workflows**: Context-aware, dynamically composed
- **Collaboration**: Real-time, WebSocket-powered

---

```
+----------------+        +-----------------------+        +------------------+
|    Frontend    |<------>|    API/WebSocket     |<------>|      Plugins      |
| (React UI)     |        |   (Node.js Server)   |        | (Server & Client) |
+----------------+        +-----------------------+        +------------------+
        ^                        ^        ^                        ^
        |                        |        |                        |
        |                        |        |                        |
        |   +-------------------+|        |+------------------+    |
        +---|    Database/LLM    |<-------+|   Project Model  |----+
            +-------------------+           +-----------------+
```

---

## 1. Principles

- **Extensibility by Design**: Plugin-first, minimal friction for new integrations.
- **Type Safety Throughout**: Shared, strong typing from end to end (frontend ↔ backend ↔ plugins).
- **Real-time Collaboration**: WebSocket/event-driven updates.
- **LLM Context Composition**: No agent abstraction; context is composed from plugins and project state.

---

## 2. High-level Folders

| Folder     | Purpose                                               |
| ---------- | ----------------------------------------------------- |
| `app/`     | React Router app entry, routes, pages, layouts        |
| `modules/` | UI modules/components, layouts, providers, threads    |
| `server/`  | Backend: APIs, WebSocket, core logic, DB, LLM runners |
| `plugins/` | Modular plugins (server/client), each in own folder   |
| `lib/`     | Shared utilities                                      |

---

## 3. Backend Layer

### API System

- Declarative endpoints in `server/api/`, grouped by feature.
- Type-safe fetch hooks for frontend via `server/api/client/`.

### WebSocket

- Real-time, strongly-typed events: `server/websocket/server.ts`.
- Redux-style event contracts, e.g. `StructuredChatMessage<T>`.

### Database

- SQLite via Drizzle-ORM (`server/db/`).
- Typed schema for threads, messages, projects, etc.

### LLM & Context Layer

- LLM models: `server/llm/models/`, unified config.
- Runners for each provider: `server/llm/runners/`.
- Plugins and project parsing compose the full LLM context and tools for each run.
- There is no agent abstraction; instead, the context and behavior are dynamically assembled from plugins, project state, and UI input for every LLM call.

#### LLM Pipeline (simplified):

```
[User Action] -> [API Endpoint] -> [Parse Project + Plugins] ->
  [Build LLM Context] -> [LLM Runner] ->
  [Store/Update DB] -> [WebSocket Event] -> [UI Update]
```

---

## 4. Plugin System

- **Server Plugins**: Project detection, code diagnostics, tools, API.
- **Client Plugins**: UI components/actions.
- **Lifecycle**: `detect` → `setup` → `createContext`
- Registered centrally, can augment projects, tools, and context dynamically.

### Plugin Lifecycle Diagram

```
[Parse Project]
     |
     v
[Plugins: detect()]
     |
     v
[Plugins: setup()]
     |
     v
[Plugins: createContext()]
     |
     v
[LLM Context uses augmented project]
```

---

## 5. Project/Workspace Model

- Project is parsed, plugins run, object is augmented.
- Supports monorepo or single-repo structures.
- Used by LLM context logic and UI for context-aware features.

---

## 6. Frontend (Vite, React, React Router)

- Entrypoint: `app/root.tsx` sets providers.
- UI modules in `modules/` (UI, layout, threads, providers).
- Pages define route logic using React Router config in `app/routes.ts` or similar.
- State/data flow via React Query.
- SSR enabled via Vite and React Router configuration (`vite.config.ts`, `react-router.config.ts`).

---

## 7. Key Extension Points (Summary Table)

| Extension Type | Where to Add                                      |
| -------------- | ------------------------------------------------- |
| Plugin         | `plugins/my-plugin/plugin.server.ts`/`.client.ts` |
| LLM Model      | `server/llm/models/`                              |
| LLM Runner     | `server/llm/runners/`                             |
| Tool           | `plugins/_types/tools.ts` + plugin's `tools` prop |
| API Endpoint   | `server/api/endpoints/`                           |
| UI Component   | `modules/ui/`, plugin's client component slots    |
| Type Def       | `plugins/_types/`                                 |

---

## 8. Data Flow Example: Threaded Conversation

1. User navigates to a thread page. `ThreadDetails` module fetches thread (`GET /threads/details`).
2. Messages are displayed; input posts a new message via the assistant.
3. Mutation (`POST /threads/continue`):
   - Backend parses project, builds LLM context from project/plugins, sends to LLM, stores/updates DB, broadcasts via WebSocket.
   - UI updates in real-time.

### Data Flow ASCII

```
[UI Input] -> [API] -> [Project/Plugins] -> [LLM Context] -> [LLM Runner] -> [DB] -> [WebSocket] -> [UI]
```

---

## 9. Extensibility & Type Safety

- Plugins augment projects, tools, diagnostics, API, UI.
- Shared types in `plugins/_types/` ensure contract alignment.
- End-to-end contract via typed fetch hooks:

```ts
import { useAPIQuery } from '@/server/api/client';
const { data } = useAPIQuery('GET /threads/details', { id });
```

---

## 10. Configuration & Deployment

- Config: `vite.config.ts`, `.env`, assets in `app/`.
- Deployment: Vite-powered SSR app + separate WebSocket server (port 3006 default).
- Env: DB URL, WebSocket port, API keys.
- For scale: deploy WebSocket server separately.

---

## 11. Technology Stack

| Layer    | Key Tech                               |
| -------- | -------------------------------------- |
| Frontend | Vite, React, React Router, React Query |
| Backend  | Node.js, Drizzle-ORM, WebSocket (Node) |
| Types    | TypeScript (shared contracts)          |
| Plugins  | Modular via `/plugins/`                |
| DB       | SQLite (Drizzle-ORM), S3 (optional)    |

---

## 12. Testing & Contributor Notes

- Functional patterns, typed boundaries for easy testing.
- Plugins should include their own tests.
- Editing shared types can break contracts—always run type checks.

---

## 13. How-To: Extending the System

### Add a New Plugin

1. Create plugin files in `plugins/my-plugin/` (see code sample below).
2. Register in `plugins/plugins.server.ts` &/or `.client.ts`.
3. Implement hooks: `detect`, `setup`, `createContext`, and (optionally) tools/APIs.

```ts
// plugins/my-plugin/plugin.server.ts
import type { ServerPlugin } from '../_types/plugin.server';
export const Plugin: ServerPlugin = {
  id: 'my-plugin',
  description: 'Short summary',
  metadata: { hooks: [], tools: [], system: [] },
  detect: async (project) => true,
  setup: async (project) => project,
  createContext: async (project) => ({ tools: {}, systemParts: {} }),
};
```

### Add a New LLM Model

1. Add config to `server/llm/models/my-custom-model.ts`.
2. Register in `server/llm/models/index.ts`.

### Add Tools

- Define tool via `make()` in `plugins/_types/tools.ts`, add to plugin's `tools` property.

### Add API Endpoints

- Place endpoint in `server/api/endpoints/`, import into API registry.

---

## 14. Diagrams: Plugin & LLM Context Interactions

### Plugin Registration Workflow

```
[plugins/plugins.server.ts] <---- Registers ---- [plugin.server.ts]
[plugins/plugins.client.ts] <---- Registers ---- [plugin.client.ts]
```

### LLM-Plugin Interaction

```
[LLM Context] <--- gets tools/system/context from --- [Plugins]
   |
   v
[LLM Runner]
```

---

## 15. Gotchas & Contributor Tips

- Plugin/tool registration order matters for type contracts.
- LLM context is functional, not class-based.
- WebSocket events are required for real-time UI updates.
- Editing shared types? Run type checks and update all contracts.

---

## 16. Structured Output Workflow (JSON-based Change System)

All significant changes, questions, or analyses are made using a structured output JSON object. This ensures:

- **Type safety**: Each structured output abides by a strict schema, facilitating validation and automation.
- **Atomicity**: Each structured output is self-contained and unambiguous.
- **Traceability**: Structured outputs can be tracked, versioned, and discussed.

**Example structure:**

```json
{
  "message": "Summary of the proposed change.",
  "replace_files": [{ "path": "string", "content": "string" }],
  "delete_files": [{ "path": "string" }],
  "shell_scripts": ["optional_shell_command"]
}
```

- Only files listed in `replace_files` or `delete_files` are affected.
- Shell script execution must be explicitly requested.
- All structured outputs are reviewed, merged, or discussed via this system (including LLM-driven ones).
- See [`server/llm/structured_output/instructions.md`](./server/llm/structured_output/instructions.md) for the schema and requirements.

---

## 17. Glossary

| Term/Acronym      | Definition                                                                |
| ----------------- | ------------------------------------------------------------------------- |
| LLM               | Large Language Model                                                      |
| Plugin            | Modular extension point, adds features, tools, or UI                      |
| Structured Output | Structured JSON object describing a change, question, or analysis         |
| Type Safety       | Guarantee that data structures and contracts are consistent and validated |
| WebSocket         | Protocol for real-time, bidirectional communication                       |
| Drizzle-ORM       | TypeScript ORM for SQL databases                                          |
| Thread            | Conversation flow (messages, actions) between users and/or LLM logic      |

---

## 18. Roadmap & Open Questions

### Roadmap (as of now):

- Expand plugin marketplace for code analysis, generation, and tooling
- Broaden LLM provider support and capabilities
- Enhance structured output review workflows (e.g. via UI)
- Improve onboarding and documentation for contributors and LLMs
- Add more real-world project templates and extensible blueprints

### Open Questions

- How to best scale type safety as plugins proliferate?
- What are the most valuable new workflows to automate?
- How can real-time collaboration be further improved?
- What features would make LLM-driven workflows even more autonomous and insightful?

---

**See also:**

- `plugins/README.md` (plugin patterns and examples)
- `plugins/_types/` (type contracts)
- `plugins/core` (canonical plugin)
- `server/llm/structured_output/instructions.md` (structured output schema and requirements)
