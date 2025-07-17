import { IconType } from 'react-icons/lib';

export interface ClientPlugin {
  id: string;
  icon: IconType;
  components: Record<string, React.ComponentType<unknown>>;
}
