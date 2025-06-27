# Text

**Purpose:** A polymorphic text component that allows rendering text with various styles and semantic HTML elements.

**Props:**

- `as?: ElementType`: Allows changing the underlying HTML element (e.g., as="h1", as="p", as="span").
- `center?: boolean`: Centers the text.
- `left?: boolean`: Aligns text to the left.
- `right?: boolean`: Aligns text to the right.
- `bold?: boolean`: Makes the text bold.
- `semiBold?: boolean`: Makes the text semi-bold.
- `light?: boolean`: Makes the text light.
- `thin?: boolean`: Makes the text thin.
- `italic?: boolean`: Makes the text italic.
- `underline?: boolean`: Underlines the text.
- `lineThrough?: boolean`: Adds a line through the text.
- `uppercase?: boolean`: Transforms the text to uppercase.
- `lowercase?: boolean`: Transforms the text to lowercase.
- `capitalize?: boolean`: Capitalizes the text.
- `truncate?: boolean`: Truncates the text with an ellipsis if it overflows.
- `mono?: boolean`: Sets the font to monospace.

**Usage:**

A versatile component for displaying text content with consistent styling across the application. The polymorphic as prop makes it easy to use different semantic elements for different types of text.