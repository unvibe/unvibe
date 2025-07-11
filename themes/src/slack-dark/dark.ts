import type { Theme } from '../../type';

const slackDark: Theme = {
  id: 'slack-dark',
  name: 'Slack Dark (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#1a1d21',
    '--background-1': '#23272b',
    '--background-2': '#282c2f',
    '--border': '#454c55',
    '--border-1': '#586069',
    '--border-2': '#36c5f0',
    '--foreground': '#e8eaed',
    '--foreground-1': '#d1d5da',
    '--foreground-2': '#ecb22e',
    '--accent': '#36c5f0',
    '--accent-2': '#e01e5a',
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
  shiki: 'slack-dark',
};

export default slackDark;
