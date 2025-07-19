// plugins/core/server/tools/memory.ts
import { make, CreateTool } from '@/plugins/_types/tools';
import * as projectMemory from '@/server/llm/project-memory';
import * as llm from '@/server/llm';

export const config = make({
  name: 'project_memory',
  description: `Store and retrieve persistent project memory using embeddings. All data is stored in .unvibe/<project-id>/memory.json with semantic search.`,
  usage: `**project_memory**: Add or search for persistent memories by semantic embedding.\n\nParams:\n- action (string): 'add' | 'search'.\n- text (string): The memory to store or the query.\n- topK (number, optional): Number of top results when searching.\n- projectId (string): Unique project identifier.`,
  parameters: {
    action: {
      type: 'string',
      enum: ['add', 'search'],
      description:
        'add or search\n\nNOTE: Use `project_memory` to automatically store key project conversations, decisions, or workflow experiments that:\n- Represent important discoveries, design choices, surprising user input, or lessons learned\n- Capture moments of self-reflection, pivots, or feedback that could shape future development\n- Summarize multi-step troubleshooting or any "aha!" moments\n\nSaving should occur:\n- At the end of significant user/AI sessions (upon user approval, or by default if configured)\n- When a user explicitly marks a conversation as important (e.g., tagging or starring)\n- After successful or failed experiments that may inform future automation, plugins, or project direction',
    },
    text: {
      type: 'string',
      description:
        'The memory text or search query.\n\nNOTE: Use `project_memory` to automatically store key project conversations, decisions, or workflow experiments that:\n- Represent important discoveries, design choices, surprising user input, or lessons learned\n- Capture moments of self-reflection, pivots, or feedback that could shape future development\n- Summarize multi-step troubleshooting or any "aha!" moments\n\nSaving should occur:\n- At the end of significant user/AI sessions (upon user approval, or by default if configured)\n- When a user explicitly marks a conversation as important (e.g., tagging or starring)\n- After successful or failed experiments that may inform future automation, plugins, or project direction',
    },
    topK: {
      type: 'number',
      description:
        'Number of top results for search.\n\nNOTE: Use `project_memory` to automatically store key project conversations, decisions, or workflow experiments that:\n- Represent important discoveries, design choices, surprising user input, or lessons learned\n- Capture moments of self-reflection, pivots, or feedback that could shape future development\n- Summarize multi-step troubleshooting or any "aha!" moments\n\nSaving should occur:\n- At the end of significant user/AI sessions (upon user approval, or by default if configured)\n- When a user explicitly marks a conversation as important (e.g., tagging or starring)\n- After successful or failed experiments that may inform future automation, plugins, or project direction',
      default: 3,
    },
  },
});

export const createTool: CreateTool = ({ project }) => {
  return llm.tool(
    config.name,
    config.description,
    config.parameters,
    async ({ action, text, topK = 3 }) => {
      const projectId = btoa(project.path);
      if (action === 'add') {
        await projectMemory.addProjectMemory(projectId, text);
        return { success: true };
      } else if (action === 'search') {
        const results = await projectMemory.searchProjectMemory(
          projectId,
          text,
          topK
        );
        return { results };
      } else {
        throw new Error('Unknown action: ' + action);
      }
    }
  );
};
