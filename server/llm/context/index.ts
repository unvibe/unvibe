import { Message } from '@/server/db/schema';
import {
  AbstractContextAssistantMessage,
  AbstractContextMessage,
  AbstractContextToolMessage,
  AbstractContextUserMessage,
  AbstractSystemMessage,
  ToolDefinition,
} from '../models/_shared-types';
import { Project } from '@/plugins/core/server/api/lib/project';
import { loadPlugins } from '../structured_output/transform';
import { structuredOutputInstructions } from '../structured_output';
import { db } from '@/server/db';

function fromThreadMessageToAbstractContextMessage(
  message: Message
): AbstractContextMessage {
  if (message.role === 'user') {
    if (message.images_urls && message.images_urls.length > 0) {
      return {
        role: 'user',
        index: message.index,
        content: {
          text: message.content as string,
          images_urls: message.images_urls,
        },
      };
    }
    if (typeof message.content === 'string') {
      return {
        role: 'user',
        index: message.index,
        content: { text: message.content },
      };
    }
    throw new Error(`Invalid message content: ${JSON.stringify(message)}`);
  } else if (message.role === 'tool') {
    return {
      role: 'tool',
      index: message.index,
      content: message.content as string,
      call_id: message.tool_call_id as string,
    };
  } else if (message.role === 'assistant') {
    return {
      role: 'assistant',
      index: message.index,
      content: message.content as string,
      refusal: message.refusal as string,
      tool_calls: message.tool_calls ?? undefined,
    };
  }
  throw new Error(`Unknown message role: ${JSON.stringify(message)}`);
}

export class Context {
  private tools: ToolDefinition[] = [];
  private messages: AbstractContextMessage[] = [];

  public append = {
    user: (config: Omit<AbstractContextUserMessage, 'role' | 'index'>) => {
      const message: AbstractContextUserMessage = {
        role: 'user',
        index: this.messages.length,
        ...config,
      };
      this.messages.push(message);
    },
    system: (config: Omit<AbstractSystemMessage, 'role' | 'index'>) => {
      const message: AbstractSystemMessage = {
        role: 'system',
        index: this.messages.length,
        ...config,
      };
      this.messages.push(message);
    },
    assistant: (
      config: Omit<AbstractContextAssistantMessage, 'role' | 'index'>
    ) => {
      const message: AbstractContextAssistantMessage = {
        role: 'assistant',
        index: this.messages.length,
        ...config,
      };
      this.messages.push(message);
    },
    tool: (config: Omit<AbstractContextToolMessage, 'role' | 'index'>) => {
      const message: AbstractContextToolMessage = {
        role: 'tool',
        index: this.messages.length,
        ...config,
      };
      this.messages.push(message);
    },
    any: (config: AbstractContextMessage) => {
      config.index = this.messages.length;
      this.messages.push(config);
    },
    fromThreadMessages: (messages: Message[]) => {
      const result = messages.map(fromThreadMessageToAbstractContextMessage);
      this.messages.push(...result);
    },
  };

  public setTools(tools: ToolDefinition[]) {
    this.tools = tools;
  }

  public collectMessages() {
    return this.messages;
  }

  private isValidThreadMessageRole(
    role: string
  ): role is (typeof validRoles)[number] {
    const validRoles = ['user', 'assistant', 'tool'] as const;
    const isValidRole = (role: string): role is (typeof validRoles)[number] => {
      return validRoles.includes(role as (typeof validRoles)[number]);
    };
    return isValidRole(role);
  }

  public toThreadMessages(
    contextMessages: AbstractContextMessage[],
    transform: (
      content: AbstractContextMessage,
      messageId: string
    ) => Promise<AbstractContextMessage['content']>,
    thread: { id: string }
  ) {
    return contextMessages.map(async (message) => {
      if (this.isValidThreadMessageRole(message.role)) {
        const id = crypto.randomUUID();

        if (message.content) {
          message.content = await transform(message, id);
        }
        const content = (() => {
          if (!message.content) {
            return null;
          }
          if (typeof message.content === 'string') {
            return message.content;
          } else {
            return message.content.text;
          }
        })();

        const images_urls = (() => {
          if (!message.content) {
            return null;
          }
          if (typeof message.content === 'string') {
            return null;
          } else {
            return message.content.images_urls;
          }
        })();

        return {
          id,
          created_at: Date.now(),
          content,
          images_urls,
          role: message.role,
          thread_id: thread.id,
          index: message.index,
          refusal:
            message.role === 'assistant' ? (message.refusal ?? null) : null,
          tool_call_id:
            message.role === 'tool' ? (message.call_id ?? null) : null,
          tool_calls:
            message.role === 'assistant' ? (message.tool_calls ?? null) : null,
        };
      } else {
        throw new Error(
          `invalid role at -> ${JSON.stringify(message, null, 2)}`
        );
      }
    });
  }

  public getTools() {
    return this.tools;
  }

  public getToolByName(id: string) {
    return this.tools.find((tool) => tool.name === id) ?? null;
  }

  private async getDetailedContext(project: Project) {
    const plugins = await loadPlugins(project);

    return Promise.all(
      plugins.map(async (plugin) => {
        const ctx = await plugin.Plugin.createContext(project);
        return {
          id: plugin.Plugin.id,
          tools: ctx.tools,
          system: ctx.systemParts,
        };
      })
    );
  }

  public async fromProjectConfig(
    project: Project,
    config: Record<string, boolean>
  ) {
    // 1. construct the default config
    const pluginsContexts = await this.getDetailedContext(project);

    // 2. filter tools based on the config
    const tools = pluginsContexts
      .map((pluginContext) => {
        const pluginTools = Object.values(pluginContext.tools);
        const filteredTools = pluginTools
          .filter((tool) => {
            const configKey = `tool/${pluginContext.id}/${tool.config.name}`;
            if (configKey in config) {
              return config[configKey] !== false;
            }
            // If the config key does not exist, we assume the tool is enabled by default
            return true;
          })
          .map((tool) => tool.createTool({ project }));
        return filteredTools;
      })
      .flat();

    // 3. filter the system parts based on the config
    const customSystemParts = await Promise.all(
      Object.keys(project.context_config)
        .filter((key) => key.startsWith(`system/custom/`))
        .map(async (key) => {
          const customKey = key.replace('system/custom/', '');
          const value = await db.query.customSystemParts.findFirst({
            where: (table, { eq, and }) =>
              and(
                eq(table.key, customKey),
                eq(table.project_id, project.path.split('/').pop() || '')
              ),
          });
          return value;
        })
    );

    const resolvedCustomSystemParts = Object.fromEntries(
      customSystemParts
        .filter((value): value is NonNullable<typeof value> => !!value)
        .map((value) => {
          return [
            `system/custom/${value.key}`,
            value.type === 'raw'
              ? value.value
              : value.type === 'file'
                ? project.EXPENSIVE_REFACTOR_LATER_content[value.value]
                : '',
          ];
        })
    );

    const customSystem = Object.keys(config)
      .filter((key) => key.startsWith('system/custom/'))
      .map((key) => resolvedCustomSystemParts[key])
      .filter((value) => !!value)
      .join('\n');

    const systemString =
      pluginsContexts
        .map((pluginContext) => {
          const systemParts = pluginContext.system;
          const filteredParts = Object.entries(systemParts)
            .filter(([key]) => {
              const configKey = `system/${pluginContext.id}/${key}`;
              if (configKey in config) {
                return config[configKey] !== false;
              }
              // If the config key does not exist, we assume the system part is enabled by default
              return true;
            })
            .map(([, value]) => value)
            .join('\n');

          return filteredParts;
        })
        .join('\n') +
      customSystem +
      '\n' +
      structuredOutputInstructions;

    // 4. set the tools and system parts
    this.setTools(tools);
    this.append.system({ content: systemString });
  }

  public getSystemInstructions(): string {
    const systemMessages = this.messages.filter(
      (msg) => msg.role === 'system'
    ) as AbstractSystemMessage[];
    return systemMessages.map((msg) => msg.content).join('\n');
  }
}
