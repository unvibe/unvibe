import type { Theme } from '../../type';

const githubLightHighContrast: Theme = {
  id: 'github-light-high-contrast',
  name: 'GitHub Light High Contrast (Shiki)',
  colorScheme: 'light',
  cssVariables: {
    '--background': '#ffffff',
    '--background-1': '#f6f8fa',
    '--background-2': '#eaeef2',
    '--border': '#d0d7de',
    '--border-1': '#b1bac4',
    '--border-2': '#6e7781',
    '--foreground': '#24292f',
    '--foreground-1': '#57606a',
    '--foreground-2': '#6e7781',
    '--accent': '#0969da',
    '--accent-2': '#fd8c73',
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
  shiki: 'github-light-high-contrast',
};

export default githubLightHighContrast;
