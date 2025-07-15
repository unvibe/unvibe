import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { StructuredChatMessage } from '@/server/websocket/types';
import { socket } from '@/lib/react/useSocket';
import { ClientEndpointsMap } from '@/server/api/client';

type Models = ClientEndpointsMap['GET /models']['output']['models'];

type FormattedThreadMessage = {
  tag: string;
  messages: StructuredChatMessage[];
  start: number;
  end: number;
  isEnded: boolean;
  opacity: number;
  cost: number;
  accumlatedUsages: {
    total_tokens: number;
    prompt_tokens: number;
    completion_tokens: number;
    cached_tokens: number;
  };
};

interface BackendLogsStore {
  messages: StructuredChatMessage[];
  tagged: Record<string, StructuredChatMessage[]>;
  appendMessage: (message: StructuredChatMessage) => void;
  format: (
    models: Models,
    tagged: Record<string, StructuredChatMessage[]>,
    threadId: string
  ) => FormattedThreadMessage[];
}

interface ChatMessageUsage {
  total_tokens?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
  prompt_tokens_details?: TokenDetails;
  completion_tokens_details?: TokenDetails;
}

interface TokenDetails {
  cached_tokens?: number;
}

interface ContentWithUsage extends Record<string, unknown> {
  usage?: ChatMessageUsage;
  type?: string;
  model?: string;
}

function hasUsage(
  content: Record<string, unknown>
): content is ContentWithUsage {
  return typeof content === 'object' && content !== null && 'usage' in content;
}

function getUsage(
  content: Record<string, unknown>
): ChatMessageUsage | undefined {
  return hasUsage(content) ? (content as ContentWithUsage).usage : undefined;
}

export const useBackedLogStore = create<BackendLogsStore>()(
  immer((set) => {
    socket?.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (typeof data === 'object' && data !== null) {
        const candidate = data as StructuredChatMessage;

        if (candidate && candidate.content !== undefined) {
          set((state) => {
            state.messages.push(candidate);
            if (candidate.content?.tag) {
              if (!state.tagged[candidate.content.tag as string]) {
                state.tagged[candidate.content.tag as string] = [];
              }
              state.tagged[candidate.content.tag as string].push(candidate);
            }
          });
        }
      }
    });
    return {
      messages: [],
      tagged: {},
      format(models, tagged, threadId) {
        const entries = Object.entries(tagged);
        const reversed = [...entries].reverse();
        const result = reversed
          .filter((entry) => entry[1][0].content.id === threadId)
          .map(([tag, messages], i) => {
            const opacity = 1 - (i / reversed.length) * 0.9;
            const firstMessage = messages[0];
            const start = firstMessage.ts;
            const lastMessage = messages[messages.length - 1];
            const isEnded =
              lastMessage.id === 'threads' &&
              (lastMessage.content as ContentWithUsage)?.type === 'end';

            const lastMessageThatContainsUsage = (() => {
              for (let i = messages.length - 1; i >= 0; i--) {
                if (hasUsage(messages[i].content)) {
                  return messages[i];
                }
              }
              return undefined;
            })();

            const usage = getUsage(lastMessageThatContainsUsage?.content || {});
            const accumlatedUsages = {
              total_tokens: usage?.total_tokens ?? 0,
              prompt_tokens: usage?.prompt_tokens ?? 0,
              completion_tokens: usage?.completion_tokens ?? 0,
              cached_tokens: usage?.prompt_tokens_details?.cached_tokens ?? 0,
            };

            // now we need to calculate the cost depending on the model
            const llmResponsesWithTokens = [
              lastMessageThatContainsUsage,
            ].filter((m): m is NonNullable<typeof m> => !!m);

            const modelId = messages
              .filter((m) => m.id === 'io_llm')
              .find((m) => Boolean(m.content?.model))?.content?.model;
            const model = models?.find((m) => m.id === modelId);
            const inPricePerMil = model?.pricing.in ?? 0;
            const inCachedPricePerMil = model?.pricing.inCached ?? 0;
            const outPriceMil = model?.pricing.out ?? 0;
            const inTokenPrice = inPricePerMil / 1000000;
            const inCachedTokenPrice = inCachedPricePerMil / 1000000;
            const outTokenPrice = outPriceMil / 1000000;

            const cost = llmResponsesWithTokens.reduce((acc, m) => {
              const msgUsage = getUsage(m.content);
              const inTokens = msgUsage?.prompt_tokens ?? 0;
              const inCachedTokens =
                msgUsage?.prompt_tokens_details?.cached_tokens ?? 0;
              const outTokens = msgUsage?.completion_tokens ?? 0;

              const inCost = inTokens * inTokenPrice;
              const inCachedCost = inCachedTokens * inCachedTokenPrice;
              const outCost = outTokens * outTokenPrice;
              const totalCost = inCost + inCachedCost + outCost;
              return acc + totalCost;
            }, 0);

            return {
              tag,
              messages,
              start,
              end: lastMessage.ts,
              isEnded,
              opacity,
              cost,
              accumlatedUsages,
            };
          });

        return result;
      },
      appendMessage(message) {
        set((state) => {
          state.messages.push(message);
        });
      },
    };
  })
);
