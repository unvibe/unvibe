import { ProjectVisualModeEntry } from '~/modules/project/visual/visual-mode-entrypoint';

export default function HomeDatabasePage() {
  return (
    <div className='w-full h-full overflow-hidden flex items-stretch border border-border'>
      <ProjectVisualModeEntry url='https://local.drizzle.studio' />
    </div>
  );
}
