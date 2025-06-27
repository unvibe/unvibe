import Fuse from 'fuse.js';
import { CreateTool, make } from '@/plugins/_types/tools';
import * as llm from '@/server/llm';

/* ------------------------------------------------------------------ */
/* 🛠️  Tool configuration                                             */
/* ------------------------------------------------------------------ */
export const config = make({
  name: 'search_in_files',
  description: `Search the project source for a symbol or string.\nReturns an array of {file, line, context} objects where the symbol occurs.\nUse this when a function or constant is referenced in the conversation but its definition is not in the snippets you already have.
  Use this to find content IN files, don't use this to find files themeselves as you already have all the files provided to you.`,

  usage: `**search_in_files**: Search for a symbol or code string across the codebase.\n\nParams:\n- symbol        (string, required)  : The text or regex to look for.\n- caseSensitive (boolean, optional) : When true, match respecting case. Default false.\n- matchMode     (string, optional)  : One of "exact" | "contains" | "regex" | "fuzzy". Defaults to "contains".\n- subFolders    (string[], optional): Restrict the search to given folders relative to repo root. Each entry may omit the leading "./"; trailing slash optional.`,

  parameters: {
    symbol: { type: 'string', description: 'Symbol or string to search for' },
    caseSensitive: {
      type: 'boolean',
      description: 'Case‑sensitive search (default: false)',
      nullable: true,
    },
    matchMode: {
      type: 'string',
      enum: ['contains', 'exact', 'regex', 'fuzzy'],
      description: 'Search strategy (default: "contains")',
      nullable: true,
    },
    subFolders: {
      type: 'array',
      items: { type: 'string' },
      description:
        'Root‑relative folders to limit the search. Example: ["src/", "packages/utils"].',
      nullable: true,
    },
  },
});

/* ------------------------------------------------------------------ */
/* 🔧  Helper utilities                                               */
/* ------------------------------------------------------------------ */
function getContext(lines: string[], lineIdx: number, radius = 1): string {
  const start = Math.max(0, lineIdx - radius);
  const end = Math.min(lines.length, lineIdx + radius + 1);
  return lines.slice(start, end).join('\n');
}

function escapeForRegex(literal: string): string {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildExactRegex(symbol: string, caseSensitive: boolean): RegExp {
  // \b fails on symbols that contain non‑word characters; fall back to escaped literal
  const boundaryable = /^\w+$/.test(symbol);
  const pattern = boundaryable
    ? `\\b${escapeForRegex(symbol)}\\b`
    : escapeForRegex(symbol);
  return new RegExp(pattern, caseSensitive ? '' : 'i');
}

/* ------------------------------------------------------------------ */
/* 🧩  Tool factory                                                   */
/* ------------------------------------------------------------------ */
export const createTool: CreateTool = ({ project }) => {
  return llm.tool(
    config.name,
    config.description,
    config.parameters,
    async ({
      symbol,
      matchMode = 'contains',
      caseSensitive = false,
      subFolders,
    }) => {
      /* ------------------------------------------------------------------ */
      /* 0. Validation                                                      */
      /* ------------------------------------------------------------------ */
      if (typeof symbol !== 'string' || symbol.trim().length === 0) {
        throw new Error('`symbol` is required and must be a non‑empty string.');
      }
      if (matchMode === 'fuzzy' && symbol.length < 3) {
        throw new Error('Fuzzy search requires `symbol` length ≥ 3.');
      }

      /* ------------------------------------------------------------------ */
      /* 1. Resolve file list                                               */
      /* ------------------------------------------------------------------ */
      const repoFiles = Object.entries(
        project.EXPENSIVE_REFACTOR_LATER_content
      );
      // Normalize and filter by subFolders when provided
      if (subFolders && !Array.isArray(subFolders))
        return {
          error: 'subFolders must be an array of file paths',
        };

      const filesToSearch = subFolders.length
        ? repoFiles.filter(([fp]) =>
            subFolders.some((subFolderPath) => fp.startsWith(subFolderPath))
          )
        : repoFiles;

      /* ------------------------------------------------------------------ */
      /* 2. Prepare search helpers (compile once)                           */
      /* ------------------------------------------------------------------ */
      const symbolLower = symbol.toLowerCase();
      const exactRegex = buildExactRegex(symbol, caseSensitive);
      const userRegex =
        matchMode === 'regex'
          ? new RegExp(symbol, caseSensitive ? '' : 'i')
          : null;

      /* ------------------------------------------------------------------ */
      /* 3. Iterate files                                                   */
      /* ------------------------------------------------------------------ */
      const results: { file: string; line: number; context: string }[] = [];

      for (const [filePath, content] of filesToSearch) {
        const lines = content.split(/\r?\n/);

        switch (matchMode) {
          case 'fuzzy': {
            const fuse = new Fuse(
              lines.map((l, idx) => ({ idx, text: l })),
              {
                keys: ['text'],
                includeScore: true,
                threshold: 0.3,
                isCaseSensitive: caseSensitive,
              }
            );
            const matches = fuse
              .search(symbol, { limit: 50 })
              .filter((m) => m.score! < 0.3);
            for (const m of matches) {
              const idx = m.item.idx;
              results.push({
                file: filePath,
                line: idx + 1,
                context: getContext(lines, idx),
              });
            }
            break;
          }

          case 'regex': {
            lines.forEach((line, idx) => {
              if (userRegex!.test(line)) {
                results.push({
                  file: filePath,
                  line: idx + 1,
                  context: getContext(lines, idx),
                });
              }
            });
            break;
          }

          case 'exact': {
            lines.forEach((line, idx) => {
              if (exactRegex.test(line)) {
                results.push({
                  file: filePath,
                  line: idx + 1,
                  context: getContext(lines, idx),
                });
              }
            });
            break;
          }

          case 'contains':
          default: {
            lines.forEach((line, idx) => {
              const haystack = caseSensitive ? line : line.toLowerCase();
              const needle = caseSensitive ? symbol : symbolLower;
              if (haystack.includes(needle)) {
                results.push({
                  file: filePath,
                  line: idx + 1,
                  context: getContext(lines, idx),
                });
              }
            });
          }
        }
      }

      return results;
    }
  );
};
