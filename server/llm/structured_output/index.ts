// server/llm/structured_output/index.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as delete_files from './delete_files';
import * as shell_scripts from './shell_scripts';
import * as replace_files from './replace_files';
import * as message from './message';
import * as suggested_actions from './suggested_actions';
import * as edit_instructions from './edit_instructions';
import * as codemod_scripts from './codemod_scripts';
import * as find_and_replace from './find_and_replace';

const instructions = [
  message.instructions,
  replace_files.instructions,
  delete_files.instructions,
  shell_scripts.instructions,
  suggested_actions.instructions,
  edit_instructions.instructions,
  codemod_scripts.instructions,
  find_and_replace.instructions,
].join('\n\n---\n\n');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export const structuredOutputInstructions: string = fs
  .readFileSync(path.join(__dirname, './instructions.md'), 'utf8')
  .replace('{{{slot}}}', instructions);
