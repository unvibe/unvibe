// Refactored Google Gemini runner to mimic OpenAI Chat Completions runner structure
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
import {
  FunctionCall,
  GoogleGenAI,
} from '@google/genai';
import {
  logCallStart,
  logCallResponse,
  logCallError,
  logToolsResults,
} from './shared/ws-log';
import { FunctionDefinition } from 'openai/resources/shared.mjs';

export const id = 'google';

const apiKey = process.env.GOOGLE_API_KEY;
const client = apiKey
  ? new GoogleGenAI({
      apiKey,
    })
  : null;

// --- Message normalization ---
type GeminiContentBlock =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } }
  | { functionResponse: { name: string; response: Record<string, unknown> } };

type GeminiMessage = {
  role: string;
  parts: GeminiContentBlock[];
};

/**
 * Convert a GeminiMessage (from Google) to our AbstractContextMessage format.
 */
export function fromGeminiMessageToAbstractContextMessage(
  message: GeminiMessage
): AbstractContextMessage {
  if (message.role === 'user') {
    // If there is a functionResponse part, this is a tool call result.
    const functionResponse = message.parts.find(
      (part): part is { functionResponse: { name: string; response: Record<string, unknown> } } =>
        typeof part === 'object' && 'functionResponse' in part
    );
    if (functionResponse) {
      // Tool result (functionResponse)
      return {
        role: 'tool',
        index: 0,
        content: JSON.stringify({ name: functionResponse.functionResponse.name, response: functionResponse.functionResponse.response }),
        call_id: '', // Might be available in future, not exposed by Gemini part.
      };
    }
    // Otherwise, treat as user message
    let text = '';
    const images_urls: string[] = [];
    for (const part of message.parts) {
      if ('text' in part) text += part.text;
      if ('inlineData' in part && part.inlineData.mimeType.startsWith('image/')) {
        images_urls.push(part.inlineData.data);
      }
    }
    return {
      role: 'user',
      index: 0,
      content: images_urls.length > 0 ? { text, images_urls } : { text },
    };
  } else if (message.role === 'model') {
    // Assistant message (possibly with functionCall in future, but for now only text)
    let content = '';
    for (const part of message.parts) {
      if ('text' in part) content += part.text;
    }
    // TODO: If parts include functionCall, parse it to tool_calls for compositional workflows (future extension)
    return {
      role: 'assistant',
      index: 0,
      content,
      // refusal/tool_calls can be extended here if present in parts
    };
  }
  // Unknown or unsupported role
  throw new Error(`Unknown Gemini message role: ${JSON.stringify(message)}`);
}

/**
 * Normalize a context user message to Gemini format.
 * Future-proof: if the message includes a tool_calls or extra tool parts property, serialize as extra text parts.
 */
function normalizeContextUserMessage(
  message: AbstractContextUserMessage & { tool_calls?: unknown[]; extra_parts?: GeminiContentBlock[] }
): GeminiMessage {
  const parts: GeminiContentBlock[] = [];

  // Main text part
  if (message.content.text) {
    parts.push({ text: message.content.text });
  }

  // Image parts
  if (message.content.images_urls && message.content.images_urls.length > 0) {
    for (const url of message.content.images_urls) {
      parts.push({ inlineData: { mimeType: 'image/png', data: url } });
    }
  }

  // Extra tool calls or custom parts (future-proofing, not currently in schema)
  if (Array.isArray((message as { tool_calls?: unknown[] }).tool_calls)) {
    for (const toolCall of (message as { tool_calls: unknown[] }).tool_calls!) {
      parts.push({ text: `[Tool call]: ${JSON.stringify(toolCall)}` });
    }
  }
  if (Array.isArray((message as { extra_parts?: GeminiContentBlock[] }).extra_parts)) {
    for (const p of (message as { extra_parts: GeminiContentBlock[] }).extra_parts!) {
      parts.push(p);
    }
  }

  return {
    role: 'user',
    parts,
  };
}

function normalizeContextAssistantMessage(
  message: AbstractContextAssistantMessage
): GeminiMessage {
  return {
    role: 'model',
    parts: [{ text: message.content }],
  };
}

// Gemini API only supports 'user' and 'model' roles.
// Tool messages must be serialized as user messages, with a functionResponse part.
function normalizeContextToolMessage(
  message: AbstractContextToolMessage
): GeminiMessage {
  let functionResult: { name?: string; response?: Record<string, unknown> } | null = null;
  try {
    const parsed = JSON.parse(message.content) as {
      name?: string;
      response?: Record<string, unknown>;
    };
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof parsed.name === 'string' &&
      typeof parsed.response === 'object'
    ) {
      functionResult = parsed;
    }
  } catch {
    // Not JSON, treat as plain text.
  }
  if (functionResult) {
    return {
      role: 'user',
      parts: [
        {
          functionResponse: {
            name: functionResult.name!,
            response: functionResult.response!,
          },
        },
      ],
    };
  }
  // fallback: plain text (legacy or non-standard tool message)
  return {
    role: 'user',
    parts: [{ text: message.content }],
  };
}

function fromAbstractContextMessagesToGeminiMessages(
  context: RunInput['context']
): GeminiMessage[] {
  return context
    .collectMessages()
    .map((message) => {
      if (message.role === 'user') return normalizeContextUserMessage(message);
      if (message.role === 'assistant')
        return normalizeContextAssistantMessage(message);
      if (message.role === 'tool') return normalizeContextToolMessage(message);
      // Gemini does not have system messages, skip or handle as needed
      return null;
    })
    .filter((m): m is GeminiMessage => m !== null);
}

function getToolByName(tools: Tools, name: string) {
  return tools?.find((tool) => tool.name === name);
}

function getFunctionArgs(toolCall: FunctionCall) {
  try {
    return toolCall.args;
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

async function resolveToolCalls(tools: Tools, toolCalls: FunctionCall[]) {
  // Call the tool with the provided arguments
  const queue = toolCalls.map((toolCall) => {
    const id = toolCall.id;
    const name = toolCall.name as string;
    const tool = getToolByName(tools, name);
    const args = getFunctionArgs(toolCall);
    const callback = tool?.fn;

    if (!tool || !callback) {
      return async () => ({
        id,
        name: toolCall.name,
        result: `Tool "${toolCall.name}" not found`,
      });
    }

    const callbackResultPromise = safelyRunToolCallback(() => callback(args));

    return async () => ({
      id,
      name: toolCall.name,
      result: await callbackResultPromise,
    });
  }) as (() => Promise<{ id: string; result: unknown; name: string }>)[];

  return await Promise.all(queue.map((fn) => fn?.()));
}

async function execToolCalls({
  tag,
  tools,
  toolCalls,
  _config,
  MODEL_CONFIG,
}: {
  tag?: string;
  tools: Tools;
  toolCalls: FunctionCall[];
  _config: RunInput;
  MODEL_CONFIG: ModelConfig;
}) {
  const results = await resolveToolCalls(tools, toolCalls);

  logToolsResults({
    modelId: MODEL_CONFIG.id,
    tag,
    usage: {
      /*todo */
    },
  });

  for (const result of results) {
    // Patch: append as JSON with name/response for true Gemini functionResponse support
    _config.context.append.tool({
      call_id: result?.id,
      content: JSON.stringify({ name: result?.name, response: result?.result }),
    });
  }

  return run({ ..._config, MODEL_CONFIG });
}

function normalizeToolDefinition(toolDefs: Tools): FunctionDefinition[] {
  return (toolDefs || [])?.map((tool) => {
    return {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: 'object',
        properties: tool.parameters,
        additionalProperties: false,
        required: Object.keys(tool.parameters || {}),
      },
    };
  });
}
// --- Main run logic ---
async function run(
  _config: RunInput & { MODEL_CONFIG: ModelConfig }
): RunOutput {
  const { tag, MODEL_CONFIG, context } = _config;

  if (!client) {
    return { response: 'Gemini client not configured.' };
  }

  const messages = fromAbstractContextMessagesToGeminiMessages(context);
  const modelId = MODEL_CONFIG.id;

  // Log call start
  logCallStart({
    tag,
    modelId,
    input: context.collectMessages().slice(-1)[0]?.content,
  });

  try {
    const transformedTools = normalizeToolDefinition(
      _config.context.getTools()
    );
    const response = await client.models.generateContent({
      model: modelId,
      contents: messages,
      config: {
        systemInstruction: _config.context.collectMessages()[0]?.content,
        tools: [
          {
            functionDeclarations: transformedTools,
          },
        ],
      },
    });

    const text = response?.text || null;

    // Update the context with the assistant's response
    context.append.any({
      role: 'assistant',
      index: context.collectMessages().length,
      content: text || '',
    });

    if (response.functionCalls && response.functionCalls.length > 0) {
      return await execToolCalls({
        tag,
        tools: _config.context.getTools(),
        toolCalls: response.functionCalls,
        _config,
        MODEL_CONFIG,
      });
    }
    // Log call response
    logCallResponse({
      tag,
      modelId,
      output: text,
      usage: undefined, // Gemini doesn't return usage info yet
      toolCalls: undefined, // Gemini doesn't support tool calls yet
    });

    return { response: text };
  } catch (error) {
    console.log('Error in Google Gemini API:', error);
    logCallError({
      tag,
      modelId,
      error,
    });
    return { response: error instanceof Error ? error.message : String(error) };
  }
}

// API to create a runner instance, as with OpenAI
export function createGoogleRunner(MODEL_CONFIG: ModelConfig) {
  return (input: RunInput): RunOutput => run({ ...input, MODEL_CONFIG });
}
