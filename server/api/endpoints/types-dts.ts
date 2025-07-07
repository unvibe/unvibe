// Serve .d.ts file content from node_modules/@types and from package-shipped types
import { createEndpoint } from '@/server/api/create-endpoint';
import { z } from 'zod';
import path from 'node:path';
import fs from 'node:fs/promises';

export const typesDts = createEndpoint({
  type: 'GET',
  pathname: '/types-dts',
  params: z.object({
    module: z.string(),
    file: z.string().optional(), // e.g. 'index.d.ts' or submodules
  }),
  handler: async ({ parsed }) => {
    const { module: _module, file } = parsed;
    const projectRoot = process.cwd();
    const module = decodeURIComponent(_module);
    // Try @types first
    const atTypes = path.join(projectRoot, 'node_modules', '@types', module);
    const pkgMain = path.join(projectRoot, 'node_modules', module);

    const tryPaths = [
      file ? path.join(atTypes, file) : path.join(atTypes, 'index.d.ts'),
      file ? path.join(pkgMain, file) : path.join(pkgMain, 'index.d.ts'),
      file
        ? path.join(pkgMain, 'types', file)
        : path.join(pkgMain, 'types', 'index.d.ts'),
    ];
    for (const p of tryPaths) {
      try {
        const stat = await fs.stat(p);
        if (stat.isFile()) {
          const content = await fs.readFile(p, 'utf8');
          return { content, found: true };
        }
      } catch {}
    }
    return {
      error: `No .d.ts for module '${module}' found in node_modules/@types or node_modules.`,
      found: false,
    };
  },
});
