# Plugin System

This directory contains all server and client plugins used in the application. The plugin system provides a flexible, modular way to extend both backend and frontend behaviors for domains such as code management, Git operations, language tooling, formatting, diagnostics, and UI integrations.

---

## Contents

- [Overview](#overview)
- [Plugin Types](#plugin-types)
  - [Server Plugins](#server-plugins)
  - [Client Plugins](#client-plugins)
- [Plugin Structure](#plugin-structure)
- [How Plugins Work](#how-plugins-work)
- [How to Add a Plugin](#how-to-add-a-plugin)
- [Available Plugins](#available-plugins)
- [Type Definitions](#type-definitions)
- [Contributing](#contributing)

---

## Overview

A **plugin** in this system consists of optional server-side and client-side modules, each defined by strongly typed interfaces. Plugins can provide new tools (commands), APIs, virtual file handlers, source code diagnostics, and UI components. This design makes the application extensible for a wide range of code workflows and assistant actions.

---

## Plugin Types

### Server Plugins

A **ServerPlugin** must export the following (see [`plugins/_types/plugin.server.ts`](./_types/plugin.server.ts)):

- `id`: Unique string identifier.
- `detect(baseProject)`: Detects whether this plugin is relevant for the given project (async, returns boolean).
- `setup(baseProject)`: Augments the project with plugin-specific info and capabilities (async, mutates `project.plugins`).
- `createContext(baseProject)`: Returns objects describing tools and system parts for agent and UI context (async).
- `api`: Object containing backend methods relevant to the plugin (required).
- Optional: `tools`: Record of tool modules for LLM/action use.
- Optional: `sourceCodeHooks`: Array of source code diagnostics or transforms (see below).

#### Source Code Hooks
- `diagnostic`: Function to analyze code/files and return diagnostics.
- `transform`: Function to rewrite or auto-fix code/files.

#### Example
```ts
import { ServerPlugin } from '../_types/plugin.server';
export const Plugin: ServerPlugin = {
  id: 'my-plugin',
  detect: async (project) => {/* logic */},
  setup: async (project) => {/* logic */},
  createContext: async (project) => ({
    tools: {/* toolName: LLMToolModule */},
    systemParts: {/* key: string */},
  }),
  api: {/* backend functions */},
  tools: {/* toolName: LLMToolModule */},
  sourceCodeHooks: [/* hooks */],
};
```

### Client Plugins

A **ClientPlugin** must export the following (see [`plugins/_types/plugin.client.ts`](./_types/plugin.client.ts)):

- `id`: Unique string identifier.
- `components`: Object for UI/UX extension points. Slots include:
  - `actionbar.component`: Custom sidebar/actionbar component.
  - `assistant.proposal.actions`: Custom actions for assistant proposals.
  - `assistant.proposal.pathDiagnostics`: Diagnostics UI for file proposals.

#### Example
```ts
import { ClientPlugin } from '../_types/plugin.client';
export const Plugin: ClientPlugin = {
  id: 'my-plugin',
  components: {
    actionbar: {
      component: MyActionbarComponent,
    },
    assistant: {
      proposal: {
        actions: {/* ... */},
        pathDiagnostics: {/* ... */},
      },
    },
  },
};
```

---

## Plugin Structure

Each plugin typically includes:
- `plugin.server.ts` (exports a `ServerPlugin`)
- `plugin.client.ts` (exports a `ClientPlugin`)
- Supporting files/folders: `/tools/`, `/api/`, `/components/`, etc., as needed

Plugins are registered centrally:
- Server: `plugins/plugins.server.ts`
- Client: `plugins/plugins.client.ts`

---

## How Plugins Work

- On project parse/setup, each plugin's `detect` function runs to determine applicability.
- If detected, `setup` mutates/augments the project object (`project.plugins`).
- `createContext` is called to aggregate tools and system context for LLM agents and UI.
- Tools are made available to LLM/agent actions and tool runners.
- Source code hooks are used for diagnostics and auto-fixes.
- Client plugins inject UI/UX via registered components to actionbars, proposal actions, and diagnostics.

---

## How to Add a Plugin

1. Create a new folder under `plugins/` (e.g. `plugins/my-plugin/`).
2. Add `plugin.server.ts` and/or `plugin.client.ts`, exporting `Plugin` as shown above.
3. Follow type contracts from [`plugins/_types/`](./_types/).
4. Register your plugin in `plugins/plugins.server.ts` and/or `plugins/plugins.client.ts`.
5. Add tools, virtual file handlers, and components as needed.

---

## Available Plugins

- **core**: Core project and workspace logic, file system, shell, and general tools.
- **git**: Git detection, status, tooling, and UI.
- **github**: GitHub API integration, PRs, issues, etc.
- **typescript**: TypeScript project detection, tools, and formatting.
- **go**: Go project tooling.
- **npm**: NPM/Yarn/PNPM package manager detection and scripts.
- **eslint**: Linting and diagnostics.
- **prettier**: Formatting tools.
- **turborepo**: Monorepo/workspace detection and support.
- **unvibe**: Custom workspace/agent tools.

Each plugin resides in its own folder under `plugins/`.

---

## Type Definitions

- **ServerPlugin**: [`plugins/_types/plugin.server.ts`](./_types/plugin.server.ts)
- **ClientPlugin**: [`plugins/_types/plugin.client.ts`](./_types/plugin.client.ts)
- **ToolConfig/CreateTool**: [`plugins/_types/tools.ts`](./_types/tools.ts)

---

## Contributing

- Always use the provided type definitions.
- Keep server and client logic separate.
- Test your plugin in multi-plugin environments.
- Follow established patterns in `core`, `git`, and `typescript` plugins for best practices.
