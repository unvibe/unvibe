import type { Theme } from '../../type';

const houstonDark: Theme = {
  id: 'houston-dark',
  name: 'Houston (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#16161c',
    '--background-1': '#1a1c23',
    '--background-2': '#25293e',
    '--border': '#414558',
    '--border-1': '#565c64',
    '--border-2': '#82aaff',
    '--foreground': '#c8d3f5',
    '--foreground-1': '#7a88cf',
    '--foreground-2': '#c3e88d',
    '--accent': '#82aaff',
    '--accent-2': '#ff966c',
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
  shiki: 'houston',
};

export default houstonDark;
