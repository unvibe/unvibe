import { Project } from '@/server/project/types';
import path from 'node:path';
import simpleGit from 'simple-git';
import fs from 'node:fs/promises';
import { noop } from '@/lib/core/noop';

export async function gitListBranches(project: Project): Promise<string[]> {
  const git = simpleGit({
    baseDir: project.path,
    binary: 'git',
    maxConcurrentProcesses: 6,
  });
  const branches = await git.branch();
  return branches.all;
}

export async function gitCurrentBranch(
  project: Project
): Promise<string | null> {
  const git = simpleGit({
    baseDir: project.path,
    binary: 'git',
    maxConcurrentProcesses: 6,
  });
  const branchSummary = await git.branch();
  return branchSummary.current;
}

export async function gitCreateBranch(
  project: Project,
  branchName: string
): Promise<string> {
  const git = simpleGit({
    baseDir: project.path,
    binary: 'git',
    maxConcurrentProcesses: 6,
  });
  await git.checkoutLocalBranch(branchName);
  return branchName;
}

export async function gitCommit(
  project: Project,
  message: string
): Promise<string> {
  const git = simpleGit({
    baseDir: project.path,
    binary: 'git',
    maxConcurrentProcesses: 6,
  });
  await git.add('.');
  const commitResult = await git.commit(message);
  return commitResult.commit;
}

export async function gitPush(
  project: Project,
  remote: string = 'origin',
  branch?: string
): Promise<string> {
  const git = simpleGit({
    baseDir: project.path,
    binary: 'git',
    maxConcurrentProcesses: 6,
  });
  const branchName = branch || (await gitCurrentBranch(project));
  if (!branchName) throw new Error('No branch specified or detected for push.');
  const pushResult = await git.push(remote, branchName);
  return pushResult.pushed.length > 0
    ? `Pushed to ${remote}/${branchName}`
    : 'Nothing to push.';
}

export async function gitDiffDraft(
  project: Project,
  draftFile: { path: string; content: string }
): Promise<{ diff: string; fileExists: boolean; error?: string }> {
  const filePath = draftFile.path;
  const content = draftFile.content;
  const tempPath = `/tmp/${Date.now()}_temp_file`;
  try {
    // make tempfile
    const tempFilePath = tempPath;
    const tempFileContent = content;
    await fs.writeFile(tempFilePath, tempFileContent);
    const rootPath = project.path;
    const resolvedFilePath = path.join(rootPath, filePath);
    const fileExists = await fs
      .access(resolvedFilePath)
      .then(() => true)
      .catch(() => false);

    if (!fileExists) {
      return {
        diff: '',
        fileExists,
      };
    }
    const git = simpleGit({
      baseDir: rootPath,
      binary: 'git',
      maxConcurrentProcesses: 6,
    });

    const diff = await git.diff(['--no-index', resolvedFilePath, tempFilePath]);
    try {
      await fs.unlink(tempFilePath);
    } catch {
      noop();
    }
    return { diff, fileExists };
  } catch (error) {
    // clear any temp files
    try {
      await fs.unlink(tempPath);
    } catch {
      noop();
    }
    if (error instanceof Error) {
      return {
        diff: '',
        fileExists: false,
        error: `Error: ${error.message}`,
      };
    }
    return {
      diff: '',
      fileExists: false,
      error: `Error: ${JSON.stringify(error)}`,
    };
  }
}
