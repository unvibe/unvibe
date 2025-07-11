import type { Theme } from '../../type';

const everforestDark: Theme = {
  id: 'everforest-dark',
  name: 'Everforest Dark (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#2b3339',
    '--background-1': '#323d43',
    '--background-2': '#3a464c',
    '--border': '#4b565c',
    '--border-1': '#6e738d',
    '--border-2': '#a7c080',
    '--foreground': '#d3c6aa',
    '--foreground-1': '#a7c080',
    '--foreground-2': '#e67e80',
    '--accent': '#dbbc7f',
    '--accent-2': '#a7c080',
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
  shiki: 'everforest-dark',
};

export default everforestDark;
