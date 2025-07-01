import { CreateTool, make } from '@/plugins/_types/tools';
import * as llm from '@/server/llm';

export const config = make({
  name: 'get_file_content',
  description: `Retrieve the content of a file, optionally for a specific range of lines, with line numbers prepended. Useful for contextual editing or referencing code.`,
  usage: `- **get_file_content**: Retrieve content of a file, optionally from line N to M, outputting each line prefixed with its 1-based line number. Params:\n  - path: string (file path, must start with ./)\n  - range_start?: number (1-based inclusive start line)\n  - range_end?: number (1-based inclusive end line)`,
  parameters: {
    path: {
      type: 'string',
      description: 'File path to read, must start with ./',
    },
    range_start: {
      type: 'number',
      description: 'Optional 1-based inclusive start line number',
    },
    range_end: {
      type: 'number',
      description: 'Optional 1-based inclusive end line number',
    },
  },
});

export const createTool: CreateTool = function createGetFileContentTool({
  project,
}) {
  return llm.tool(
    config.name,
    config.description,
    config.parameters,
    async (params) => {
      try {
        const { path, range_start, range_end } = params as {
          path: string;
          range_start?: number;
          range_end?: number;
        };
        if (!path.startsWith('./')) {
          throw new Error(`File path must start with './', got: ${path}`);
        }
        const content = project.EXPENSIVE_REFACTOR_LATER_content[path];
        if (typeof content !== 'string') return `File not found: ${path}`;
        const lines = content.split(/\r?\n/);
        const lineCount = lines.length;
        const start =
          typeof range_start === 'number' ? Math.max(1, range_start) : 1;
        const end =
          typeof range_end === 'number'
            ? Math.min(lineCount, range_end)
            : lineCount;
        if (start > end) return `Invalid range.`;
        const numbered = lines
          .slice(start - 1, end)
          .map((l, i) => `${start + i} ${l}`);
        return [
          `File: ${path}`,
          `Lines: ${start}–${end} / ${lineCount}`,
          '',
          ...numbered,
        ].join('\n');
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        return `Error: ${message}`;
      }
    }
  );
};
