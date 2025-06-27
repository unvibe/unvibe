import { TbDeviceImacStar } from 'react-icons/tb';
import { ClientPlugin } from '../_types/plugin-client';
import * as actions from './client/actions';
import { id } from './plugin.shared';

export const Plugin: ClientPlugin = {
  id,
  icon: TbDeviceImacStar,
  components: {
    assistant: {
      proposal: {
        actions,
      },
    },
  },
};
