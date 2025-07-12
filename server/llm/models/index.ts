import * as ChatGPT4_1Mini from './chat-gpt-4-1-mini';
import * as ChatGPT4_1Nano from './chat-gpt-4-1-nano';
import * as ChatGPT4_1 from './chat-gpt-4-1';
import * as ChatGPT4o from './chat-gpt-4o';

import * as ChatGPTO3Mini from './chat-gpt-o3-mini';
import * as ChatGPTO3 from './chat-gpt-o3';

import * as ChatGPTo4Mini from './chat-gpt-o4-mini';

import * as Claude_3_7Sonnet from './claude-3-7-sonnet';
import * as Claude_4Sonnet from './claude-sonnet-4';
import * as Claude_Opus from './claude-opus';

import * as Gemini_2_0FlashLite from './gemini-2-0-flash-lite';
import * as Gemini_2_5Flash from './gemini-2-5-flash';
import * as GEMMA_3_4b from './gemma3-4b';
import * as Qwen3 from './qwen3-latest';
import * as DeepSeek from './deepseek-r1';
import * as MoonshotKimi128k from './moonshot-kimi-128k';
import * as MoonshotV1128k from './moonshot-v1-128k';

export const models = {
  ChatGPT4_1Mini,
  ChatGPT4_1Nano,
  ChatGPT4_1,
  ChatGPT4o,
  ChatGPTO3Mini,
  ChatGPTO3,
  ChatGPTo4Mini,
  Claude_3_7Sonnet,
  Gemini_2_0FlashLite,
  Gemini_2_5Flash,
  GEMMA_3_4b,
  Claude_4Sonnet,
  Claude_Opus,
  Qwen3,
  DeepSeek,
  MoonshotKimi128k,
  MoonshotV1128k,
};

export type Model = (typeof models)[keyof typeof models];
