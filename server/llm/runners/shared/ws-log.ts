import { sendWebsocketEvent } from '@/server/websocket/server';

export function logToolsResults({
  tag,
  modelId,
  usage,
}: {
  modelId: string;
  tag?: string;
  usage: unknown;
}) {
  sendWebsocketEvent({
    ts: Date.now(),
    id: 'io_llm',
    type: 'json',
    content: {
      type: 'tools_result',
      tag,
      usage,
      model: modelId,
    },
  });
}

export function logCallStart({
  tag,
  modelId,
  input,
}: {
  modelId: string;
  tag?: string;
  input: unknown;
}) {
  sendWebsocketEvent({
    ts: Date.now(),
    id: 'io_llm',
    type: 'json',
    content: {
      type: 'call',
      tag,
      model: modelId,
      input,
    },
  });
}

export function logCallResponse({
  tag,
  modelId,
  output,
  usage,
  toolCalls,
}: {
  modelId: string;
  tag?: string;
  output: unknown;
  usage: unknown;
  toolCalls: unknown;
}) {
  sendWebsocketEvent({
    ts: Date.now(),
    id: 'io_llm',
    type: 'json',
    content: {
      type: 'response',
      tag,
      model: modelId,
      usage: usage,
      output,
      toolCalls,
    },
  });
}

export function logCallError({
  tag,
  modelId,
  error,
}: {
  modelId: string;
  tag?: string;
  error: unknown;
}) {
  sendWebsocketEvent({
    ts: Date.now(),
    id: 'io_llm',
    type: 'json',
    content: {
      type: 'error',
      tag,
      model: modelId,
      error: error,
    },
  });
}
