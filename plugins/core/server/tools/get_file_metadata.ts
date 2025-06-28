import { CreateTool, make } from '@/plugins/_types/tools';
import * as llm from '@/server/llm';

export const config = make({
  name: 'get_file_metadata',
  description: `Get metadata for a file: line count and file size in bytes.`,
  usage: `- **get_file_metadata**: Returns metadata for a file. Params:\n  - path: string (file path, must start with ./)`,
  parameters: {
    path: {
      type: 'string',
      description: 'File path to get metadata for, must start with ./',
    },
  },
});

export const createTool: CreateTool = function createGetFileMetadataTool({
  project,
}) {
  return llm.tool(
    config.name,
    config.description,
    config.parameters,
    async ({ path }) => {
      try {
        if (!path.startsWith('./')) {
          throw new Error(`File path must start with './', got: ${path}`);
        }
        const content = project.EXPENSIVE_REFACTOR_LATER_content[path];
        if (typeof content !== 'string') return `File not found: ${path}`;
        const lines = content.split(/\r?\n/);
        const lineCount = lines.length;
        const size = Buffer.byteLength(content, 'utf8');
        return {
          path,
          lineCount,
          size,
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        return `Error: ${message}`;
      }
    }
  );
};
