import { SiGithub } from 'react-icons/si';
import { id } from '../../plugin.shared';
import { useProject } from '~/modules/project/provider';

export function GithubActionbarSection() {
  // ! refactor this
  const project = useProject();
  const info = project.plugins[id].info;

  let issues: Record<string, never>[] = [];
  try {
    issues = JSON.parse(info.issues);
  } catch {
    issues = [];
  }
  return (
    <div>
      <div className='text-xs font-mono text-foreground-2 p-2 gap-3 h-full overflow-y-auto content-start flex items-center px-4 py-2'>
        <SiGithub className='w-4 h-4' />
        <span className='capitalize'>{id}</span>
      </div>
      {issues.length > 0 && (
        <div className='flex flex-col gap-1 px-1 py-1'>
          {issues.map((issue) => (
            <div
              key={issue.number}
              className='bg-background-1/50 p-2 rounded-xl'
            >
              <div className='text-foreground-2/80 font-mono text-xs'>
                #{issue.number}
              </div>
              <div className='text-sm'>{issue.title}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
