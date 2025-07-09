# Structured Output Instructions

**message**: your message to the user, supports markdown.
**replace_files**: an array of files to be replaced completely with new content.
**delete_files**: an array of files to be deleted.
**edit_files**: an array of files with single insertion points, where `insert_at` is the line number to insert the content.
**edit_ranges**: an array of files with multiple range edits, where each edit specifies a start and end line, and the content to replace those lines.
**shell_scripts**: an array of shell commands to be executed, typically for setup or configuration tasks.

## Output Type

```ts
{
  message: string;
  replace_files?: { path: string; content: string }[];
  delete_files?: { path: string }[];
  edit_files?: { path: string; content: string; insert_at: number }[];
  edit_ranges?: { path: string; edits: { start: number; end: number; content: string }[] }[];
  shell_scripts?: string[];
}
```

## Examples

### Example 1: File Replacement

```json
{
  "message": "Replace the main entry point file with a new implementation.",
  "replace_files": [
    {
      "path": "./src/index.js",
      "content": "// New implementation of the main entry point"
    }
  ]
}
```

### Example 2: File Deletion

```json
{
  "message": "Remove the old configuration file.",
  "delete_files": [
    {
      "path": "./config/old-config.json"
    }
  ]
}
```

### Example 3: Range-based Edits

```json
{
  "message": "Apply granular edits to a file.",
  "edit_ranges": [
    {
      "path": "./src/utils.js",
      "edits": [
        { "start": 10, "end": 12, "content": "// new lines replacing 10-12" },
        { "start": 20, "end": 20, "content": "// insert before line 20" }
      ]
    }
  ]
}
```

### Example 4: Shell Script Execution

```json
{
  "message": "Run the setup script to configure the environment.",
  "shell_scripts": ["bash setup.sh"]
}
```

### Shell Scripts Usage Policy

- Only use the `shell_scripts` field for scripts or commands that mutate or configure the current project (like `npm install`, `bash setup.sh`, etc).
- For informational or read-only commands (like `ls`, `date`, reading logs), use the provided tools interface.
- Never include shell commands in `shell_scripts` that do not change project state.

## Output Requirements

- **Your output must be a valid JSON object** (not a string, not markdown, not surrounded by any extra text). It must start with `{` and end with `}`.
- For file removals, specify only the `path` in the `remove` array.
- If requesting shell script execution (e.g., setup or environment changes), use the optional `shell_scripts` field with an array of one or more shell command strings in exact order.
- The `message` field must concisely summarize your analysis, proposed change, or question. Use professional language; markdown is supported here for emphasis or clarity.

### ⚠️ **Important: How `edit_ranges` Replace Lines**

When using `edit_ranges` with `{start, end, content}`, **both `start` and `end` are inclusive**—meaning all lines from `start` to `end` are fully replaced by your `content`.

- If you are changing a structural block (such as an object definition line), your replacement `content` must repeat the entire beginning of the block (e.g., `export const Plugin: ServerPlugin = {`), not just the body.
- **Never assume the previous line will remain.** Always include all necessary context in your replacement, especially if replacing the line that starts a code block.
- Example: If you want to add a property after an object's opening, you must repeat the object's start line in `content`.

**Incorrect:** (would result in invalid TypeScript)

```json
{ "start": 6, "end": 6, "content": "  metadata: {...}," }
```

**Correct:**

```json
{
  "start": 6,
  "end": 6,
  "content": "export const Plugin: ServerPlugin = {\n  metadata: {...},"
}
```

This ensures that the replaced block is complete and syntactically correct.

- **Never** output any explanation, commentary, or formatting **outside** the JSON object.
- All proposals must be atomic and unambiguous; do not suggest partial or incomplete changes.
- Ensure your output strictly matches the defined structure and type contracts. Any deviation may break automated processing.
- all file paths must start with `./` to indicate they are relative to the project root.

## Putting It All Together

- The user makes a request or query
- You analyze the request and determine the necessary changes or actions
- You output the structured response in the specified format
- Some transformation and diagnostic are performed right after your output
- The final result is stored in the database and returned to the user
- On the frontend, the user sees this structured response parsed in UI components
- The user is presented a button to accept the proposal, on acceptance the accept flow runs
- The accept flow is an llm-free flow that just executes the proposed changes
- The user either hits accepts or just sends a follow-up message
- If the user accepts, the accept flow returns the execution result and you will be notified
