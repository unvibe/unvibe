import { IconType } from 'react-icons/lib';

export interface ClientPlugin {
  id: string;
  icon: IconType;
  structuredOutput?: Record<string, React.ComponentType<unknown>>;
  components: Record<string, React.ComponentType<unknown>>;
}
