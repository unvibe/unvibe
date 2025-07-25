import { Markdown } from '~/modules/markdown/ui/Markdown';
import { useStructuredOutputContext } from '@/lib/react/structured-output/structured-output-context';

export * from './shared';

export function Component() {
  const { data } = useStructuredOutputContext();
  return (
    <Markdown
      text={
        typeof data.message === 'string' ? data.message : String(data.message)
      }
    />
  );
}
