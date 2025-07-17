import { sha1 } from '@/lib/core/hash/sha1';
import { jsonrepair } from 'jsonrepair';
import { normalizePath, runDiagnostics } from '../projects/utils';
import { StructuredOutputMetadata } from '@/server/db/schema';
import { Project } from '@/server/project/types';
import { StructuredOutput } from '@/server/llm/structured_output';
import { VirtualFile } from '@/plugins/_types/plugin.server';
import fs from 'fs/promises';
import path from 'path';
import simpleGit from 'simple-git';
import { noop } from '@/lib/core/noop';
import gitDiffParser from 'gitdiff-parser';
import { runTransforms } from '@/server/llm/structured_output/transform';

export async function createDiffs(
  project: Project,
  virtualFiles: VirtualFile[]
): Promise<
  {
    path: string;
    data: { diff: string; additions: number; deletions: number };
  }[]
> {
  return Promise.all(
    virtualFiles.map(async (vf) => {
      try {
        const tempPath = `/tmp/unvibe_diff_${Date.now()}_temp_file`;
        const tempContent = vf.content;
        await fs.writeFile(tempPath, tempContent);
        const rootPath = project.path;
        const resolvedFilePath = path.join(rootPath, vf.path);

        const fileExists = await fs
          .access(resolvedFilePath)
          .then(() => true)
          .catch(() => false);

        if (!fileExists) {
          console.log(
            `File ${resolvedFilePath} does not exist, returning empty diff.`
          );
          return {
            path: vf.path,
            data: {
              diff: '',
              additions: tempContent.split('\n').length,
              deletions: 0,
            },
          };
        }

        const git = simpleGit({
          baseDir: project.path,
          binary: 'git',
          maxConcurrentProcesses: 6,
        });

        const diff = await git.diff(['--no-index', resolvedFilePath, tempPath]);
        const summary = gitDiffParser.parse(diff)[0];

        const additions = summary?.hunks.reduce(
          (acc, hunk) =>
            acc +
            hunk.changes.reduce(
              (acc, change) => acc + ('isInsert' in change ? 1 : 0),
              0
            ),
          0
        );
        const deletions = summary?.hunks.reduce(
          (acc, hunk) =>
            acc +
            hunk.changes.reduce(
              (acc, change) => acc + ('isDelete' in change ? 1 : 0),
              0
            ),
          0
        );

        try {
          await fs.unlink(tempPath);
        } catch (error) {
          noop(error);
        }

        return {
          path: vf.path,
          data: {
            diff,
            additions: additions || 0,
            deletions: deletions || 0,
          },
        };
      } catch (error) {
        console.error(`Error creating diff for ${vf.path}:`, error);
        return {
          path: vf.path,
          data: { diff: '', additions: 0, deletions: 0 },
        };
      }
    })
  );
}

export async function createMetadata(
  response: string | null | undefined,
  project: Project
) {
  if (!response) return {};
  const hash = await sha1(response);
  const repaired = jsonrepair(response);
  const parsed: StructuredOutput = JSON.parse(repaired);

  const relatedFiles: string[] = [];

  project.registeredStructuredOutput.forEach((entry) => {
    if (entry.resolve && typeof entry.resolve === 'function') {
      // now we can get the files paths
      const files = Array.isArray(parsed[entry.key])
        ? (parsed[entry.key] as { path: string }[])
        : [];

      files.forEach((fileLike: unknown) => {
        if (typeof fileLike === 'object' && fileLike !== null) {
          const filePath = (fileLike as { path: string }).path;
          if (filePath) {
            relatedFiles.push(normalizePath(filePath));
          }
        }
      });
    }
  });

  const sha1Map = Object.fromEntries(
    await Promise.all(
      relatedFiles.map(async (filePath) => {
        const content =
          project.EXPENSIVE_REFACTOR_LATER_content[normalizePath(filePath)] ||
          '';
        return [filePath, await sha1(content)];
      })
    )
  );

  // Gather all originals for resolution
  const originalFiles = Object.entries(
    project.EXPENSIVE_REFACTOR_LATER_content
  ).map(([path, content]) => ({ path, content }));

  // Resolve all structured output types
  const resolved: Record<string, VirtualFile[]> = {};

  await Promise.all(
    Object.entries(parsed).map(async ([so_key, value]) => {
      const entry = project.registeredStructuredOutput.find(
        (e) => e.key === so_key
      );
      if (!entry) return;
      if (entry.resolve) {
        resolved[so_key] = await entry.resolve(value, originalFiles);
      }
    })
  );

  // format all resolved files
  await Promise.all(
    Object.entries(resolved).map(async ([so_key, vFiles]) => {
      resolved[so_key] = await runTransforms(project, vFiles);
    })
  );

  // diff all resolved files
  const diffsEntries = await Promise.all(
    Object.entries(resolved).map(async ([so_key, vFiles]) => {
      const diff = await createDiffs(project, vFiles);
      return [so_key, diff] as const;
    })
  );
  const diffs = Object.fromEntries(diffsEntries);

  // run diagnostics for all structured output types
  const diagnostics = await runDiagnostics(
    project,
    Object.values(resolved).flat()
  );

  const partialMetadata: StructuredOutputMetadata = {
    raw: response,
    parsed,
    source_sha1: sha1Map,
    diffs,
    resolved,
    diagnostics: Object.fromEntries(
      diagnostics.map((hook) => {
        try {
          return [hook.name, JSON.parse(hook.result)];
        } catch (error) {
          console.log(
            `Hook Run Failed: ${hook.name} diagnostics:`,
            hook.result,
            error
          );
          return [hook.name, {}];
        }
      })
    ),
  };

  return {
    hash,
    partialMetadata,
  };
}
