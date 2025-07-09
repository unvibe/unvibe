import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { instructions as delete_files } from './delete_files';
import { instructions as edit_files } from './edit_files';
import { instructions as shell_scripts } from './shell_scripts';
import { instructions as replace_files } from './replace_files';
import { instructions as edit_ranges } from './edit_ranges';
import { instructions as message } from './message';

const instructions = [
  message,
  replace_files,
  delete_files,
  edit_files,
  edit_ranges,
  shell_scripts,
].join('\n\n---\n\n');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type StructuredOutput = {
  message: string;
  replace_files?: { path: string; content: string }[];
  delete_files?: { path: string }[];
  edit_files?: { path: string; content: string; insert_at: number }[];
  edit_ranges?: {
    path: string;
    edits: { start: number; end: number; content: string }[];
  }[];
  shell_scripts?: string[];
};

export const structuredOutputInstructions: string = fs
  .readFileSync(path.join(__dirname, './instructions.md'), 'utf8')
  .replace('{{{slot}}}', instructions);

console.log(structuredOutputInstructions);
