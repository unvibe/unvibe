# Code

**Purpose:** A component for displaying code snippets with syntax highlighting and line numbers.

**Props:**

- `code: string`: The code to be displayed.
- `beforeBaseTransform?: (code: string) => string`: Optional function to transform the code after HTML escaping but before applying syntax highlighting rules. This allows for more advanced customizations.
- `className: string`: Optional CSS class names for custom styling of the overall component.

**Usage:**

Used to display code examples, configuration files, or any other type of text-based content in a visually appealing and readable format.