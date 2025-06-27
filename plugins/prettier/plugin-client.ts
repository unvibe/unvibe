import { ClientPlugin } from '../_types/plugin-client';
import { id } from './plugin.shared';
import { SiPrettier } from 'react-icons/si';

export const Plugin: ClientPlugin = {
  id,
  icon: SiPrettier,
  components: {},
};
