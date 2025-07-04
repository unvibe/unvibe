import { Theme } from '@/themes/type';

export default {
  id: 'colorful-light',
  name: 'Colorful Light',
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
    '--background': '#fff7f0', // Soft peach
    '--background-1': '#f0f4ff', // Very light blue
    '--background-2': '#f5faff', // Light cyan
    '--border': '#ffb347', // Orange gold
    '--border-1': '#6ec6ff', // Sky blue
    '--border-2': '#b388ff', // Light purple
    '--foreground': '#22223b', // Deep blue-gray
    '--foreground-1': '#9d4edd', // Vivid purple
    '--foreground-2': '#ff6f61', // Coral red
    '--accent': '#38b2ac', // Teal
    '--accent-2': '#fbbf24', // Amber
    '--font-code':
      '"Fira Mono", "Source Code Pro", "Courier New", Courier, monospace',
    '--font-ui': '"Quicksand", Arial, Helvetica, sans-serif',
  },
} as Theme;
