import path from 'path';

/**
 * Returns the absolute path to the nearest tsconfig.json that applies
 * to `virtualFileRelPath`, or null if none is found.
 *
 * @param projectRoot           Absolute path to the workspace root
 * @param relativeFilesPaths    Every *relative* path that exists in the workspace
 *                              (e.g. collected with `ts.sys.readDirectory`).
 *                              This array should include all discovered
 *                              **tsconfig.json** files.
 * @param virtualFileRelPath    Path of the file we are checking, *relative* to projectRoot
 */
export function findNearestTsConfig(
  projectRoot: string,
  relativeFilesPaths: string[],
  virtualFileRelPath: string
): string | null {
  // 1.  Build a Set of folders that contain a tsconfig.json
  const tsconfigDirs = new Set(
    relativeFilesPaths
      .filter((p) => p.endsWith('tsconfig.json'))
      .map((p) => path.dirname(p))
  );

  // 2.  Start from the directory that owns the file
  let dir = path.dirname(virtualFileRelPath);

  // 3.  Walk upward until we reach the root (or hit the filesystem root)
  while (true) {
    if (tsconfigDirs.has(dir)) {
      return path.join(projectRoot, dir, 'tsconfig.json');
    }

    // Stop if we've bubbled up to (or above) the workspace root
    if (dir === '' || dir === '.' || dir === path.dirname(dir)) break;

    dir = path.dirname(dir);
  }

  // 4.  Fallback: check for a tsconfig.json at the workspace root itself
  return tsconfigDirs.has('.') ? path.join(projectRoot, 'tsconfig.json') : null;
}
