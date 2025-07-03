// Unvibe Dark Theme (from app.css/root.tsx)
import type { ThemeConfig } from './types';

export const unvibeDarkTheme: ThemeConfig = {
  name: 'Unvibe Dark',
  base: 'dark',
  fonts: {
    body: {
      type: 'google',
      family: 'Prompt, Arial, Helvetica, sans-serif',
    },
    mono: {
      type: 'google',
      family: 'Source Code Pro, Courier New, Courier, monospace',
    },
  },
  code_highlighter: {
    id: 'github-dark', // update later if another shiki theme is desired
  },
  ui_colors: {
    background: {
      0: '#181818', // --background
      1: '#1c1c1c', // --background-1
      2: '#2c2c2c', // --background-2
    },
    forground: {
      1: '#d5d5d5', // --foreground
      2: '#a4a4a4', // --foreground-1
      3: '#8a8a8a', // --foreground-2
    },
    border: {
      0: '#3a3a3a', // --border
      1: '#303030', // --border-1
      2: '#2a2a2a', // --border-2
    },
  },
};
