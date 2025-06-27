import { createEndpoint } from '../create-endpoint';
import * as llm from '@/server/llm';

// Map runner id to provider name
const runnerProviderMap: Record<string, string> = {
  'openai-chat-completions': 'OpenAI',
  'ollama': 'Ollama',
  'anthropic': 'Anthropic',
  'google': 'Google',
};

export const listModels = createEndpoint({
  type: 'GET',
  pathname: '/models',
  handler: async () => {
    return {
      DEFAULT_MODEL: llm.models.ChatGPT4_1,
      models: Object.values(llm.models).map((model) => {
        const runner = model.MODEL_CONFIG.defaultRunner;
        return {
          id: model.MODEL_CONFIG.id,
          displayName: model.MODEL_CONFIG.displayName,
          pricing: model.MODEL_CONFIG.pricing,
          provider: runnerProviderMap[runner] || runner || 'Unknown',
        };
      }),
    };
  },
});
