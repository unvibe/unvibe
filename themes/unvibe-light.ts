// Unvibe Light Theme (from app.css/root.tsx)
import type { ThemeConfig } from './types';

export const unvibeLightTheme: ThemeConfig = {
  name: 'Unvibe Light',
  base: 'light',
  fonts: {
    body: {
      type: 'google',
      family: 'Prompt, Arial, Helvetica, sans-serif',
    },
    mono: {
      type: 'google', // Source Code Pro is imported from Google Fonts
      family: 'Source Code Pro, Courier New, Courier, monospace',
    },
  },
  code_highlighter: {
    id: 'github-light', // update later if another shiki theme is desired
  },
  ui_colors: {
    background: {
      0: '#ffffff', // --background
      1: '#f9f9f9', // --background-1
      2: '#f0f0f0', // --background-2
    },
    forground: {
      1: '#171717', // --foreground
      2: '#333333', // --foreground-1
      3: '#555555', // --foreground-2
    },
    border: {
      0: '#e0e0e0', // --border
      1: '#d0d0d0', // --border-1
      2: '#c0c0c0', // --border-2
    },
  },
};
