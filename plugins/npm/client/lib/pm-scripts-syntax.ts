/* pm-scripts-syntax.ts – map a package manager to common script commands
 -----------------------------------------------------------------------
 Example:
   getScriptsSyntax('yarn')
   => { add: 'yarn add', remove: 'yarn remove', run: (c) => `yarn ${c}` }
 -----------------------------------------------------------------------*/

import type { PackageManager } from '@/plugins/npm/server/detect-package-manager';

interface ScriptSyntax {
  /** install / add dependency */
  add: (pkgs: string[]) => string;
  /** uninstall / remove dependency */
  remove: (pkgs: string[]) => string;
  /** run a npm‑script */
  run: (command: string) => string;
}

export function getScriptsSyntax(pm: PackageManager): ScriptSyntax {
  switch (pm) {
    case 'yarn':
      return {
        add: (pkgs) => `yarn add ${pkgs.join(' ')}`,
        remove: (pkgs) => `yarn remove ${pkgs.join(' ')}`,
        run: (cmd) => `yarn ${cmd}`,
      };
    case 'pnpm':
      return {
        add: (pkgs) => `pnpm add ${pkgs.join(' ')}`,
        remove: (pkgs) => `pnpm remove ${pkgs.join(' ')}`,
        run: (cmd) => `pnpm run ${cmd}`,
      };
    case 'bun':
      return {
        add: (pkgs) => `bun add ${pkgs.join(' ')}`,
        remove: (pkgs) => `bun remove ${pkgs.join(' ')}`,
        run: (cmd) => `bun run ${cmd}`,
      };
    case 'npm':
      /* npm keeps the familiar install/remove/run syntax */
      return {
        add: (pkgs) => `npm install ${pkgs.join(' ')}`,
        remove: (pkgs) => `npm uninstall ${pkgs.join(' ')}`,
        run: (cmd) => `npm run ${cmd}`,
      };
    default:
      // fall back to npm
      return {
        add: (pkgs) => `npm install ${pkgs.join(' ')}`,
        remove: (pkgs) => `npm uninstall ${pkgs.join(' ')}`,
        run: (cmd) => `npm run ${cmd}`,
      };
  }
}
