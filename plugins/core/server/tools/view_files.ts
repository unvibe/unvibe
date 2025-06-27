import { CreateTool, make } from '@/plugins/_types/tools';
import * as llm from '@/server/llm';

export const config = make({
  name: 'view_files',
  description:
    'Retrieve the content of each file in a list, with only a single call needed per file. The file paths must match exactly as provided. Use this to get the content of a file when unsure about the content—calling multiple times for the same file is unnecessary and wasteful.',
  usage:
    '- **view_files**: Retrieve the content of files with just one call per file or file list. Use the exact file path from the project-provided file list. Do not call this tool repeatedly for the same file.',
  parameters: {
    paths: {
      type: 'array',
      description:
        'List of file paths to retrieve content for, must start with ./',
      items: {
        type: 'string',
      },
    },
  },
});

interface ViewFilesArgs {
  paths: string[];
}

export const createTool: CreateTool = function createViewFilesTool({
  project,
}) {
  return llm.tool(
    config.name,
    config.description,
    config.parameters,
    async ({ paths }: ViewFilesArgs) => {
      try {
        const filesMap = project.EXPENSIVE_REFACTOR_LATER_content;
        const result = Object.fromEntries(
          paths.map((path) => {
            if (!path.startsWith('./')) {
              throw new Error(`File path must start with './', got: ${path}`);
            }
            return [path, filesMap[path]];
          })
        );
        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        const stack = error instanceof Error ? error.stack : undefined;
        return {
          status: false,
          message,
          stack,
        };
      }
    }
  );
};
