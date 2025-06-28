import type { ModelResponseStructure } from '@/server/llm/structured_output';
import { StructuredOutputContextProvider } from './context';
import { StructuredOutputMessage } from './message';
import { StructuredOutputEditFiles } from './edit-files';
import { StructuredOutputReplaceFiles } from './replace-files';
import { StructuredOutputDeleteFiles } from './delete-files';
import { StructuredOutputShellScripts } from './shell-scripts';

export { StructuredOutputContextProvider } from './context';

export function StructuredOutput() {
  return (
    <div className='grid gap-2'>
      <StructuredOutputMessage />
      <StructuredOutputEditFiles />
      <StructuredOutputReplaceFiles />
      <StructuredOutputDeleteFiles />
      <StructuredOutputShellScripts />
    </div>
  );
}
