# Select

**Purpose:** A standard select dropdown input with options.

**Props:**

- `label?: string`: An optional label for the select input.
- `options: { value: string; label: string }[]`: An array of objects, each defining a select option. `value` is the value sent to the server, and `label` is the text displayed to the user.
- `React.SelectHTMLAttributes<HTMLSelectElement>`: Other select attributes such as onChange, defaultValue, etc.

**Usage:**

Used in forms to allow users to select a single option from a predefined list.