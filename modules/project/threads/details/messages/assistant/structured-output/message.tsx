import { Markdown } from '@/modules/markdown/ui/Markdown.client';
import { useStructuredOutputContext } from './context';

export function StructuredOutputMessage() {
  const { data } = useStructuredOutputContext();
  return <Markdown text={data.message} initialHTML={data.message} />;
}
