// find_and_replace/index.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type FindAndReplace = {
  path: string;
  search: string;
  replace: string;
  expected_matches?: number;
};
export type FindAndReplaces = FindAndReplace[];
export * from './shared';

export const instructions: string = fs.readFileSync(
  path.join(__dirname, 'instructions.md'),
  'utf8'
);
