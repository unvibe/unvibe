import { z } from 'zod';
import { createEndpoint } from '../../create-endpoint';
import { Project } from '@/plugins/core/server/api/lib/project';
import { _parseProject } from './utils';
import { runShellCommand } from '@/plugins/core/server/api/lib/run-shell-command';
import fs from 'node:fs/promises';
import path from 'node:path';
import { noop } from '@/lib/core/noop';
import { resolveEdits, resolveRangeEdits } from '../threads/utils';
import { ModelResponseStructure } from '@/server/llm/structured_output';

async function applyShellScripts(project: Project, scripts?: string[]) {
  if (!scripts || scripts.length === 0) {
    return [];
  }
  const result = await Promise.all(
    scripts.map((script) => runShellCommand(script, { cwd: project.path }))
  );
  return result;
}

async function applyReplacedFiles(
  project: Project,
  replaceFiles?: { path: string; content: string }[]
) {
  if (!replaceFiles || replaceFiles.length === 0) {
    return [];
  }

  return await Promise.all(
    replaceFiles.map(async (entry) => {
      const dir = entry.path.split('/').slice(0, -1).join('/');
      await fs.mkdir(path.join(project.path, dir), { recursive: true });
      await fs.writeFile(
        path.join(project.path, entry.path),
        entry.content ?? '',
        'utf-8'
      );

      return true;
    })
  );
}

async function applyDeletedFiles(
  project: Project,
  deleteFiles?: { path: string }[]
) {
  if (!deleteFiles || deleteFiles.length === 0) {
    return [];
  }
  // This function should delete the specified files from the project directory.
  // For now, we will just log the files to be deleted.
  for (const file of deleteFiles) {
    console.log(`Deleting file ${file.path}`);
    // Here you would delete the file from the filesystem.
  }
  return Promise.all(
    deleteFiles.map(async (entry) => {
      try {
        await fs.unlink(path.join(project.path, entry.path));
      } catch (error) {
        // ignore if file doesn't exist
        noop(error);
      }
      return true;
    })
  );
}

async function applyEditedFiles(
  project: Project,
  editFiles: ModelResponseStructure['edit_files'] = []
) {
  if (!editFiles || editFiles.length === 0) {
    return [];
  }
  const resolved = resolveEdits(editFiles, project);
  return await applyReplacedFiles(project, resolved);
}

async function applyRangedEdits(
  project: Project,
  editRanges: ModelResponseStructure['edit_ranges'] = []
) {
  if (!editRanges || editRanges.length === 0) {
    return [];
  }
  const resolved = resolveRangeEdits(editRanges, project);
  return await applyReplacedFiles(project, resolved);
}

export const acceptProposal = createEndpoint({
  type: 'POST',
  pathname: '/projects/accept-proposal',
  params: z.object({
    projectDirname: z.string(),
    source: z.string(),
    proposal: z.object({
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
    }),
  }),
  handler: async ({ parsed }) => {
    const project = await _parseProject(parsed.source, parsed.projectDirname);
    const scripts = await applyShellScripts(
      project,
      parsed.proposal.shell_scripts || []
    );
    const [deleted, replaced, edited, ranges] = await Promise.all([
      applyDeletedFiles(project, parsed.proposal.delete_files),
      applyReplacedFiles(project, parsed.proposal.replace_files),
      applyEditedFiles(project, parsed.proposal.edit_files),
      applyRangedEdits(project, parsed.proposal.edit_ranges || []),
    ]);

    // TODO: if the thread has messages after that one, we need to invalidate the metadata of each proposal message
    // check the creation of metadata in the /threads/continue endpoint

    return {
      scripts,
      deleted,
      replaced,
      edited,
      ranges,
    };
  },
});
