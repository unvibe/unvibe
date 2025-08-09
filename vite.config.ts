import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, Plugin } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import devtoolsJson from 'vite-plugin-devtools-json';

function myplugin(): Plugin {
  return {
    name: 'myplugin',
  };
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    devtoolsJson(),
    myplugin(),
  ],
  publicDir: 'app/public',
  ssr: {
    // keeps monaco out of the server bundle so Node never sees the CSS
    noExternal: ['monaco-editor'],
  },
});
