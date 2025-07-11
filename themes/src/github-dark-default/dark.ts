import type { Theme } from '../../type';

const githubDarkDefault: Theme = {
  id: 'github-dark-default',
  name: 'GitHub Dark Default (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#0d1117',
    '--background-1': '#161b22',
    '--background-2': '#21262d',
    '--border': '#30363d',
    '--border-1': '#484f58',
    '--border-2': '#6e7681',
    '--foreground': '#c9d1d9',
    '--foreground-1': '#b1bac4',
    '--foreground-2': '#8b949e',
    '--accent': '#58a6ff',
    '--accent-2': '#f78166',
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
  shiki: 'github-dark-default',
};

export default githubDarkDefault;
