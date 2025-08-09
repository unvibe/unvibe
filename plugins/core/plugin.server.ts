import { ServerPlugin } from '../_types/plugin.server';
import * as tools from './server/tools';
import { id } from './plugin.shared';
import { character } from './server/system/character';
import { files_summary } from './server/system/files_summary';
import { os_info } from './server/system/os_info';
import * as StructuredOutputMessage from './server/structured-output/message';
import * as StructuredOutputReplaceFiles from './server/structured-output/replace_files';
import * as StructuredOutputDeleteFiles from './server/structured-output/delete_files';
import * as StructuredOutputShellScripts from './server/structured-output/shell_scripts';
import * as StructuredOutputCodemodScripts from './server/structured-output/codemod_scripts';
import * as StructuredOutputFindAndReplace from './server/structured-output/find_and_replace';
import * as StructuredOutputEditInstructions from './server/structured-output/edit_instructions';
import * as StructuredOutputSuggestedActions from './server/structured-output/suggested_actions';

export const Plugin: ServerPlugin = {
  id,
  description:
    'Core plugin: provides basic project context, core system tools (character, file summary, os info), and project-wide utilities.',
  detect: async () => Promise.resolve(true),
  createContext: async (project) => {
    return {
      tools,
      systemParts: {
        character,
        files_summary: files_summary(project),
        os_info,
      },
      structuredOutput: [
        StructuredOutputMessage,
        StructuredOutputReplaceFiles,
        StructuredOutputDeleteFiles,
        StructuredOutputShellScripts,
        // StructuredOutputCodemodScripts,
        // StructuredOutputFindAndReplace,
        // StructuredOutputEditInstructions,
        StructuredOutputSuggestedActions,
      ],
    };
  },
};
