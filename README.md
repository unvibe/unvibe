> [!IMPORTANT]
> This is a personal project I made to explore the possibilities of running LLMs in local projects with full control over context and tools.
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
When you first open a project from the app, it will parse that project and register plugins associated with that project stack.

Let's say you opened a Typescript React project, then it will register typescript and various web tooling that will:

- aid the model in understanding the project structure via system instructions
- provide the model with the ability to run scripts against your codebase
- provide tools to manage various aspects of your stack
- diagnostics hooks (runs on llm repsonse) and analysis of the project structure, code, and files

and more, everything is customizable, although for now the only supported stack is Typescript/nodejs based projects, some plugins stubs exists for later support like AWS, Docker, Go, Python, etc...

There's a lot of rough edges throughout the app, this is an experimental phase, so expect some bugs and missing features.

## TODOs

- [ ] Support for visual flow like (the llm view the project with you and ready to be prompted with the correct context)
- [ ] Support for files flow, focused work on a file (you can jumpt to a file and prompt away in few strokes)
- [ ] Support Structured Output Configuration, currently it's modular, but hardcoded for now
- [ ] Finish all Coming Soon features marked by `<ComingSoon />` component
- [ ] More quality of life improvments in the `llm-input` UI component in `continue-thread` flow
- [ ] Add Structured Output play ground for testing various behaviors independent of the current project
- [ ] Support search enabled queries, currently limited to `web_scraping` tool
- [ ] Add Home docs (user guide to various features, document all cases of usage)
- [ ] Fix add project/github pull flow (which source to add to?)
- [ ] Enable remove/add source in `home/projects`
- [ ] More informative `home/environment` page and inputs (what does each var do?)
- [ ] Fix archived threads
- [ ] Add `delete|edit` hover actions to the threads list items
- [ ] Enable per-project/theme
- [ ] Enable per-project and per-thread context settings
- [ ] Make next.js plugin
- [ ] Make react-router plugin
- [ ] Show Structured Output status (outdated/accepted/...)

## Contributing

check the [contributing guide](/CONTRIBUTING.md) for more details.

## Roadmap

These are the hardest to solve right now, so for now im sticking to the TODOs above, once these are done, I will start working on the roadmap items.

- [ ] Fix all llm providers (gemini, ollama, anthropic, etc...)
- [ ] Enable llm image output
- [ ] Enable Audio/Video input and output
- [ ] Enable Custom workflows (more than just visual/files/threads flows)

## Final Thoughts

I started this project because I wanted full control over what can be done with LLMs, this project showed promise and hope that i can compose contexts however I want, and manage my own costs (although more expensive than directly using a 20$ a month AI product subscription) but i think it is worth it

I am mainly intereseted in fully building the JS/TS web stacks and making them fully supported (a plugin for next.js, react-router, etc...) and then I will start working on other stacks like python, go, etc. But that's a tall order, so my hope is if people find the idea useful they can contribute to the project and help me build it. so unvibe becomes a fully open-source community project.
