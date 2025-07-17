import { runShellCommand } from '@/lib/server/run-shell-command';
import { StructuredOutputEntry } from '@/plugins/_types/plugin.server';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type ShellScripts = string[];
export * from './shared';

export const instructions: string = fs.readFileSync(
  path.join(__dirname, 'instructions.md'),
  'utf8'
);

export const apply: StructuredOutputEntry['apply'] = async function apply(
  project,
  scripts: ShellScripts,
  selections
) {
  if (!scripts || scripts.length === 0) {
    return [];
  }
  const selected = selections
    ? scripts.filter((script) =>
        selections.some((s) => s.path === script && s.selected)
      )
    : scripts;

  return await Promise.all(
    selected.map(async (script) => {
      let value: string;
      let status: 'success' | 'error';
      try {
        value = await runShellCommand(script, { cwd: project.path });
        status = 'success';
      } catch (error) {
        status = 'error';
        if (error == null || error === undefined) {
          value = 'Error: Unknown error occurred';
        } else if (typeof error === 'string') {
          value = error;
        } else if (error instanceof Error) {
          value = `Error: ${error.message}`;
        }
        value = `Error: An unexpected error occurred ${error}`;
      }
      return { path: script, status, payload: value };
    })
  );
};
