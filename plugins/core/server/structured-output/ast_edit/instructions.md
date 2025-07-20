# ast_edit Structured Output Instructions

This element lets you describe codebase edits as AST/semantic mutations (not just line/character). Use when you want to surgically edit JSX, function code, or props.

## Structure

```json
{
  "ast_edit": [
    {
      "path": "./src/components/Example.tsx",
      "query": {
        "type": "JSXElement",
        "name": "MyComponent",
        "prop": "icon",
        "index": 0
      },
      "operation": "replace_prop_value",
      "new_value": "<span className='w-4 h-4 border-purple-600 ...'>...</span>"
    }
  ]
}
```

## Supported Operations

- `replace_prop_value` – Replace the value of a given prop on a JSX element
- `remove_prop` – Remove a prop from a JSX element
- `replace_node` – Replace a whole node (JSX, function, variable) by selector

## Query Fields

- `type`: AST node type ("JSXElement", "FunctionDeclaration", etc)
- `name`: The component/function/variable name
- `prop`: (optional) For targeting a specific prop
- `index`: (optional) If multiple matches, which one

## Example

Replace the `icon` prop of the first `<ThreadDetailsMessageListItemFile ...>` in a file:

```json
{
  "path": "./src/components/Example.tsx",
  "query": {
    "type": "JSXElement",
    "name": "ThreadDetailsMessageListItemFile",
    "prop": "icon",
    "index": 0
  },
  "operation": "replace_prop_value",
  "new_value": "<span className='w-4 h-4 border-purple-600 ...'>...</span>"
}
```

## Output

- Only files matching the query and operation will be changed.
- If no match, the file is left unchanged and an error may be reported.
