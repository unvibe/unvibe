// Ayu Light Theme
import { Theme } from '../../type';

const ayuLight: Theme = {
  name: 'Ayu Light',
  id: 'ayu-light',
  colorScheme: 'light',
  cssVariables: {
    '--background': '#FAFAFA',
    '--background-1': '#F3F4F5',
    '--background-2': '#E8E9ED',
    '--border': '#E6E6E6',
    '--border-1': '#D2D4DE',
    '--border-2': '#C8C9CE',
    '--foreground': '#5C6773',
    '--foreground-1': '#8794A4',
    '--foreground-2': '#ABB0B6',
    '--accent': '#F29718',
    '--accent-2': '#55B4D4',
    '--font-code': '"Source Code Pro", "Courier New", Courier, monospace',
    '--font-ui': 'system-ui, sans-serif',
  },
  meta: [],
  shiki: 'ayu-light',
};

export default ayuLight;
