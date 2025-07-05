import { Theme } from '@/themes/type';

export default {
  id: 'gruvbox-dark',
  name: 'Gruvbox Dark',
  colorScheme: 'dark',
  shiki: 'gruvbox-dark-hard',
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
    '--background': '#282828',
    '--background-1': '#32302f',
    '--background-2': '#1d2021',
    '--border': '#504945',
    '--border-1': '#665c54',
    '--border-2': '#3c3836',
    '--foreground': '#ebdbb2',
    '--foreground-1': '#bdae93',
    '--foreground-2': '#928374',
    '--accent': '#fe8019', // orange
    '--accent-2': '#fabd2f', // yellow
    '--font-code': '"JetBrains Mono", "Source Code Pro", monospace',
    '--font-ui': '"Zilla Slab", serif',
  },
} as Theme;
