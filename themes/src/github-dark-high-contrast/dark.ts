import type { Theme } from '../../type';

const githubDarkHighContrast: Theme = {
  id: 'github-dark-high-contrast',
  name: 'GitHub Dark High Contrast (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#0a0c10',
    '--background-1': '#161b22',
    '--background-2': '#30363d',
    '--border': '#484f58',
    '--border-1': '#6e7681',
    '--border-2': '#f0f6fc',
    '--foreground': '#f0f6fc',
    '--foreground-1': '#c9d1d9',
    '--foreground-2': '#8b949e',
    '--accent': '#58a6ff',
    '--accent-2': '#ffa657',
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
  shiki: 'github-dark-high-contrast',
};

export default githubDarkHighContrast;
