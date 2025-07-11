import type { Theme } from '../../type';

const vitesseLight: Theme = {
  id: 'vitesse-light',
  name: 'Vitesse Light (Shiki)',
  colorScheme: 'light',
  cssVariables: {
    '--background': '#f5f5f5',
    '--background-1': '#eaeaea',
    '--background-2': '#cccccc',
    '--border': '#bdbdbd',
    '--border-1': '#a0a0a0',
    '--border-2': '#00cfff',
    '--foreground': '#181818',
    '--foreground-1': '#232323',
    '--foreground-2': '#ffcc00',
    '--accent': '#00cfff',
    '--accent-2': '#ffcc00',
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
  shiki: 'vitesse-light',
};

export default vitesseLight;
