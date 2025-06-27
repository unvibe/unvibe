import { SiGithub } from 'react-icons/si';
import { ClientPlugin } from '../_types/plugin-client';
import { GithubActionbarSection } from './client/components/github-actionbar-section';
import { id } from './plugin.shared';

export const Plugin: ClientPlugin = {
  id,
  icon: SiGithub,
  components: {
    actionbar: {
      component: GithubActionbarSection,
    },
  },
};
