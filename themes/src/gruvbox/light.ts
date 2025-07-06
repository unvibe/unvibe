import { Theme } from '@/themes/type';

const GruvboxLight: Theme = {
  id: 'gruvbox-light',
  name: 'Gruvbox Light',
  colorScheme: 'light',
  shiki: 'gruvbox-light-hard',
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
      href: 'https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@400;700&family=JetBrains+Mono:wght@400;500;700&display=swap',
    },
  ],
  cssVariables: {
    '--background': '#fbf1c7', // light0
    '--background-1': '#f2e5bc', // light1
    '--background-2': '#ebdbb2', // light2
    '--border': '#d5c4a1', // light3
    '--border-1': '#bdae93', // light4
    '--border-2': '#665c54', // dark4
    '--foreground': '#3c3836', // dark1
    '--foreground-1': '#504945', // dark2
    '--foreground-2': '#7c6f64', // dark3
    '--accent': '#b57614', // orange
    '--accent-2': '#d79921', // yellow
    '--font-code': '"JetBrains Mono", "Source Code Pro", monospace',
    '--font-ui': '"Zilla Slab", serif',
  },
};

export default GruvboxLight;
