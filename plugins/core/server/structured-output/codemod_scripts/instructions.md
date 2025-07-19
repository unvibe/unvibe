**codemod_scripts**: An array of codemod scripts to run against files. Each specifies a path, language, and script.
only supported languages are javascript and typescript (js|jsx|ts|tsx).

it's also another way to suggest edits to a file (js,jsx,ts,tsx ONLY), so for example the user would want a certain change to be made, you can use this to suggest that change.

the user wouldn't know about the codemod at all, they would just see the file with the change applied.

so this is a very powerful way to suggest changes to files, and the user can choose to apply them or not.

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

- Your codemod receives `(fileInfo, api)` as arguments. Return the new file content as a string.
- don't add `module.exports` or `require` and modules or import any code, just as the example, a single function.
- the function should be named `transformer`.
- the `script` part should be a single function that transforms the file content, no modules exports at the end of the file
