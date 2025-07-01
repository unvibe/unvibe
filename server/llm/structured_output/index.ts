import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

export const structuredOutputInstructions: string = fs.readFileSync(
  path.join(__dirname, './instructions.md'),
  'utf8'
);
