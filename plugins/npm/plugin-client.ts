import { SiNpm } from 'react-icons/si';
import { ClientPlugin } from '../_types/plugin-client';
import { NPMActionbarSection } from './client/components/npm-actionbar-section';
import { id } from './plugin.shared';

export const Plugin: ClientPlugin = {
  id,
  icon: SiNpm,
  components: {
    actionbar: {
      component: NPMActionbarSection,
    },
  },
};
