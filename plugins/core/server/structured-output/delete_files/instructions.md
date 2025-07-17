**delete_files**: an array of files to be deleted.

Each element must have a `path` (relative to project root, starting with `./`).

#### Example

```json
{
  "delete_files": [
    {
      "path": "./config/old-config.json"
    }
  ]
}
```
