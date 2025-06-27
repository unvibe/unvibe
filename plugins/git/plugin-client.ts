import { SiGit } from 'react-icons/si';
import { ClientPlugin } from '../_types/plugin-client';
import * as actions from './client/actions';
import * as pathDiagnostics from './client/path-diagnostics';
import { id } from './plugin.shared';

export const Plugin: ClientPlugin = {
  id,
  icon: SiGit,
  components: {
    assistant: {
      proposal: {
        actions,
        pathDiagnostics,
      },
    },
  },
};
