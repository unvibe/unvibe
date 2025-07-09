**edit_ranges**: an array of files with multiple range edits, where each edit specifies a start and end line, and the content to replace those lines.

Each element must have:

- `path`: relative file path (starting with `./`)
- `edits`: array of `{ start, end, content }` objects (both `start` and `end` are inclusive)

#### Example

```json
{
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

**Important:** When replacing lines that define a code block (object/class/function), you must repeat the opening line. Never assume previous context is preserved.
