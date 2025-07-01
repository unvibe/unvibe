// plugins/core/server/tools/fuzzy_search_files.ts
import Fuse from 'fuse.js';
import { CreateTool, make } from '@/plugins/_types/tools';
import * as llm from '@/server/llm';

export const config = make({
  name: 'fuzzy_search_files',
  description: `Given a file name or partial path, returns a ranked list of matching file paths from the project using fuzzy search (Fuse.js). Useful for quickly finding files by approximate name.`,
  usage: `**fuzzy_search_files**: Fuzzy search for a file path by name or partial name.\n\nParams:\n- fileName (string, required): The file name or partial path to search for.\n- limit (number, optional): Max number of results to return (default: 10).`,
  parameters: {
    fileName: {
      type: 'string',
      description: 'File name or partial path to search for',
    },
    limit: {
      type: 'number',
      description: 'Maximum number of results to return',
      nullable: true,
    },
  },
});

export const createTool: CreateTool = ({ project }) => {
  return llm.tool(
    config.name,
    config.description,
    config.parameters,
    async ({ fileName, limit = 10 }) => {
      if (typeof fileName !== 'string' || fileName.trim().length === 0) {
        throw new Error(
          '`fileName` is required and must be a non‑empty string.'
        );
      }
      const filePaths = Object.keys(project.EXPENSIVE_REFACTOR_LATER_content);
      const fuse = new Fuse(filePaths, {
        includeScore: true,
        threshold: 0.4,
        ignoreLocation: true,
      });
      const matches = fuse.search(fileName, { limit });
      return matches.map(({ item, score }) => ({ path: item, score }));
    }
  );
};
