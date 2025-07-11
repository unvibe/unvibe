import { z } from 'zod';
import { createEndpoint } from '../../create-endpoint';
import { Project } from '@/server/project/types';
import { _parseProject } from './utils';
import { runShellCommand } from '@/lib/server/run-shell-command';
import fs from 'node:fs/promises';
import path from 'node:path';
import { noop } from '@/lib/core/noop';
import { resolveEdits, resolveRangeEdits } from '../threads/utils';
import { StructuredOutput } from '@/server/llm/structured_output';
import { runTransforms } from '@/server/llm/structured_output/transform';

type Acceptance = {
  shell_scripts: {
    script: string;
    status: 'success' | 'error';
    payload?: string;
  }[];
  replace_files: {
    path: string;
    status: 'success' | 'error';
    payload?: string;
  }[];
  delete_files: {
    path: string;
    status: 'success' | 'error';
    payload?: string;
  }[];
  edit_files: { path: string; status: 'success' | 'error'; payload?: string }[];
  edit_ranges: {
    path: string;
    status: 'success' | 'error';
    payload?: string;
  }[];
};

async function applyShellScripts(
  project: Project,
  scripts?: string[],
  selection?: { script: string; selected: boolean }[]
): Promise<Acceptance['shell_scripts']> {
  if (!scripts || scripts.length === 0) {
    return [];
  }
  const selected = selection
    ? scripts.filter((script) =>
        selection.some((s) => s.script === script && s.selected)
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
      return { script, status, payload: value };
    })
  );
}

async function _applyFullFile(
  project: Project,
  entry: { path: string; content: string }
): Promise<void> {
  const dir = entry.path.split('/').slice(0, -1).join('/');
  await fs.mkdir(path.join(project.path, dir), { recursive: true });
  await fs.writeFile(
    path.join(project.path, entry.path),
    entry.content ?? '',
    'utf-8'
  );
}

async function applyReplaceFiles(
  project: Project,
  replaceFiles?: { path: string; content: string }[],
  selection?: { path: string; selected: boolean }[]
): Promise<Acceptance['replace_files']> {
  if (!replaceFiles || replaceFiles.length === 0) {
    return [];
  }

  const selected = selection
    ? replaceFiles.filter((file) =>
        selection.some((s) => s.path === file.path && s.selected)
      )
    : replaceFiles;

  return await Promise.all(
    selected.map(async (entry) => {
      let status: 'success' | 'error';
      try {
        await _applyFullFile(project, entry);
        status = 'success';
      } catch (error) {
        status = 'error';
        // ignore if file doesn't exist or can't be written
        noop(error);
      }

      return { path: entry.path, status, payload: '' };
    })
  );
}

async function applyDeletedFiles(
  project: Project,
  deleteFiles?: { path: string }[],
  selection?: { path: string; selected: boolean }[]
): Promise<Acceptance['delete_files']> {
  if (!deleteFiles || deleteFiles.length === 0) {
    return [];
  }

  const selected = selection
    ? deleteFiles.filter((file) =>
        selection.some((s) => s.path === file.path && s.selected)
      )
    : deleteFiles;

  return Promise.all(
    selected.map(async (entry) => {
      try {
        await fs.unlink(path.join(project.path, entry.path));
        return { path: entry.path, status: 'success', payload: '' };
      } catch (error) {
        let payload = '';
        if (error instanceof Error) {
          payload = `Error: ${error.message}`;
        } else if (typeof error === 'string') {
          payload = `Error: ${error}`;
        } else {
          payload = 'Error: An unexpected error occurred: ' + String(error);
        }

        return { path: entry.path, status: 'error', payload: payload };
      }
    })
  );
}

async function applyEditedFiles(
  project: Project,
  editFiles?: StructuredOutput['edit_files'],
  selection?: { path: string; selected: boolean }[]
): Promise<Acceptance['edit_files']> {
  if (!editFiles || editFiles.length === 0) {
    return [];
  }
  const resolved = resolveEdits(editFiles, project);
  const formatted = await runTransforms(project, resolved);
  const selected = selection
    ? formatted.filter((file) =>
        selection.some((s) => s.path === file.path && s.selected)
      )
    : formatted;

  return Promise.all(
    selected.map(async (entry) => {
      let status: 'success' | 'error';
      let payload = '';
      try {
        await _applyFullFile(project, entry);
        status = 'success';
      } catch (error) {
        status = 'error';
        if (error instanceof Error) {
          payload = `Error: ${error.message}`;
        } else if (typeof error === 'string') {
          payload = `Error: ${error}`;
        } else {
          payload = 'Error: An unexpected error occurred: ' + String(error);
        }
      }
      return { path: entry.path, status, payload };
    })
  );
}

async function applyRangedEdits(
  project: Project,
  editRanges?: StructuredOutput['edit_ranges'],
  selections?: { path: string; selected: boolean }[]
): Promise<Acceptance['edit_ranges']> {
  if (!editRanges || editRanges.length === 0) {
    return [];
  }
  const resolved = resolveRangeEdits(editRanges, project);
  const formatted = await runTransforms(project, resolved);
  const selected = selections
    ? formatted.filter((file) =>
        selections.some((s) => s.path === file.path && s.selected)
      )
    : formatted;
  return Promise.all(
    selected.map(async (entry) => {
      let status: 'success' | 'error';
      let payload = '';
      try {
        await _applyFullFile(project, entry);
        status = 'success';
      } catch (error) {
        status = 'error';
        if (error instanceof Error) {
          payload = `Error: ${error.message}`;
        } else if (typeof error === 'string') {
          payload = `Error: ${error}`;
        } else {
          payload = 'Error: An unexpected error occurred: ' + String(error);
        }
      }
      return { path: entry.path, status, payload };
    })
  );
}

const proposalSelectionSchema = z.object({
  replace_files: z
    .array(z.object({ path: z.string(), selected: z.boolean() }))
    .optional(),
  delete_files: z
    .array(z.object({ path: z.string(), selected: z.boolean() }))
    .optional(),
  edit_files: z
    .array(z.object({ path: z.string(), selected: z.boolean() }))
    .optional(),
  edit_ranges: z
    .array(z.object({ path: z.string(), selected: z.boolean() }))
    .optional(),
  shell_scripts: z
    .array(z.object({ script: z.string(), selected: z.boolean() }))
    .optional(),
});

const proposalSchema = z.object({
  messageId: z.string(),
  message: z.string(),
  replace_files: z
    .array(z.object({ path: z.string(), content: z.string() }))
    .optional(),
  delete_files: z.array(z.object({ path: z.string() })).optional(),
  edit_ranges: z
    .array(
      z.object({
        path: z.string(),
        edits: z.array(
          z.object({
            start: z.number(), // 0-based index
            end: z.number(), // 0-based index
            content: z.string(),
          })
        ),
      })
    )
    .optional(),
  edit_files: z
    .array(
      z.object({
        path: z.string(),
        content: z.string(),
        insert_at: z.number(), // 1-based index
      })
    )
    .optional(),
  shell_scripts: z.array(z.string()).optional(),
});

export const acceptProposal = createEndpoint({
  type: 'POST',
  pathname: '/projects/accept-proposal',
  params: z.object({
    id: z.string(), // project id
    selections: proposalSelectionSchema,
    proposal: proposalSchema,
  }),
  handler: async ({ parsed }) => {
    const project = await _parseProject(parsed.id);
    const scripts = await applyShellScripts(
      project,
      parsed.proposal.shell_scripts,
      parsed.selections.shell_scripts
    );

    const [deleted, replaced, edited, ranges] = await Promise.all([
      applyDeletedFiles(
        project,
        parsed.proposal.delete_files,
        parsed.selections.delete_files
      ),
      applyReplaceFiles(
        project,
        parsed.proposal.replace_files,
        parsed.selections.replace_files
      ),
      applyEditedFiles(
        project,
        parsed.proposal.edit_files,
        parsed.selections.edit_files
      ),
      applyRangedEdits(
        project,
        parsed.proposal.edit_ranges,
        parsed.selections.edit_ranges
      ),
    ]);

    return {
      scripts,
      deleted,
      replaced,
      edited,
      ranges,
    };
  },
});
