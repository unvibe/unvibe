**find_and_replace**: an array of search/replace operations with optional match-count safety.

Each element must have a `path`, `search`, and `replace` string, and optionally `expected_matches`.

#### Example

```
{
  "find_and_replace": [
    {
      "path": "./src/foo.js",
      "search": "foo",
      "replace": "bar",
      "expected_matches": 2
    }
  ]
}
```
