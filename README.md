# Unvibe

> **Your local AI coding copilot, powered by plugins**

## Quick Start

Just run:

```bash
npx unvibe
```

No install, no configuration. Unvibe launches a local web app and you’re ready to go!

---

## What is Unvibe?

Unvibe is a local web application that brings LLM (AI assistant) workflows directly to your projects and files. It runs on your machine, with _the same read access as you_—so it can see your code, docs, and project structure. When writing or changing files, Unvibe **always asks for your permission first**.

Key features:

- **Local-first:** Your code and data never leave your machine by default
- **Web-based UI:** Clean, focused experience in your browser
- **Plugin-powered:** Add context, tools, and smarts with plugins (detects frameworks, linters, docs, test tools, and more)
- **Extensible:** Add your own tools and plugins, or use the growing library

---

## Why Unvibe?

- **Pluggable LLM system:** Easily enhance the AI’s abilities by enabling/disabling plugins
- **Smarter context:** Plugins automatically detect your tech stack and project files, giving the AI deeper insight
- **Tools at your fingertips:** Run diagnostics, codegen, tests, or custom tools—right from the UI
- **Privacy-first:** Unvibe only writes files or runs scripts with your explicit permission
- **Works with your workflow:** Designed for real projects, real code, and real privacy

---

## What can I do with Unvibe?

- Chat with an LLM about your codebase (it can read your files!)
- Run plugin-powered code analysis, diagnostics, and project-specific checks
- Use tools for searching, editing, running tests, generating code, and more
- Add plugins for new frameworks, utilities, or custom workflows

---

## How does it work?

- Launches a local webapp UI
- Scans your project and detects tech/tools with plugins
- LLM context is built dynamically from your actual files plus plugin knowledge
- All file writes and commands require your approval

---

## Want to go deeper?

- Check the [CONTRIBUTING.md](./CONTRIBUTING.md) (for plugin authors and core contributors)
- Explore [ARCHITECTURE.md](./ARCHITECTURE.md) for a technical deep dive
- See `plugins/README.md` for plugin patterns

---

**Unvibe: Local AI that works for you—on your code, your terms.**
