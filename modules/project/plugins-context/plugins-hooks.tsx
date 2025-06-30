import { parseContext } from './utils';

export function ContextItemDetailsHook({
  data,
}: {
  data: ReturnType<typeof parseContext>[number];
}) {
  return (
    <pre className='bg-background-3 p-4 rounded-md'>
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
