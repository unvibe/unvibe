import { CreateTool, make } from '@/plugins/_types/tools';
import * as llm from '@/server/llm';

export const config = make({
  name: 'read_file_with_range',
  description: `Retrieve a specific range of lines from a file, with line numbers prepended. Useful for contextual editing or referencing code.`,
  usage: `- **read_file_with_range**: Retrieve content of a file from line N to M, outputting each line prefixed with its 1-based line number. Params:\n  - path: string (file path, must start with ./)\n  - range: [number, number] (1-based inclusive start/end line numbers)`,
  parameters: {
    path: {
      type: 'string',
      description: 'File path to read, must start with ./',
    },
    range: {
      type: 'array',
      description: 'Inclusive [start, end] line numbers (1-based)',
      items: { type: 'number' },
      minItems: 2,
      maxItems: 2,
    },
  },
});

export const createTool: CreateTool = function createReadFileWithRangeTool({
  project,
}) {
  return llm.tool(
    config.name,
    config.description,
    config.parameters,
    async ({ path, range }) => {
      try {
        if (!path.startsWith('./')) {
          throw new Error(`File path must start with './', got: ${path}`);
        }
        const content = project.EXPENSIVE_REFACTOR_LATER_content[path];
        if (typeof content !== 'string') return `File not found: ${path}`;
        const lines = content.split(/\r?\n/);
        const lineCount = lines.length;
        const start = Math.max(1, range[0]);
        const end = Math.min(lineCount, range[1]);
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
