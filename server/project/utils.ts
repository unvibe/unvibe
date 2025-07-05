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

export const isBinary = (f: string) => BINARY_EXTS.has(ext(f));

export const ext = (f: string) => {
  const i = f.lastIndexOf('.');
  return i < 0 ? '' : f.slice(i + 1).toLowerCase();
};

/* ------------------------------------------------------------------ */
/* ⚡️  tiny, pre-built lookup set for extensions we never read         */
/* ------------------------------------------------------------------ */
export const BINARY_EXTS: ReadonlySet<string> = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'svg',
  'pdf',
  'zip',
  'tar',
  'gz',
  'bz2',
  'xz',
  '7z',
  'rar',
  'exe',
  'dll',
  'so',
  'class',
  'db',
  'ttf',
  'otf',
  'woff',
  'woff2',
  'ico',
  'mov',
  'mp4',
  'avi',
  'mkv',
  'webm',
  'mp3',
  'wav',
  'flac',
  'ogg',
  'pkl',
  'bin',
  'wasm',
  'proto',
  'pb',
  'h5',
  'sqlite',
  'sqlite3',
  'csv',
  'psd',
  'xcf',
  'raw',
  'apk',
  'ipa',
  'dmg',
  'iso',
  'img',
]);
