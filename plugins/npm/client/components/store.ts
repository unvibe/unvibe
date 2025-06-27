import { create } from 'zustand';
import type { StructuredChatMessage } from '@/server/websocket/types';
import type { ProcessMetadata } from '@/plugins/core/server/api';
import { immer } from 'zustand/middleware/immer';
import { socket } from '@/lib/react/useSocket';

export const useScriptsStore = create<{
  data: Record<string, ProcessMetadata[]>;
}>()(
  immer((set) => {
    socket?.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (typeof data === 'object' && data !== null) {
        const candidate = data as StructuredChatMessage<{
          data: ProcessMetadata;
        }>;
        if (candidate && candidate.id === 'project-run-script') {
          set((state) => {
            const path = candidate.content.data.cwd as string;
            if (!state.data[path]) {
              state.data[path] = [];
            }
            const indexOfExisting = state.data[path].findIndex(
              (item) => item.command === candidate.content.data.command
            );

            if (indexOfExisting === -1) {
              state.data[path].push(candidate.content.data);
            } else {
              // Update the existing entry
              state.data[path][indexOfExisting] = candidate.content.data;
            }
          });
        }
      }
    });
    return {
      data: {},
    };
  })
);
