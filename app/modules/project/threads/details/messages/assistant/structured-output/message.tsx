import { Markdown } from '~/modules/markdown/ui/Markdown';
import { useStructuredOutputContext } from './context';

export function StructuredOutputMessage() {
  const { data } = useStructuredOutputContext();
  return <Markdown text={data.message} initialHTML={data.message} />;
}
