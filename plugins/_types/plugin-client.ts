import type { FileActionProps } from '~/modules/project/threads/details/messages/assistant/assistant-file-actions';
import type { ReactNode } from 'react';
import { IconType } from 'react-icons/lib';

export type { FileActionProps } from '~/modules/project/threads/details/messages/assistant/assistant-file-actions';

export interface ClientPlugin {
  id: string;
  icon: IconType;
  components: {
    actionbar?: {
      component?: () => ReactNode;
    };
    assistant?: {
      proposal?: {
        actions?: Record<string, (props: FileActionProps) => ReactNode>;
        pathDiagnostics?: Record<string, (props: FileActionProps) => ReactNode>;
      };
    };
  };
}
