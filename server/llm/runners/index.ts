import * as OpenAIChatCompletions from './openai-chat-completions';
import * as Ollama from './ollama';
import * as Anthropic from './anthropic';
import * as Google from './google';
import * as Moonshot from './moonshot';

export * as OpenAIChatCompletions from './openai-chat-completions';
export * as Ollama from './ollama';
export * as Anthropic from './anthropic';
export * as Google from './google';
export * as Moonshot from './moonshot';

export type RunnerId =
  | typeof Moonshot.id
  | typeof OpenAIChatCompletions.id
  | typeof Ollama.id
  | typeof Anthropic.id
  | typeof Google.id;
