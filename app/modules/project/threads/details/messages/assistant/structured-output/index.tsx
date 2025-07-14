import { StructuredOutputMessage } from './message';
import { StructuredOutputReplaceFiles } from './replace-files';
import { StructuredOutputDeleteFiles } from './delete-files';
import { StructuredOutputShellScripts } from './shell-scripts';

export { StructuredOutputContextProvider } from './context';

export function StructuredOutput() {
  return (
    <div className='grid gap-2'>
      <StructuredOutputMessage />
      <StructuredOutputShellScripts />
      <StructuredOutputDeleteFiles />
      <StructuredOutputReplaceFiles />
    </div>
  );
}
