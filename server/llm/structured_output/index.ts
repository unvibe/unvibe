import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root_instructions: string = fs.readFileSync(
  path.join(__dirname, 'instructions.md'),
  'utf8'
);

export function wrapInstructions(instructions: string): string {
  return root_instructions.replace('{{{slot}}}', instructions);
}

export type StructuredOutput = Record<string, unknown>;
