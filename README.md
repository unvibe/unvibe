> [!IMPORTANT]
> This is a personal project made for one purpose: bring LLMs (AI assistants) to your local projects and files, so you can use them directly in your code editor or browser without needing to upload your files to a remote server.
> it has full access to your local files, with request-to-write permissions, so it can read your code, docs, and project structure.
> Use it at your own risk, and only if you trust the code and the AI assistants it uses.

# Unvibe

Run llms in your local projects and files with full configuration and control over context

## Requirements

- **Node.js**: Unvibe requires Node.js version 23 or higher.
- **gh CLI**: Github CLI is used for various git / github operations

## Install and Run

To **install**:

```base
npx unvibe
```

this will:

1. pull the latest version of Unvibe from github into `~/.unvibe`
2. installs the dependencies
3. builds the app
4. starts the app at server `http://localhost:3000`

To **update**

```bash
npx unvibe --update
```

or update from the app itself by clicking on the "Update" button in the sidebar.

To **delet**

```bash
rm -rf ~/.unvibe
```

> [!NOTE]
> Recomended workflow: since this is just the exploration phase, there are a lot of rough edges, coming soon features, and missing features.
> for now use `GPT 4.1` and its variants (`mini | nano`)only
