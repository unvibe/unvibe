# Unvibe Architecture

## What Technical Problems Does Unvibe Solve?

Unvibe is designed to address the core challenges of integrating AI-powered development tools directly into a user's local environment, without sacrificing privacy, flexibility, or extensibility. Unlike cloud-based assistants that require uploading project files or exposing private code, Unvibe runs locally in the user's project directory—right alongside files like `.bashrc`. This gives Unvibe seamless access to the operating system: it can read local files, execute shell commands, and interact with the full environment available to the user.

This local-first approach eliminates the need to upload source code or sensitive files to third-party services. By default, all operations are performed locally. For large language models (LLMs), Unvibe flexibly integrates both cloud providers (such as OpenAI, Gemini, and Anthropic) and local LLMs (like Ollama), allowing users to choose the best fit for their privacy and workflow needs.

Unvibe is also highly customizable and adapts to the specific project it is opened in, providing tailored tools and workflows for any tech stack or directory structure.

## Root Folder Overview

Unvibe's codebase is organized into the following root folders:

- `app/`: Contains the frontend application code, including UI, modules, and routes.
- `server/`: Houses backend logic, APIs, database integration, and core server components.
- `plugins/`: Includes all first-party and third-party plugins that extend Unvibe's functionality.
- `themes/`: Defines UI themes and related assets for customizing the application's appearance.
- `lib/`: Shared utilities, UI components, and helper functions used across the project.
- `environment/`: Manages environment-specific logic and configuration.
- `drizzle/`: Database migration scripts and metadata for Drizzle ORM.

Other files and folders at the root level support configuration, scripts, and project metadata.

#### app/ Folder Structure

- `modules/`: Contains feature-specific frontend modules and reusable components.
- `public/`: Static assets such as images and icons used by the frontend.
- `root.tsx`: The main React entry point for the frontend application.
- `routes/`: All frontend route definitions, layouts, and page components.
- `routes.ts`: Central configuration for application routes.
- `app.css`: Global CSS styles for the frontend, including the Tailwind theme configuration and registration (following the new Tailwind CSS v4 approach).

#### server/ Folder Structure

- `api/`: Implements backend API endpoints and related logic.
- `db/`: Database integration, schema definitions, and access utilities.
- `index.ts`: Main entry point for the backend server.
- `llm/`: Logic for interacting with large language models (LLMs), including context and model management.
- `project/`: Handles project-specific operations such as caching, ignoring files, and scripts.
- `s3/`: S3 storage integration for handling file uploads or remote assets.
- `websocket/`: Implements real-time communication and WebSocket server logic.

#### plugins/ Folder Structure

- `_types/`: Shared type definitions and contracts for plugin interfaces.
- Other folders (e.g., `aws/`, `core/`, `docker/`, etc.): Each implements a specific plugin, often with both server and client logic.
- `plugins.server.ts` / `plugins-client.ts`: Register and compose available plugins for server and client environments.
- `README.md`: Documentation and usage patterns for the plugin system.

#### themes/ Folder Structure

- `src/`: Contains all theme source files organized by theme name.
- `meta.tsx`: Acts as the glue between theme metadata and the application; included in the root layout.
- `registery.ts`: Registers and exports available themes for use in the app.
- `type.ts`: Type definitions for theme contracts.

#### lib/ Folder Structure

- `browser/`, `core/`, `next/`, `react/`, `server/`, `ui/`: Shared utilities, hooks, and UI components for use across the project, grouped by purpose or technology.
- `constants.ts`: Global constants used throughout the codebase.

#### environment/ Folder Structure

- `index.ts` and `server.ts`: Entry points for environment-specific configuration and logic.

#### drizzle/ Folder Structure

- Contains migration scripts and metadata used by Drizzle ORM to handle database migrations and schema state.
