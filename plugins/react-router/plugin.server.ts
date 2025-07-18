// React Router plugin.server.ts with mode detection and dynamic system instruction
import { ServerPlugin } from '../_types/plugin.server';
import { id } from './plugin.shared';
import fs from 'node:fs';
import path from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseUIEntriesFramework } from './server/lib/parse-ui-entries.framework';
import { parseUIEntriesData } from './server/lib/parse-ui-entries.data';
import { parseUIEntriesDeclarative } from './server/lib/parse-ui-entries.declarative';

const __dirname = dirname(fileURLToPath(import.meta.url));

function readDeps(projectPath: string): string[] {
  try {
    const pkgPath = path.join(projectPath, 'package.json');
    const raw = fs.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(raw);
    return [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
    ];
  } catch {
    return [];
  }
}

function fileExists(filePath: string) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function fileIncludes(filePath: string, search: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes(search);
  } catch {
    return false;
  }
}

function searchInFiles(basePath: string, search: string): boolean {
  // Recursively search for the string in all .js/.jsx/.ts/.tsx files
  // Used for fallback Data/Declarative detection
  let found = false;
  function walk(dir: string) {
    if (found) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (found) return;
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        walk(path.join(dir, entry.name));
      } else if (entry.isFile() && /\.(jsx?|tsx?)$/.test(entry.name)) {
        const filePath = path.join(dir, entry.name);
        if (fileIncludes(filePath, search)) {
          found = true;
          return;
        }
      }
    }
  }
  walk(basePath);
  return found;
}

function loadReadme(mode: 'framework' | 'data' | 'declarative'): string {
  const readmePath = path.join(__dirname, `README.${mode}.md`);
  try {
    return fs.readFileSync(readmePath, 'utf8');
  } catch {
    return '';
  }
}

export const Plugin: ServerPlugin = {
  id,
  description:
    'Shows how routes, entry points, and layouts are set up and previews navigation structure.',
  detect: async (project) => {
    const deps = readDeps(project.path);
    const isDetected =
      deps.includes('react-router') || deps.includes('react-router-dom');

    return isDetected;
  },
  createContext: async (project) => {
    // Framework Mode: routes.ts and @react-router/dev/routes import
    const content = Object.entries(
      project.EXPENSIVE_REFACTOR_LATER_content
    ).map(([key, value]) => ({
      path: key,
      content: value,
    }));
    const routesTs = path.join(project.path, 'app', 'routes.ts');
    if (
      fileExists(routesTs) &&
      fileIncludes(routesTs, '@react-router/dev/routes')
    ) {
      project.UIEntryPoints[id] = parseUIEntriesFramework(content);
      return {
        tools: {},
        systemParts: {
          systemInstruction: loadReadme('framework'),
          detectedMode: 'framework',
        },
      };
    }

    // Data Mode: createBrowserRouter in codebase
    if (searchInFiles(project.path, 'createBrowserRouter')) {
      // TODO: these don't work yet, need to use babel resolve.default like framework mode
      project.UIEntryPoints[id] = parseUIEntriesData(content);
      return {
        tools: {},
        systemParts: {
          systemInstruction: loadReadme('data'),
          detectedMode: 'data',
        },
      };
    }

    // Declarative Mode: <BrowserRouter> in codebase
    if (searchInFiles(project.path, '<BrowserRouter>')) {
      // TODO: these don't work yet, need to use babel resolve.default like framework mode
      project.UIEntryPoints[id] = parseUIEntriesDeclarative(content);
      return {
        tools: {},
        systemParts: {
          systemInstruction: loadReadme('declarative'),
          detectedMode: 'declarative',
        },
      };
    }

    // Fallback
    return {
      tools: {},
      systemParts: {
        systemInstruction:
          'React Router mode could not be detected. No canonical routing mode or config found.',
        detectedMode: 'unknown',
      },
    };
  },
};
