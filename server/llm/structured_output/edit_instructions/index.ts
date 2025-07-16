// edit_instructions/index.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type EditInstruction = {
  path: string;
  action: 'replace' | 'insert' | 'delete';
  start_line: number;
  end_line?: number;
  new_content?: string;
};
export type EditInstructions = EditInstruction[];
export const key = 'edit_instructions';

export const instructions: string = fs.readFileSync(
  path.join(__dirname, 'instructions.md'),
  'utf8'
);
