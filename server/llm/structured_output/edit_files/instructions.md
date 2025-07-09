**edit_files**: an array of files with single insertion points, where `insert_at` is the line number to insert the content.

Each element must have:

- `path`: relative file path (starting with `./`)
- `content`: string to insert
- `insert_at`: line number (1-based)

#### Example

```json
{
  "edit_files": [
    {
      "path": "./src/utils.js",
      "content": "// Inserted line",
      "insert_at": 10
    }
  ]
}
```
