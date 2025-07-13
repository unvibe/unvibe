> [!IMPORTANT]
> This is a personal project made for one purpose: bring LLMs (AI assistants) to your local projects and files, so you can use them directly in your code editor or browser without needing to upload your files to a remote server.
> it has full access to your local files, with request-to-write permissions, so it can read your code, docs, and project structure.
> Use it at your own risk, and only if you trust the code and the AI assistants it uses.

> [!NOTE]
> Recomended workflow: since this is just the exploration phase, there are a lot of rough edges, coming soon features, and missing features.
> for now use `GPT 4.1` and its variants (`mini | nano`)only

## What is Unvibe?

Unvibe is a local web application that brings LLM (AI assistant) workflows directly to your projects and files. It runs on your machine, with _the same read access as you_—so it can see your code, docs, and project structure. When writing or changing files, Unvibe **always asks for your permission first**.

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
