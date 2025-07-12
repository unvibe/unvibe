## What is Unvibe?

Unvibe is a local web application that brings LLM (AI assistant) workflows directly to your projects and files. It runs on your machine, with _the same read access as you_—so it can see your code, docs, and project structure. When writing or changing files, Unvibe **always asks for your permission first**.

---

## Requirements

- **Node.js**: Unvibe requires Node.js version 23 or higher.
- **gh CLI**: Github CLI is used for various git / github operations

## Quick Start

Just run:

```bash
npx unvibe
```

this will:

1. pull the latest version of Unvibe from github into `~/.unvibe`
2. installs the dependencies
3. builds the app
4. starts the app at server `http://localhost:3000`

**Updating Unvibe** later you can update Unvibe by running:

```bash
npx unvibe --update
```

or update from the app itself by clicking on the "Update" button in the sidebar.

**Deleting Unvibe** Deleting the `~/.unvibe` directory will remove Unvibe from your machine.

---
