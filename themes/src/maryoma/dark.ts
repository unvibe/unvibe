import { Theme } from '@/themes/type';

export default {
  id: 'maryoma-dark',
  name: 'Maryoma Dark',
  colorScheme: 'dark',
  shiki: 'rose-pine-moon',
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
      href: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&family=Fira+Mono:wght@400;500;700&display=swap',
    },
  ],
  cssVariables: {
    '--background': '#23111a', // Dark berry
    '--background-1': '#3d223a', // Muted purple
    '--background-2': '#4b1844', // Deep magenta shadow
    '--border': '#f472b6', // Pink border
    '--border-1': '#a21caf', // Purple border
    '--border-2': '#fb7185', // Light reddish border
    '--foreground': '#fbcfe8', // Light pink text
    '--foreground-1': '#f472b6', // Pink highlight
    '--foreground-2': '#e879f9', // Orchid
    '--accent': '#f472b6', // Pink accent
    '--accent-2': '#ec4899', // Deeper accent
    '--font-code':
      '"Fira Mono", "Source Code Pro", "Courier New", Courier, monospace',
    '--font-ui': '"Quicksand", Arial, Helvetica, sans-serif',
  },
} as Theme;
