import { TbDeviceImacStar } from 'react-icons/tb';
import { ClientPlugin } from '../_types/plugin-client';
import { id } from './plugin.shared';
import * as StructuredOutputCodemodScripts from './server/structured-output/codemod_scripts/component';
import * as StructuredOutputDeleteFiles from './server/structured-output/delete_files/component';
import * as StructuredOutputEditInstructions from './server/structured-output/edit_instructions/component';
import * as StructuredOutputFindAndReplace from './server/structured-output/find_and_replace/component';
import * as StructuredOutputMessage from './server/structured-output/message/component';
import * as StructuredOutputReplaceFiles from './server/structured-output/replace_files/component';
import * as StructuredOutputShellScripts from './server/structured-output/shell_scripts/component';
import * as StructuredOutputSuggestedActions from './server/structured-output/suggested_actions/component';

export const Plugin: ClientPlugin = {
  id,
  icon: TbDeviceImacStar,
  structuredOutput: {
    [StructuredOutputMessage.key]: StructuredOutputMessage.Component,
    [StructuredOutputReplaceFiles.key]: StructuredOutputReplaceFiles.Component,
    [StructuredOutputDeleteFiles.key]: StructuredOutputDeleteFiles.Component,
    [StructuredOutputShellScripts.key]: StructuredOutputShellScripts.Component,
    [StructuredOutputCodemodScripts.key]:
      StructuredOutputCodemodScripts.Component,
    [StructuredOutputFindAndReplace.key]:
      StructuredOutputFindAndReplace.Component,
    [StructuredOutputEditInstructions.key]:
      StructuredOutputEditInstructions.Component,
    [StructuredOutputSuggestedActions.key]:
      StructuredOutputSuggestedActions.Component,
  },
  components: {},
};
