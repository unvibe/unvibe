# Button

**Purpose:** A customizable button component with different styles (variants), loading states, and disabled states.

**Props:**

- `variant: 'default' | 'primary' | 'secondary' | 'danger' | 'success' | 'error' | 'warning' | 'info'`: Defines the button's appearance (color, background, etc.). Defaults to 'default'.
- `isLoading: boolean`: If true, displays a spinner inside the button and disables interaction.
- `disabled: boolean`: If true, disables the button.
- `children: React.ReactNode`: The content displayed inside the button.
- `className: string`: Optional CSS class names to apply custom styling.
- `onClick?: () => void`: An optional onClick function.

**Usage:**

Used for any interactive element that triggers an action (form submissions, navigation, etc.). The different variants allow visually indicating the type of action the button performs.