import { ProjectVisualModeEntry } from '~/modules/project/visual/visual-mode-entrypoint';

export default function HomeDatabasePage() {
  return (
    <div className='w-full h-full overflow-hidden flex items-stretch border border-border'>
      <ProjectVisualModeEntry src='https://local.drizzle.studio' />
    </div>
  );
}
