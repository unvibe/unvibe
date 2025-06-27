/* detect-package-manager.ts – determine which package manager a project uses
 ---------------------------------------------------------------------------
 1. Reads `package.json` and checks the optional `"packageManager"` field.
    – If the field exists, return its name (before the `@` version slice):
      "pnpm@8.14.0" → "pnpm".
 2. Otherwise, checks for manager‑specific lock files in priority order:
      • pnpm-lock.yaml      → pnpm
      • bun.lockb           → bun
      • yarn.lock           → yarn
      • package-lock.json   → npm
 3. If none of the above are found, returns "unknown".
 ---------------------------------------------------------------------------*/

import fs from 'fs';
import path from 'path';

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun' | 'unknown';

export const getPackageJson = (
  projectRoot: string
): Record<string, unknown> | null => {
  const pkgJsonPath = path.join(projectRoot, 'package.json');
  try {
    const pkgJsonText = fs.readFileSync(pkgJsonPath, 'utf8');
    return JSON.parse(pkgJsonText);
  } catch {
    return null;
  }
};

export function detectPackageManager(projectRoot: string): PackageManager {
  // 1️⃣  try the explicit field in package.json
  const pkgJsonPath = path.join(projectRoot, 'package.json');
  try {
    const pkgJsonText = fs.readFileSync(pkgJsonPath, 'utf8');
    const pkg = JSON.parse(pkgJsonText) as { packageManager?: string };
    if (pkg.packageManager) {
      const name = pkg.packageManager.split('@')[0] as PackageManager;
      if (
        name === 'npm' ||
        name === 'pnpm' ||
        name === 'yarn' ||
        name === 'bun'
      ) {
        return name;
      }
    }
  } catch {
    /* ignore – fall through to lock‑file detection */
  }

  // 2️⃣  look for lock files
  const candidates: [PackageManager, string][] = [
    ['pnpm', 'pnpm-lock.yaml'],
    ['bun', 'bun.lockb'],
    ['yarn', 'yarn.lock'],
    ['npm', 'package-lock.json'],
  ];

  for (const [name, file] of candidates) {
    if (fs.existsSync(path.join(projectRoot, file))) {
      return name;
    }
  }

  return 'npm';
}

export async function isInstalled(projectRoot: string): Promise<boolean> {
  // check if node_modules exists

  const nodeModulesPath = path.join(projectRoot, 'node_modules');
  return fs.existsSync(nodeModulesPath);
}
