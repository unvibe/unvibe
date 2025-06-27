import { runShellCommand } from '@/plugins/core/server/api/lib/run-shell-command';
import type { VirtualFile } from '@/plugins/_types/plugin.server';
import path from 'path';
import fs from 'fs/promises';

// Format Go files in place using 'go fmt', then reload their content
export async function format(virtualFiles: VirtualFile[], projectRoot: string): Promise<VirtualFile[]> {
  // Write virtual files to disk before formatting
  const written: string[] = [];
  try {
    for (const vf of virtualFiles) {
      const abs = path.resolve(projectRoot, vf.path);
      await fs.mkdir(path.dirname(abs), { recursive: true });
      await fs.writeFile(abs, vf.content, 'utf8');
      written.push(abs);
    }
    await runShellCommand('go fmt', { cwd: projectRoot });
    // Reload formatted content
    const result: VirtualFile[] = [];
    for (const vf of virtualFiles) {
      const abs = path.resolve(projectRoot, vf.path);
      const formatted = await fs.readFile(abs, 'utf8');
      result.push({ ...vf, content: formatted });
    }
    return result;
  } finally {
    // Optionally: Clean up temp files if you don't want them left on disk
    // for (const abs of written) await fs.unlink(abs).catch(() => {});
  }
}
