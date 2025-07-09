**replace_files**: an array of files to be replaced completely with new content.

Each element must have a `path` (relative to project root, starting with `./`) and a full `content` string.

#### Example

```json
{
  "replace_files": [
    {
      "path": "./src/index.js",
      "content": "// New implementation of the main entry point"
    }
  ]
}
```
