export type ModelResponseStructure = {
  message: string;
  replace_files?: { path: string; content: string }[];
  delete_files?: { path: string }[];
  edit_files?: {
    path: string;
    content: string;
    insert_at: number;
  }[];
  shell_scripts?: string[];
};

export const structuredOutputInstructions = `
# Structured Output Instructions

## Output Type
\`\`\`ts
{
  // A concise, actionable summary of the proposed change, question, or analysis. Markdown is supported.
  message: string;
  // Full file replacements
  replace_files?: { path: string; content: string }[];
  // Files to be deleted
  delete_files?: { path: string }[];
  // insert_at is the line number where the content should be inserted
  // so the beginning of the inserted content is at line insert_at (1-based index)
  edit_files?: { path: string; content: string; insert_at: number }[];
  // scripts to be executed
  shell_scripts?: string[];
}
\`\`\`

## Examples

### Example 1: File Replacement

\`\`\`json
{
  "message": "Replace the main entry point file with a new implementation.",
  "replace_files": [
    {
      "path": "./src/index.js",
      "content": "// New implementation of the main entry point"
    }
  ]
}
\`\`\`

### Example 2: File Deletion
\`\`\`json
{
  "message": "Remove the old configuration file.",
  "delete_files": [
    {
      "path": "./config/old-config.json"
    }
  ]
}
\`\`\`

### Example 3: Range-based Edits
\`\`\`json
{
  "message": "Update the function implementation in the specified range.",
  "edit_files": [
    {
      "path": "./src/utils.js",
      "content": "function newImplementation() { /* updated logic */ }",
      "insert_at": 10
    }
  ]
}
\`\`\`

### Example 4: Shell Script Execution
\`\`\`json
{
  "message": "Run the setup script to configure the environment.",
  "shell_scripts": [
    "bash setup.sh"
  ]
}
\`\`\`
### Shell Scripts Usage Policy
- Only use the \`shell_scripts\` field for scripts or commands that mutate or configure the current project (for example: \`npm install\`, \`bash setup.sh\`, or scripts that change files, install dependencies, etc).
- For informational or read-only commands (for example: \`ls\`, \`date\`, reading logs, checking system info), use the provided tools interface to request their execution instead of including them in \`shell_scripts\`.
- Never include shell commands in \`shell_scripts\` that do not change the state of the project; these should be run via the tools mechanism to get their output.


## Output Requirements

- **Your output must be a valid JSON object** (not a string, not markdown, not surrounded by any extra text). It must start with \`{\` and end with \`}\`.
- For file removals, specify only the \`path\` in the \`remove\` array.
- If requesting shell script execution (e.g., setup or environment changes), use the optional \`shell_scripts\` field with an array of one or more shell command strings in exact order.
- The \`message\` field must concisely summarize your analysis, proposed change, or question. Use professional language; markdown is supported here for emphasis or clarity.

## Additional Guidance
- **Never** output any explanation, commentary, or formatting **outside** the JSON object.
- All proposals must be atomic and unambiguous; do not suggest partial or incomplete changes.
- Ensure your output strictly matches the defined structure and type contracts. Any deviation may break automated processing.
- all file paths must start with \`./\` to indicate they are relative to the project root.

## Putting It All Together

- the user makes a request or query
- you analyze the request and determine the necessary changes or actions
- you output the structured response in the specified format
- some transformation and diagnostic are performed right after your output
- the final result is stored in the database and returned to the user
- on the frontend, the user sees this structured response parsed in UI components
- the user is presented a button to accept the the proposal, on acceptance the accept flow runs
- the accept flow is an llm-free flow that just executes the proposed changes
- the user either hits accepts or just sends a follow-up message
- if the user accepts, the accept flow returns the execution result and you will be notified
`;
