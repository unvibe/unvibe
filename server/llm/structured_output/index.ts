// server/llm/structured_output/index.ts
import * as delete_files from '@/plugins/core/server/structured-output/delete_files';
import * as shell_scripts from '@/plugins/core/server/structured-output/shell_scripts';
import * as replace_files from '@/plugins/core/server/structured-output/replace_files';
import * as message from '@/plugins/core/server/structured-output/message';
import * as suggested_actions from '@/plugins/core/server/structured-output/suggested_actions';
import * as edit_instructions from '@/plugins/core/server/structured-output/edit_instructions';
import * as codemod_scripts from '@/plugins/core/server/structured-output/codemod_scripts';
import * as find_and_replace from '@/plugins/core/server/structured-output/find_and_replace';

export type StructuredOutput = {
  message: message.Message;
  replace_files?: replace_files.ReplaceFiles;
  delete_files?: delete_files.DeleteFiles;
  shell_scripts?: shell_scripts.ShellScripts;
  suggested_actions?: suggested_actions.SuggestedPrompts;
  edit_instructions?: edit_instructions.EditInstructions;
  codemod_scripts?: codemod_scripts.CodemodScripts;
  find_and_replace?: find_and_replace.FindAndReplaces;
};
