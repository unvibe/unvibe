import { Theme } from '@/themes/type';

export default {
  id: 'maryoma-light',
  name: 'Maryoma Light',
  colorScheme: 'light',
  shiki: 'rose-pine-dawn',
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
    '--background': '#fff0fa', // Pale pink
    '--background-1': '#ffe4ee', // Lighter pink
    '--background-2': '#f9e6f7', // Soft lavender pink
    '--border': '#f472b6', // Bright pink
    '--border-1': '#f9a8d4', // Lighter pink border
    '--border-2': '#fbcfe8', // Very light pink
    '--foreground': '#6d224f', // Deep magenta
    '--foreground-1': '#be185d', // Vivid rose
    '--foreground-2': '#d946ef', // Fuchsia
    '--accent': '#ec4899', // Pink accent
    '--accent-2': '#f472b6', // Lighter accent
    '--font-code':
      '"Fira Mono", "Source Code Pro", "Courier New", Courier, monospace',
    '--font-ui': '"Quicksand", Arial, Helvetica, sans-serif',
  },
} as Theme;
