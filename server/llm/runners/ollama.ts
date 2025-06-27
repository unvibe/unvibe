import {
  AbstractContextAssistantMessage,
  AbstractContextMessage,
  AbstractContextToolMessage,
  AbstractContextUserMessage,
  ModelConfig,
  RunInput,
  RunOutput,
  Tools,
} from '../models/_shared-types';
import { sendWebsocketEvent } from '@/server/websocket/server';
import ollama, { Tool, ToolCall, Message } from 'ollama';

export const id = 'ollama';

function getToolByName(tools: Tools, name: string) {
  return tools?.find((tool) => tool.name === name);
}

function getFunctionArgs(toolCall: ToolCall) {
  try {
    return toolCall.function.arguments;
  } catch (error) {
    console.log('Error parsing function arguments from llm:', error);
    return {};
  }
}

async function safelyRunToolCallback(
  callback: () => Promise<unknown> | unknown
) {
  try {
    return await callback();
  } catch (error) {
    console.error('Error running tool callback:', error);
    if (error instanceof Error) {
      return error.message || 'Error running tool callback';
    }
    return 'Error running tool callback';
  }
}

async function resolveToolCalls(tools: Tools, toolCalls: ToolCall[]) {
  // Call the tool with the provided arguments
  const queue = toolCalls.map((toolCall) => {
    const name = toolCall.function.name;
    const tool = getToolByName(tools, name);
    const args = getFunctionArgs(toolCall);
    const callback = tool?.fn;

    if (!tool || !callback) {
      return async () => ({
        name: toolCall.function.name,
        result: `Tool "${toolCall.function.name}" not found`,
      });
    }

    const callbackResultPromise = safelyRunToolCallback(() => callback(args));

    return async () => ({
      name: toolCall.function.name,
      result: await callbackResultPromise,
    });
  }) as (() => Promise<{ id: string; result: unknown; name: string }>)[];

  return await Promise.all(queue.map((fn) => fn?.()));
}

function normalizeToolDefinition(toolDefs: Tools): Tool[] {
  return (toolDefs || [])?.map((tool) => {
    return {
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: 'object',
          properties: tool.parameters,
          additionalProperties: false,
          required: Object.keys(tool.parameters || {}),
        },
        strict: true,
      },
    } as Tool;
  });
}

function normalizeContextUserMessage(
  message: AbstractContextUserMessage
): Message {
  if (message.content.images_urls && message.content.images_urls.length > 0) {
    return {
      role: 'user',
      content: message.content.text,
    };
  }
  return {
    role: 'user',
    content: message.content.text,
  };
}

function normalizeContextToolMessage(
  message: AbstractContextToolMessage
): Message {
  return {
    role: 'tool',
    content: message.content,
  };
}

function normalizeContextAssistantMessage(
  message: AbstractContextAssistantMessage
): Message {
  return {
    role: 'assistant',
    content: message.content,
    tool_calls: message.tool_calls?.map((toolCall) => ({
      function: {
        name: toolCall.function.name,
        arguments: JSON.parse(toolCall.function.arguments),
      },
    })),
  };
}
function fromAbstractContextMessagesToChatCompletionMessage(
  context: RunInput['context']
): Message[] {
  return context.collectMessages().map((message): Message => {
    if (message.role === 'user') {
      return normalizeContextUserMessage(message);
    } else if (message.role === 'tool') {
      return normalizeContextToolMessage(message);
    } else if (message.role === 'assistant') {
      return normalizeContextAssistantMessage(message);
    } else if (message.role === 'system') {
      return message;
    } else {
      throw new Error(`Unknown message role: ${JSON.stringify(message)}`);
    }
  });
}

function fromChatCompletionMessageToAbstractContextMessage(
  message: Message
): AbstractContextMessage {
  if (message.role === 'user') {
    if (typeof message.content === 'string') {
      return {
        role: 'user',
        index: 0,
        content: {
          text: message.content,
        },
      };
    } else {
      throw new Error(`Unknown message content: ${JSON.stringify(message)}`);
    }
  } else if (message.role === 'tool') {
    return {
      role: 'tool',
      index: 0,
      content: message.content as string,
      call_id: '',
    };
  } else if (message.role === 'assistant') {
    return {
      role: 'assistant',
      index: 0,
      content: message.content as string,
      tool_calls: message.tool_calls?.map((tc) => ({
        id: '',
        type: 'function',
        function: {
          name: tc.function.name,
          arguments: JSON.stringify(tc.function.arguments),
        },
      })),
    };
  }

  throw new Error(`Unknown message role: ${JSON.stringify(message)}`);
}

function parseToolResult(result: unknown): string {
  try {
    if (typeof result === 'string') {
      return result;
    } else if (typeof result === 'object' && result !== null) {
      return JSON.stringify(result, null, 2);
    } else {
      return String(result);
    }
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Error parsing tool result';
  }
}

async function execToolCalls({
  tag,
  tools,
  toolCalls,
  _config,
  // initialResponse,
  MODEL_CONFIG,
}: {
  tag?: string;
  tools: Tools;
  toolCalls: ToolCall[];
  _config: RunInput;
  // initialResponse: ChatResponse & {
  //   _request_id?: string | null;
  // };
  MODEL_CONFIG: ModelConfig;
}) {
  const results = await resolveToolCalls(tools, toolCalls);

  sendWebsocketEvent({
    ts: Date.now(),
    id: 'io_llm',
    type: 'json',
    content: {
      tag,
      type: 'tools_result',
      model: MODEL_CONFIG.id,
      // usage: initialResponse?.,
    },
  });

  for (const result of results) {
    _config.context.append.tool({
      call_id: result?.id,
      content: parseToolResult(result?.result),
    });
  }

  return run({ ..._config, MODEL_CONFIG });
}

async function run(
  _config: RunInput & { MODEL_CONFIG: ModelConfig }
): RunOutput {
  const { structuredOutput, tag, MODEL_CONFIG } = _config;

  const tools = _config.context.getTools();
  const llmTools = normalizeToolDefinition(tools);

  try {
    // ? -- websocket task
    sendWebsocketEvent({
      ts: Date.now(),
      id: 'io_llm',
      type: 'json',
      content: {
        type: 'call',
        tag,
        model: MODEL_CONFIG.id,
        input:
          _config.context.collectMessages()[
            _config.context.collectMessages().length - 1
          ]?.content,
      },
    });
    // ? --
    console.log('running llm with the model', MODEL_CONFIG.id);
    console.log('running llm with the context', _config.context);
    const response = await ollama.chat({
      model: MODEL_CONFIG.id,
      // temperature: 0.7,
      format: structuredOutput ? 'json' : undefined,
      messages: fromAbstractContextMessagesToChatCompletionMessage(
        _config.context
      ),
      tools: MODEL_CONFIG.supports.tools ? llmTools : undefined,
      stream: false,
    });
    console.log('response', response);

    // update the context with the assistant's response
    _config.context.append.any(
      fromChatCompletionMessageToAbstractContextMessage(response.message)
    );

    // Check if the response contains a tool call
    const toolCalls = response.message.tool_calls;

    // ? -- websocket task
    sendWebsocketEvent({
      ts: Date.now(),
      id: 'io_llm',
      type: 'json',
      content: {
        type: 'response',
        tag,
        model: MODEL_CONFIG.id,
        usage: {},
        output: response.message.content,
        toolCalls: toolCalls,
      },
    });
    // ? --

    if (Array.isArray(toolCalls) && toolCalls.length > 0) {
      return await execToolCalls({
        tag,
        tools,
        toolCalls,
        _config,
        // initialResponse: response,
        MODEL_CONFIG,
      });
    }

    return {
      response: response.message.content,
    };
  } catch (error) {
    sendWebsocketEvent({
      ts: Date.now(),
      id: 'io_llm',
      type: 'json',
      content: {
        type: 'error',
        tag,
        model: MODEL_CONFIG.id,
        error: error,
      },
    });

    console.log('error', error);
    // TODO: return the error message -- add special case for this to inform the client
    return { response: null };
  }
}

export function createOllamaRunner(MODEL_CONFIG: ModelConfig) {
  return (input: RunInput): RunOutput => run({ ...input, MODEL_CONFIG });
}
