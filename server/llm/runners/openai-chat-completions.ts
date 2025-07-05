import OpenAI from 'openai';
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
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import {
  logCallError,
  logCallResponse,
  logCallStart,
  logToolsResults,
} from './shared/ws-log';

export const id = 'openai-chat-completions';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'API_KEY_NOT_SET',
});

function getToolByName(tools: Tools, name: string) {
  return tools?.find((tool) => tool.name === name);
}

function getFunctionArgs(
  toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall
) {
  try {
    return JSON.parse(toolCall.function.arguments);
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

async function resolveToolCalls(
  tools: Tools,
  toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[]
) {
  // Call the tool with the provided arguments
  const queue = toolCalls.map((toolCall) => {
    const id = toolCall.id;
    const name = toolCall.function.name;
    const tool = getToolByName(tools, name);
    const args = getFunctionArgs(toolCall);
    const callback = tool?.fn;

    if (!tool || !callback) {
      return async () => ({
        id,
        name: toolCall.function.name,
        result: `Tool "${toolCall.function.name}" not found`,
      });
    }

    const callbackResultPromise = safelyRunToolCallback(() => callback(args));

    return async () => {
      let toolResult = await callbackResultPromise;

      if (toolResult == null || typeof toolResult === 'undefined') {
        toolResult = `Empty result -- needs debugging`;
      }
      if (typeof toolResult !== 'string') {
        try {
          toolResult = JSON.stringify(toolResult, null, 2);
        } catch {
          toolResult = String(toolResult);
        }
      }

      return {
        id,
        name: toolCall.function.name,
        result: toolResult,
      };
    };
  }) as (() => Promise<{ id: string; result: unknown; name: string }>)[];

  return await Promise.all(queue.map((fn) => fn?.()));
}

function normalizeToolDefinition(
  toolDefs: Tools
): OpenAI.Chat.ChatCompletionTool[] {
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
    };
  });
}

function normalizeContextUserMessage(
  message: AbstractContextUserMessage
): ChatCompletionMessageParam {
  if (message.content.images_urls && message.content.images_urls.length > 0) {
    return {
      role: 'user',
      content: [
        { type: 'text', text: message.content.text } as const,
        ...message.content.images_urls.map(
          (image) => ({ type: 'image_url', image_url: { url: image } }) as const
        ),
      ],
    };
  }
  return {
    role: 'user',
    content: message.content.text,
  };
}

function normalizeContextToolMessage(
  message: AbstractContextToolMessage
): ChatCompletionMessageParam {
  return {
    role: 'tool',
    content: message.content,
    tool_call_id: message.call_id,
  };
}

function normalizeContextAssistantMessage(
  message: AbstractContextAssistantMessage
): ChatCompletionMessageParam {
  return {
    role: 'assistant',
    content: message.content,
    refusal: message.refusal,
    tool_calls: message.tool_calls,
  };
}
function fromAbstractContextMessagesToChatCompletionMessage(
  context: RunInput['context']
): ChatCompletionMessageParam[] {
  return context
    .collectMessages()
    .map((message): ChatCompletionMessageParam => {
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
  message: ChatCompletionMessageParam
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
    } else if (Array.isArray(message.content)) {
      const text = message.content.filter((item) => item.type === 'text');
      const images_urls = message.content
        .filter((item) => item.type === 'image_url')
        .map((item) => item.image_url.url);

      return {
        role: 'user',
        index: 0,
        content: {
          text: text[0]?.text,
          images_urls: images_urls,
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
      call_id: message.tool_call_id,
    };
  } else if (message.role === 'assistant') {
    return {
      role: 'assistant',
      index: 0,
      content: message.content as string,
      refusal: message.refusal as string,
      tool_calls: message.tool_calls,
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
  initialResponse,
  MODEL_CONFIG,
}: {
  tag?: string;
  tools: Tools;
  toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[];
  _config: RunInput;
  initialResponse: OpenAI.Chat.Completions.ChatCompletion & {
    _request_id?: string | null;
  };
  MODEL_CONFIG: ModelConfig;
}) {
  const results = await resolveToolCalls(tools, toolCalls);

  logToolsResults({
    modelId: MODEL_CONFIG.id,
    tag,
    usage: initialResponse?.usage,
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
  const { structuredOutput, tag, search_enabled, MODEL_CONFIG } = _config;

  const tools = _config.context.getTools();
  const llmTools = normalizeToolDefinition(tools);

  const configTools =
    MODEL_CONFIG.supports.tools && llmTools && llmTools.length > 0
      ? llmTools
      : undefined;
  try {
    // ? -- websocket task
    logCallStart({
      tag,
      modelId: MODEL_CONFIG.id,
      input: _config.context.collectMessages().slice(-1)[0]?.content,
    });
    // ? --
    const response = await client.chat.completions.create({
      model: MODEL_CONFIG.id,
      temperature: MODEL_CONFIG.supports.temp ? 0.7 : undefined,
      response_format:
        MODEL_CONFIG.supports.json && structuredOutput
          ? { type: 'json_object' }
          : undefined,
      messages: fromAbstractContextMessagesToChatCompletionMessage(
        _config.context
      ),
      tools: configTools,
      tool_choice: configTools ? 'auto' : undefined,
      ...(search_enabled ? { web_search_options: {} } : {}),
    });

    // update the context with the assistant's response
    _config.context.append.any(
      fromChatCompletionMessageToAbstractContextMessage(
        response.choices[0].message
      )
    );

    // Check if the response contains a tool call
    const toolCalls = response.choices[0].message.tool_calls;

    // ? -- websocket task
    logCallResponse({
      tag,
      modelId: MODEL_CONFIG.id,
      output: response.choices[0].message.content,
      usage: response?.usage,
      toolCalls: toolCalls,
    });
    // ? --

    if (Array.isArray(toolCalls) && toolCalls.length > 0) {
      return await execToolCalls({
        tag,
        tools,
        toolCalls,
        _config,
        initialResponse: response,
        MODEL_CONFIG,
      });
    }

    return {
      response: response.choices[0].message.content,
    };
  } catch (error) {
    console.log('llm.runners.openai-chat-completion:', error);
    logCallError({
      tag,
      modelId: MODEL_CONFIG.id,
      error,
    });

    return { response: null };
  }
}

export function createOpenAIChatCompletionRunner(MODEL_CONFIG: ModelConfig) {
  return (input: RunInput): RunOutput => run({ ...input, MODEL_CONFIG });
}
