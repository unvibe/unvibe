import { formatStructuredOutputFiles } from '@/server/llm/structured_output/utils';
import { sha1 } from '@/lib/core/hash/sha1';
import { jsonrepair } from 'jsonrepair';
import { normalizePath, runProposalDiagnostics } from '../projects/utils';
import { StructuredOutputMetadata } from '@/server/db/schema';
import { Project } from '@/plugins/core/server/api/lib/project';
import { StructuredOutput } from '@/server/llm/structured_output';
import { applyRangeEdits } from '@/server/llm/structured_output/resolve-edits';
import { runTransforms } from '@/server/llm/structured_output/transform';

function resolveRangeEdit(
  project: Project,
  rangeEdit: NonNullable<StructuredOutput['edit_ranges']>[number]
) {
  const source =
    project.EXPENSIVE_REFACTOR_LATER_content[normalizePath(rangeEdit.path)] ||
    '';
  const newSource = applyRangeEdits(source, rangeEdit.edits);
  return {
    path: rangeEdit.path,
    content: newSource,
  };
}

function resolveEditedFile(
  project: Project,
  file: NonNullable<StructuredOutput['edit_files']>[number]
) {
  const source =
    project.EXPENSIVE_REFACTOR_LATER_content[normalizePath(file.path)] || '';
  // todo apply the range to the source
  // Apply the edit by lines
  const sourceLines = source.split('\n');
  const editLines = file.content.split('\n');
  // split the source lines in two parts
  const newLines = [...sourceLines];
  newLines.splice(file.insert_at - 1, 0, ...editLines);
  const appliedContent = newLines.join('\n');
  return {
    path: file.path,
    content: appliedContent,
  };
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
  const editedPaths = parsed.edit_files?.map((p) => p.path) || [];
  const editedRanges = parsed.edit_ranges?.map((p) => p.path) || [];
  const relatedFiles = replacedPaths
    .concat(deletedPaths)
    .concat(editedPaths)
    .concat(editedRanges);
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

  const resolvedEditedFiles = parsed.edit_files?.map((file) =>
    resolveEditedFile(project, file)
  );

  const resolvedEditedRanges = parsed.edit_ranges?.map((rangeEdit) =>
    resolveRangeEdit(project, rangeEdit)
  );

  const [formattedRanges, formattedEdits] = await Promise.all([
    await runTransforms(project, resolvedEditedRanges || []),
    await runTransforms(project, resolvedEditedFiles || []),
  ]);

  const partialMetadata: StructuredOutputMetadata = {
    raw: response,
    diagnostics: Object.fromEntries(
      diagnostics.map((hook) => {
        return [hook.name, JSON.parse(hook.result)];
      })
    ),
    parsed,
    source_sha1: sha1Map,
    resolved_edited_files: formattedEdits,
    resolved_edited_ranges: formattedRanges,
  };

  return {
    hash,
    partialMetadata,
  };
}
