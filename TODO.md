## TODO

@ api/endpoints/threads.ts

- [ ] make ts-check return object of each file with its diagnostics
- [ ] make eslint-lint return object of each file with its diagnostics
- [ ] run git diff if the project supports git
- [ ] append meta data to assistant messages in db

@ modules/project/threads/details/messages/assistant/structured-output/...

- [ ] use the metadata from the assistant message to render diagnostics git diff

## LOG (append only)

### Road to v1.0.0

#### Home

- [x] @sidebar should include (projects, plugins, themes, environment, docs)
- [x] @sidbar view projects
- [ ] @sidebar view plugins
- [ ] @sidebar view themes
- [ ] @sidebar view environment
- [ ] @sidebar view docs
- [ ] @welcome better welcome message styles
- [ ] @welcome handle close welcome message (dont show again)

#### Project

- [ ] @llm make llm file walker tool (append only file result, define goal of the walker)
- [ ] @thread-input make search depends on the current selected model
- [ ] @thread-input make image input depends on the current selected model
- [ ] @thread-input @context-modal indicate tool-use availability based on the current selected model
- [ ] @thread-input @model-selector make it depend on the current env setup
- [ ] @thread-input @context-modal match the cards style @project-plugins
- [ ] @thread-input @context-modal use the persisted default state from context & tools (project/plugins)
- [ ] @thread-input @model-selector thinking indicator & enable thinking config
- [ ] @thread-input @backend make hooks config work

#### Project/Threads

- [ ] @thread-details @structured-output better loading state (tools, usage, thinking)
- [ ] @thread-details @structured-output better delete render
- [ ] @thread-details @backend run hooks on ai response /thread/details
- [ ] @thread-details @structured-output make the accept flow better
- [ ] @thread-details @structured-output remove the "preview" for now
- [ ] @thread-details @structured-output make selected files (add/delete) work
- [ ] @thread-details @structured-output make the "edits" work with accept & diff
- [ ] @thread-details @floating-thread-settings fix buttons (Pin, Delete, etc.)
- [ ] @thread-details @all-message-kinds add message actions (copy, info, etc.)
- [ ] @structured-output install mermaid.js to render the mermaid diagrams in the structured output
- [ ] @structured-output @server add a memaid diagrams part in the structured output and teach the model to how to use it

#### Project/Files

- [ ] @files @default-view make closable docs section
- [ ] @files @default-view add files tools (project walker)
- [ ] @files @file-editor-thread make the files threads work
- [ ] @files @file-editor-monaco add dianostic & enable hover & tsserver flows

#### Project/Plugins (context & tools)

- [ ] @context-card make the switch work to persist default state (enabled/disabled)
- [ ] @context-card add a "view" button that opens a modal that shows the details of that part of the context to view/test it
- [ ] @context-card @new add a "add_section" button for (system, tools, hooks)
- [ ] @context-card @new add system
- [ ] @context-card @new add tool
- [ ] @context-card @new add hook

#### Project/Theme

- [ ] @not-implemented override the current theme to give the user the ability to distinguish between projects like (vscode-peacock)
