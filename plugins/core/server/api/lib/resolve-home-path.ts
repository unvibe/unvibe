import os from 'node:os';
import path from 'node:path';

export function resolveHomePath(root: string) {
  const inputPath = `~/${root}`;

  if (typeof inputPath !== 'string') {
    throw new TypeError(`Expected a string, got ${typeof inputPath}`);
  }
  // exact "~" → home dir
  if (inputPath === '~') {
    return os.homedir();
  }
  // "~/foo" or "~\foo" → join home + rest
  if (inputPath.startsWith('~/') || inputPath.startsWith('~\\')) {
    return path.join(os.homedir(), inputPath.slice(2));
  }
  // otherwise, just resolve normally
  return path.resolve(inputPath);
}
