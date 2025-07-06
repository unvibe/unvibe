import { Theme } from '@/themes/type';
import { ReactQueryProvider } from './react-query';
import { ThemeProvider } from './theme';
import { LLMModelsProvider, LLMModelsServiceReturn } from './llm-models';

export function Provider({
  children,
  theme,
  models,
}: Readonly<{
  children: React.ReactNode;
  theme: Theme;
  models: LLMModelsServiceReturn;
}>) {
  return (
    <ReactQueryProvider>
      <ThemeProvider theme={theme}>
        <LLMModelsProvider models={models}>{children}</LLMModelsProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  );
}
