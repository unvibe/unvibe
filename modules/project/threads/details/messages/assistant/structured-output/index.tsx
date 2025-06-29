import { StructuredOutputMessage } from './message';
import { StructuredOutputEditFiles } from './edit-files';
import { StructuredOutputReplaceFiles } from './replace-files';
import { StructuredOutputDeleteFiles } from './delete-files';
import { StructuredOutputShellScripts } from './shell-scripts';
// import { FilesTree } from './files-tree';

export { StructuredOutputContextProvider } from './context';

export function StructuredOutput() {
  return (
    <div className='grid gap-2'>
      <StructuredOutputMessage />
      <StructuredOutputShellScripts />
      <StructuredOutputDeleteFiles />
      {/* <FilesTree /> */}
      <StructuredOutputEditFiles />
      <StructuredOutputReplaceFiles />
    </div>
  );
}
