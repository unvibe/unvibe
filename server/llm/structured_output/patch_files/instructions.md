**patch_files**: an array of unified diff patches to apply to files, each with a path and patch string.

Each element must have a `path` (relative to project root, starting with `./`) and a `patch` string (unified diff format).

#### Example

```
{
  "patch_files": [
    {
      "path": "./src/foo.ts",
      "patch": "@@ -1,3 +1,4 @@\n+import x from 'y'\n ..."
    }
  ]
}
```
