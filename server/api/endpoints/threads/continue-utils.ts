import { formatStructuredOutputFiles } from '@/server/llm/structured_output/utils';
import { sha1 } from '@/lib/core/hash/sha1';
import { jsonrepair } from 'jsonrepair';
import { normalizePath, runProposalDiagnostics } from '../projects/utils';
import { StructuredOutputMetadata } from '@/server/db/schema';
import { Project } from '@/server/project/types';
import { StructuredOutput } from '@/server/llm/structured_output';
// import { runTransforms } from '@/server/llm/structured_output/transform';
import { VirtualFile } from '@/plugins/_types/plugin.server';
import fs from 'fs/promises';
import path from 'path';
import simpleGit from 'simple-git';
import { noop } from '@/lib/core/noop';
import gitDiffParser from 'gitdiff-parser';

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

        // now safely delete the temp file
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
  const formatted = await formatStructuredOutputFiles(project, repaired);
  const parsed: StructuredOutput = JSON.parse(formatted);
  const diagnostics = await runProposalDiagnostics(parsed, project);

  const replacedPaths = parsed.replace_files?.map((p) => p.path) || [];
  const deletedPaths = parsed.delete_files?.map((p) => p.path) || [];
  const relatedFiles = replacedPaths.concat(deletedPaths);

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

  const [replaceFilesDiffs, deleteFilesDiffs] = await Promise.all([
    createDiffs(project, parsed.replace_files || []),
    (parsed.delete_files || []).map((file) => {
      return {
        path: file.path,
        data: {
          diff: '',
          additions: 0,
          deletions:
            project.EXPENSIVE_REFACTOR_LATER_content[file.path]?.split('\n')
              .length,
        },
      };
    }),
  ]);
  const partialMetadata: StructuredOutputMetadata = {
    raw: response,
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
    parsed,
    source_sha1: sha1Map,
    diffs: {
      replace_files: replaceFilesDiffs,
      delete_files: deleteFilesDiffs,
    },
  };

  return {
    hash,
    partialMetadata,
  };
}
