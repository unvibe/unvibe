**shell_scripts**: an array of shell commands to be executed, typically for setup or configuration tasks.

- Only use for scripts/commands that mutate or configure the project (e.g., `npm install`, `bash setup.sh`).
- For read-only or informational commands, use the tools interface instead.
- Never include shell commands in `shell_scripts` that do not change project state.

#### Example

```json
{
  "shell_scripts": ["bash setup.sh"]
}
```
