import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as delete_files from './delete_files';
import * as shell_scripts from './shell_scripts';
import * as replace_files from './replace_files';
import * as message from './message';
import * as suggested_actions from './suggested_actions';

const instructions = [
  message.instructions,
  replace_files.instructions,
  delete_files.instructions,
  shell_scripts.instructions,
  suggested_actions.instructions,
].join('\n\n---\n\n');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type StructuredOutput = {
  message: message.Message;
  replace_files?: replace_files.ReplaceFiles;
  delete_files?: delete_files.DeleteFiles;
  shell_scripts?: shell_scripts.ShellScripts;
  suggested_actions?: suggested_actions.SuggestedPrompts;
};

export const structuredOutputInstructions: string = fs
  .readFileSync(path.join(__dirname, './instructions.md'), 'utf8')
  .replace('{{{slot}}}', instructions);
