import { Theme } from '@/themes/type';

export default {
  id: 'colorful-dark',
  name: 'Colorful Dark',
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
    '--background': '#232136', // Rose Pine dark base
    '--background-1': '#2a273f', // Slightly lighter
    '--background-2': '#393552', // Even lighter
    '--border': '#eb6f92', // Rose
    '--border-1': '#9ccfd8', // Foam
    '--border-2': '#c4a7e7', // Iris
    '--foreground': '#e0def4', // Text
    '--foreground-1': '#f6c177', // Gold
    '--foreground-2': '#ea9a97', // Love
    '--accent': '#9ccfd8', // Foam
    '--accent-2': '#f6c177', // Gold
    '--font-code':
      '"Fira Mono", "Source Code Pro", "Courier New", Courier, monospace',
    '--font-ui': '"Quicksand", Arial, Helvetica, sans-serif',
  },
} as Theme;
