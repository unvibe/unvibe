import Link from '@/lib/next/link';
import { useProjects } from '@/modules/home/useProjects';
import { TiFolder } from 'react-icons/ti';
import { useState, useEffect } from 'react';
import { ProjectAddModal } from './ProjectAddModal';
import { MdTerminal } from 'react-icons/md';
import { HomeSectionSharedHeader } from '@/modules/home/home-section-shared-header';
import { HomeSectionSharedLayout } from '@/modules/home/home-section-shared-layout';
import { Button } from '@/modules/ui';
import { HiPlus } from 'react-icons/hi2';
import { BsTerminalPlus } from 'react-icons/bs';

export default function ProjectsPage() {
  const projects = useProjects();
  const [visibleProjects, setVisibleProjects] = useState<string[]>(
    projects ?? []
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshIdx, setRefreshIdx] = useState(0);

  // Reset visibleProjects if actual projects list changes (e.g. after add/delete)
  useEffect(() => {
    if (projects) setVisibleProjects(projects);
  }, [projects, refreshIdx]);

  const handleProjectCreated = () => {
    setRefreshIdx((i) => i + 1);
  };

  return (
    <HomeSectionSharedLayout>
      <HomeSectionSharedHeader
        Icon={TiFolder}
        sectionName='Projects'
        sectionDescription='Projects are folders read automatically from your `~/projects` directory. and custom folders can be added manually.'
        buttons={
          <>
            <Button
              variant='secondary'
              className='flex items-center justify-center p-2!'
              title='Add Project'
              onClick={() => setModalOpen(true)}
            >
              <HiPlus className='w-6 h-6' />
            </Button>
            <Button
              variant='secondary'
              className='flex items-center justify-center p-2!'
              title='Add Project'
              onClick={() => setModalOpen(true)}
            >
              <BsTerminalPlus className='w-6 h-6' />
            </Button>
          </>
        }
        values={visibleProjects}
        setValues={setVisibleProjects}
        allValues={projects ?? []}
        getSearchString={(name) => name}
      />
      <ProjectAddModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
      <div className='flex items-center gap-2 p-1 text-foreground-1 py-4'>
        <MdTerminal className='w-6 h-6 text-foreground' />
        <span className='font-mono'>{'ls ~/projects'}</span>
      </div>
      {visibleProjects && visibleProjects.length > 0 ? (
        <div className='flex flex-wrap gap-2'>
          {visibleProjects.map((project, i) => (
            <Link
              key={project}
              href={`/projects/${project}/threads`}
              className='flex items-center gap-2 min-w-[300px] p-1 rounded-lg hover:bg-background-2 transition-colors relative'
              style={{ flex: '0 1 220px' }}
            >
              <span className='w-5 h-5 text-foreground-2 shrink-0 bg-border rounded-full' />
              <span className='truncate max-w-full text-lg text-foreground-1'>
                {project}
              </span>
              {i < 3 && (
                <span className='w-2 h-2 rounded-full bg-emerald-600' />
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className='text-foreground-2 text-center mt-20'>
          No projects found.
        </div>
      )}
    </HomeSectionSharedLayout>
  );
}
