**edit_instructions**: an array of precise line/range-based edits for files.

Each element must have a `path`, an `action` (replace, insert, delete), `start_line`, and optionally `end_line` and `new_content`.

#### Example

```
{
  "edit_instructions": [
    {
      "path": "./src/foo.ts",
      "action": "replace",
      "start_line": 10,
      "end_line": 12,
      "new_content": "console.log('Hi!');"
    }
  ]
}
```
