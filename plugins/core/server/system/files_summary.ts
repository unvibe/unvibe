import { Project } from '@/server/project/types';

function summarizeFilePaths(
  rawPaths: string[],
  {
    smallGroupLimit = 15,
    exampleCount = 3,
    maxChildren = 20,
  }: {
    smallGroupLimit?: number;
    exampleCount?: number;
    maxChildren?: number;
  } = {}
): string {
  const cleaned = rawPaths.map((p) => p.replace(/^\.?\//, ''));
  const total = cleaned.length;

  const rootFiles: string[] = [];
  const groups: Record<string, string[]> = {};

  for (const fullPath of cleaned) {
    const parts = fullPath.split('/');
    if (parts.length === 1) rootFiles.push(parts[0]);
    else (groups[parts[0]] ||= []).push(fullPath);
  }

  const lines: string[] = [];
  lines.push('# Codebase Files (summarized)');
  lines.push(`Total files: ${total}`);

  if (rootFiles.length) {
    lines.push('');
    lines.push(`Root files (${rootFiles.length}):`);
    for (const f of rootFiles.sort()) lines.push(`  ${f}`);
  }

  for (const folder of Object.keys(groups).sort()) {
    const files = groups[folder];
    lines.push('');

    if (files.length <= smallGroupLimit) {
      lines.push(`${folder}/`);
      for (const rel of files.sort())
        lines.push(`  ${rel.slice(folder.length + 1)}`);
      continue;
    }

    lines.push(`${folder}/ (${files.length} files)`);

    // Build child groups
    const childGroups: Record<string, string[]> = {};
    for (const fp of files) {
      const rel = fp.slice(folder.length + 1);
      const child = rel.split('/')[0];
      (childGroups[child] ||= []).push(rel);
    }

    const childNames = Object.keys(childGroups).sort().slice(0, maxChildren);
    const omittedChildCount =
      Object.keys(childGroups).length - childNames.length;

    for (const child of childNames) {
      const childFiles = childGroups[child].sort();
      const examples = childFiles.slice(0, exampleCount);
      for (const ex of examples) lines.push(`  ${ex}`);
      const remaining = childFiles.length - examples.length;
      if (remaining > 0) lines.push(`  ... (+${remaining} more in ${child}/)`);
    }

    if (omittedChildCount > 0)
      lines.push(`  ... (+${omittedChildCount} more sibling folders)`);
  }

  return lines.join('\n');
}

export function files_summary(project: Project) {
  return [
    `project full path: ${project.path}`,
    summarizeFilePaths(project.paths),
  ].join('\n\n');
}
