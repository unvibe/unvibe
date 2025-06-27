import { JSONSchema7 } from 'json-schema';
import { Context } from '../context';
import { RunnerId } from '../runners';

export type AbstractSystemMessage = {
  index: number;
  role: 'system';
  content: string;
};

export type AbstractContextUserMessage = {
  index: number;
  role: 'user';
  content: {
    text: string;
    images_urls?: string[];
  };
};

export type AbstractContextToolMessage = {
  index: number;
  role: 'tool';
  content: string;
  call_id: string;
};

export type AbstractContextAssistantMessage = {
  index: number;
  role: 'assistant';
  content: string;
  refusal?: string;
  tool_calls?: {
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }[];
};

export type AbstractContextMessage =
  | AbstractContextUserMessage
  | AbstractContextToolMessage
  | AbstractContextAssistantMessage
  | AbstractSystemMessage;

export type InferPropertyType<T> = T extends { type: 'string' }
  ? string
  : T extends { type: 'number' }
    ? number
    : T extends { type: 'boolean' }
      ? boolean
      : T extends { type: 'array'; items: infer U }
        ? InferPropertyType<U>[]
        : T extends { type: 'object'; properties: infer P }
          ? {
              [K in keyof P]: InferPropertyType<P[K]>;
            }
          : T extends { type: 'null' }
            ? null
            : never;

export type InferFunctionParameters<T extends JSONSchema7['properties']> = {
  [K in keyof T]: InferPropertyType<T[K]>;
};

export type ToolDefinition = {
  name: string;
  description: string;
  parameters: JSONSchema7['properties'];
  fn: (args: unknown) => unknown | Promise<unknown>;
};

export type ToolCreationArgs<
  T extends JSONSchema7['properties'] = JSONSchema7['properties'],
> = {
  name: string;
  description: string;
  parameters: T;
  fn: (args: InferFunctionParameters<T>) => unknown | Promise<unknown>;
};

export type Tools = ReturnType<Context['getTools']>;

export interface RunInput {
  context: Context;
  structuredOutput?: boolean;
  tag?: string;
  search_enabled?: boolean;
}

export type RunOutput = Promise<{
  response: string | null;
}>;

export type Runner = (inputs: RunInput) => RunOutput;

export interface ModelConfig {
  id: string;
  displayName: string;
  supports: Partial<{
    text: boolean;
    image: boolean;
    audio: boolean;
    video: boolean;
    search: boolean;
    tools: boolean;
    json: boolean;
    temp: boolean;
    reasoning: boolean;
  }>;
  pricing: {
    in: number;
    inCached: number;
    out: number;
  };
  defaultRunner: RunnerId;
}
