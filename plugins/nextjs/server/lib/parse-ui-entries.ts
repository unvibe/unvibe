// Robust Next.js UIEntries parser
import fs from 'node:fs';
import path from 'node:path';

export interface UIEntry {
  path: string; // e.g. '/about/[slug]'
  file: string; // absolute or project-relative path
  mode: 'pages' | 'app'; // which router this entry comes from
}

const PAGE_EXTENSIONS = ['js', 'jsx', 'ts', 'tsx'];
const APP_PAGE_FILE = /^page\.(js|jsx|ts|tsx)$/;
// const APP_ROUTE_FILE = /^route\.(js|ts)$/; // API route in app/
const PAGES_SPECIALS = ['_app', '_document', '_error', '404', '500'];

function isPageFile(name: string) {
  const ext = path.extname(name).slice(1);
  const base = path.basename(name, '.' + ext);
  return PAGE_EXTENSIONS.includes(ext) && !PAGES_SPECIALS.includes(base);
}

function walkPagesDir(pagesDir: string, rel = '', entries: UIEntry[] = []) {
  if (!fs.existsSync(pagesDir)) return entries;
  for (const entry of fs.readdirSync(pagesDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name === 'api') continue; // skip API routes
      walkPagesDir(
        path.join(pagesDir, entry.name),
        path.join(rel, entry.name),
        entries
      );
    } else if (entry.isFile() && isPageFile(entry.name)) {
      const ext = path.extname(entry.name);
      let url = path.join('/', rel, entry.name.replace(ext, ''));
      url = url
        .replace(/\\/g, '/')
        .replace(/\/index$/, '/')
        .replace(/\/$/, '/');
      if (url.endsWith('/')) url = url.slice(0, -1) || '/';
      entries.push({
        path: url,
        file: path.join(pagesDir, entry.name),
        mode: 'pages',
      });
    }
  }
  return entries;
}

function walkAppDir(appDir: string, rel = '', entries: UIEntry[] = []) {
  if (!fs.existsSync(appDir)) return entries;
  for (const entry of fs.readdirSync(appDir, { withFileTypes: true })) {
    // Skip private folders (_folder) and test dirs
    if (entry.name.startsWith('_')) continue;
    // Skip route groups (folders in parens)
    const seg = entry.name;
    if (seg.startsWith('(') && seg.endsWith(')')) {
      // Don't add to URL path
      walkAppDir(path.join(appDir, seg), rel, entries);
      continue;
    }
    if (entry.isDirectory()) {
      walkAppDir(path.join(appDir, seg), path.join(rel, seg), entries);
    } else if (entry.isFile() && APP_PAGE_FILE.test(entry.name)) {
      let url = '/' + rel.replace(/\\/g, '/');
      url = url.replace(/\/\/+/g, '/').replace(/\/$/, '') || '/';
      entries.push({
        path: url,
        file: path.join(appDir, entry.name),
        mode: 'app',
      });
    }
  }
  return entries;
}

function findDirVariants(projectRoot: string, base: string): string[] {
  // Returns e.g. ["./pages", "./src/pages"] if they exist
  const candidates = [
    path.join(projectRoot, base),
    path.join(projectRoot, 'src', base),
  ];
  return candidates.filter(fs.existsSync);
}

export function parseNextjsUIEntries(projectRoot: string): {
  mode: 'pages' | 'app' | 'both' | 'none';
  entries: UIEntry[];
} {
  const pagesDirs = findDirVariants(projectRoot, 'pages');
  const appDirs = findDirVariants(projectRoot, 'app');
  const entries: UIEntry[] = [];

  if (pagesDirs.length) {
    for (const dir of pagesDirs) {
      walkPagesDir(dir, '', entries);
    }
  }
  if (appDirs.length) {
    for (const dir of appDirs) {
      walkAppDir(dir, '', entries);
    }
  }

  let mode: 'pages' | 'app' | 'both' | 'none' = 'none';
  if (pagesDirs.length && appDirs.length) mode = 'both';
  else if (pagesDirs.length) mode = 'pages';
  else if (appDirs.length) mode = 'app';

  return { mode, entries };
}
