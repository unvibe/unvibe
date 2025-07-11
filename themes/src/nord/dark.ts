import type { Theme } from '../../type';

const nordDark: Theme = {
  id: 'nord-dark',
  name: 'Nord (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#2e3440',
    '--background-1': '#3b4252',
    '--background-2': '#434c5e',
    '--border': '#4c566a',
    '--border-1': '#81a1c1',
    '--border-2': '#88c0d0',
    '--foreground': '#eceff4',
    '--foreground-1': '#d8dee9',
    '--foreground-2': '#a3be8c',
    '--accent': '#b48ead',
    '--accent-2': '#5e81ac',
    '--font-code': '"Fira Mono", Menlo, Monaco, Consolas, monospace',
    '--font-ui': 'system-ui, sans-serif',
  },
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
      href: 'https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;500;700&display=swap',
    },
  ],
  shiki: 'nord',
};

export default nordDark;
