import { Markdown } from '~/modules/markdown/ui/Markdown';
import { useStructuredOutputContext } from '../_shared/structured-output-context';

export function StructuredOutputMessage() {
  const { data } = useStructuredOutputContext();
  return <Markdown text={data.message} />;
}
