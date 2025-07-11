import fs from 'node:fs/promises';
import path from 'node:path';
import { diffLines, createTwoFilesPatch } from 'diff';
import { Project } from '@/server/project/types';

export type FileDiffStats = {
  path: string;
  diff: {
    linesAdded: number;
    linesRemoved: number;
    isNew: boolean;
    isDeleted: boolean;
    unifiedDiff: string;
  };
};

/**
 * Computes per-file diffs between virtual files and their current on-disk (repo) version.
 * Includes both summary stats and unified diff text.
 */
export async function getPerFileGitDiffs(
  project: Project,
  virtualFiles: { path: string; content: string }[]
): Promise<FileDiffStats[]> {
  const diffs: FileDiffStats[] = [];
  for (const vf of virtualFiles) {
    const absPath = path.join(project.path, vf.path);
    let onDisk = '';
    let fileExists = true;
    try {
      onDisk = await fs.readFile(absPath, 'utf8');
    } catch {
      fileExists = false;
    }
    const diff = diffLines(onDisk, vf.content);
    let linesAdded = 0,
      linesRemoved = 0;
    for (const part of diff) {
      if (part.added) linesAdded += part.count || 0;
      if (part.removed) linesRemoved += part.count || 0;
    }
    // Unified diff string
    const unifiedDiff = createTwoFilesPatch(
      vf.path,
      vf.path,
      onDisk,
      vf.content,
      'a/original',
      'b/virtual',
      { context: 3 }
    );
    diffs.push({
      path: vf.path,
      diff: {
        linesAdded,
        linesRemoved,
        isNew: !fileExists && vf.content.length > 0,
        isDeleted: fileExists && vf.content.length === 0,
        unifiedDiff,
      },
    });
  }
  return diffs;
}
