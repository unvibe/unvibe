import type { Theme } from '../../type';

const githubDarkDimmed: Theme = {
  id: 'github-dark-dimmed',
  name: 'GitHub Dark Dimmed (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#22272e',
    '--background-1': '#2d333b',
    '--background-2': '#373e47',
    '--border': '#444c56',
    '--border-1': '#586069',
    '--border-2': '#768390',
    '--foreground': '#adbac7',
    '--foreground-1': '#768390',
    '--foreground-2': '#cdd9e5',
    '--accent': '#539bf5',
    '--accent-2': '#6cb6ff',
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
  shiki: 'github-dark-dimmed',
};

export default githubDarkDimmed;
