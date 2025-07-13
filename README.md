> [!IMPORTANT]
> This is a personal project made for one purpose: bring LLMs (AI assistants) to your local projects and files, so you can use them directly in your code editor or browser without needing to upload your files to a remote server.
> it has full access to your local files, with request-to-write permissions, so it can read your code, docs, and project structure.
> Use it at your own risk, and only if you trust the code and the AI assistants it uses.

# Unvibe

Run llms in your local projects and files with full configuration and control over context

## Requirements

- **Node.js**: requires Node.js version 23 or higher.
- **gh CLI**: Github CLI is used for various git / github operations
- **OpenAI API Key**: You need an OpenAI API key to use the LLMs

## Install and Run

> [!NOTE]
> Recomended workflow: since this is just the exploration phase, there are a lot of rough edges, coming soon features, and missing features.
> for now use `GPT 4.1` and its variants (`mini | nano`)only

To **install**:

```base
npx unvibe
```

this will:

1. pull the latest version of Unvibe from github into `~/.unvibe`
2. installs the dependencies
3. builds the app
4. starts the app at server `http://localhost:54495`

If this is the first time you run it then you will be greeted with a welcome message that prompts for the OpenAI API key, once you enter it you are ready to go!
Optionally, also follow the instructions to set up AWS S3 to enable LLM input/output of type image (for now, later will be used for video/audio too).

To **update**

```bash
npx unvibe --update
```

or update from the app itself by clicking on the "Update" button in the sidebar.

To **delete**

> [!WARNING]
> This will delete everything related to Unvibe and will also delete all the data in the database (sqlite)
> Unvibe does not store or send any data to any remote server, everything is stored locally in the database.

```bash
rm -rf ~/.unvibe
```

## Project Status

This started as a sketch of a platform to run all kinds of llms in your local projects and files, with a nice way to add/remove/update context and tools.
When you first open a project from the app, it will parse that project and register a `Plugins` associated with that project stack.

Let's say you opened a Typescript React project, then it will register typescript and various web tooling that will:

- aid the model in understanding the project structure via system instructions
- provide the model with the ability to run scripts against your codebase
- provide tools to manage various aspects of your stack
- diagnostics hooks (runs on llm repsonse) and analysis of the project structure, code, and files

and more, everything is customizable, although for now the only supported stack is Typescript/nodejs based projects, some plugins stubs exists for later support like AWS, Docker, Go, Python, etc...

There's a lot of rough edges throughout the app, this is an experimental phase, so expect some bugs and missing features.
