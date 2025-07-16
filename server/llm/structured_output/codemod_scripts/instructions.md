**codemod_scripts**: An array of codemod scripts to run against files. Each specifies a path, language, and script.

```ts
// types for reference
type CodemodScript = {
  path: string;
  script: string;
};
```

#### Example

```json
{
  "codemod_scripts": [
    {
      "path": "./src/foo.js",
      "script": "
function transformer(fileInfo, api) {\n  const j = api.jscodeshift;\n  const root = j(fileInfo.source);\n  root\n    .find(j.VariableDeclarator, { id: { name: 'foo' } })\n    .forEach(path => {\n      path.node.id.name = 'bar';\n    });\n  return root.toSource();\n}"
    }
  ]
}
```

**Instructions:**

- Write your codemod as a function and export it as `module.exports = transformer;` (or equivalent for your language).
- Do NOT redeclare or assign 'exports' or 'module' inside your script; these are provided for you.
- Your codemod receives `(fileInfo, api)` as arguments. Return the new file content as a string.
- If you need jscodeshift or similar, it's available as the `api` argument or globally as `jscodeshift`.
- The script is evaluated with `eval()` in a CommonJS-like environment for convenience and simplicity. Use with trusted code only.
