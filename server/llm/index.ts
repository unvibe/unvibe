import { JSONSchema7 } from 'json-schema';
import { models } from './models';
import {
  InferFunctionParameters,
  ModelConfig,
  ToolDefinition,
} from './models/_shared-types';
import { Context } from './context';

// runners
import { createOpenAIChatCompletionRunner } from './runners/openai-chat-completions';
import { createOllamaRunner } from './runners/ollama';
import { RunnerId } from './runners';
import { createAnthropicRunner } from './runners/anthropic';
import { createGoogleRunner } from './runners/google';

// re-export models
export * from './models';
export { Context } from './context';

export interface SendConfig {
  model: (typeof models)[keyof typeof models];
  context: Context;
  runner?: RunnerId;
  tools?: ToolDefinition[];
  structuredOutput?: boolean;
  tag?: string;
  search_enabled?: boolean;
}

export interface SendResult {
  response: string | null;
  tag?: string;
}

function getRunner(runner: RunnerId | undefined, modelConfig: ModelConfig) {
  switch (runner) {
    case 'openai-chat-completions':
      return createOpenAIChatCompletionRunner(modelConfig);
    case 'ollama':
      return createOllamaRunner(modelConfig);
    case 'anthropic':
      return createAnthropicRunner(modelConfig);
    case 'google':
      return createGoogleRunner(modelConfig);
    default:
      throw new Error(`Unknown runner: ${runner}`);
  }
}

export async function send({
  model,
  runner,
  ..._config
}: SendConfig): Promise<SendResult> {
  const run = getRunner(
    runner || model.MODEL_CONFIG.defaultRunner,
    model.MODEL_CONFIG
  );
  console.log(
    'llm.send\t',
    model.MODEL_CONFIG.id,
    runner || model.MODEL_CONFIG.defaultRunner
  );
  // console.log('llm.system', _config.context.getSystemInstructions());
  return run(_config);
}

export function tool<
  T extends JSONSchema7['properties'] = JSONSchema7['properties'],
>(
  name: string,
  description: string,
  parameters: T,
  fn: (args: InferFunctionParameters<T>) => unknown | Promise<unknown>
): ToolDefinition {
  const _fn: ToolDefinition['fn'] = fn as ToolDefinition['fn'];
  return {
    name,
    description,
    parameters,
    fn: _fn,
  };
}
