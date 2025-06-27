import fs from 'node:fs/promises';
import path from 'node:path';

export async function checkMonorepo(
  dir: string
): Promise<{ isMonorepo: boolean; workspaces: string[] }> {
  try {
    const pkgJson = await fs.readFile(
      path.resolve(dir, 'package.json'),
      'utf-8'
    );
    const json = JSON.parse(pkgJson);
    const isMonorepo =
      !!json.workspaces &&
      Array.isArray(json.workspaces) &&
      json.workspaces.length > 0;
    const workspaces = json.workspaces?.map((workspaceGlob: string) => {
      return workspaceGlob.split('/')[0];
    });
    return { isMonorepo, workspaces };
  } catch {
    return { isMonorepo: false, workspaces: [] };
  }
}
