import { Theme } from '@/themes/type';

export default {
  id: 'dracula-dark',
  name: 'Dracula Dark',
  colorScheme: 'dark',
  shiki: 'dracula',
  meta: [
    { type: 'link', rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
      type: 'link',
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
    {
      type: 'link',
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;500;700&family=Quicksand:wght@300;400;500;600;700&display=swap',
    },
  ],
  cssVariables: {
    '--background': '#282a36', // Dracula background
    '--background-1': '#44475a', // Current line/selection
    '--background-2': '#1e1f29', // Slightly darker for depth
    '--border': '#6272a4', // Comments (for subtle borders)
    '--border-1': '#bd93f9', // Purple accent
    '--border-2': '#8be9fd', // Cyan accent
    '--foreground': '#f8f8f2', // Main text
    '--foreground-1': '#50fa7b', // Green highlight
    '--foreground-2': '#f1fa8c', // Yellow highlight
    '--accent': '#ff79c6', // Pink
    '--accent-2': '#ffb86c', // Orange
    '--font-code':
      '"Fira Mono", "Source Code Pro", "Courier New", Courier, monospace',
    '--font-ui': '"Quicksand", Arial, Helvetica, sans-serif',
  },
} as Theme;
