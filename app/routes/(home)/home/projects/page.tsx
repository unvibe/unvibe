import Link from '@/lib/next/link';
import { useInvalidateProjects, useProjects } from '~/modules/home/useProjects';
import { TiFolder } from 'react-icons/ti';
import { useState, useEffect, useMemo } from 'react';
import { ProjectAddModal } from './ProjectAddModal';
import { MdTerminal } from 'react-icons/md';
import { HomeSectionSharedHeader } from '~/modules/home/home-section-shared-header';
import { HomeSectionSharedLayout } from '~/modules/home/home-section-shared-layout';
import { Button } from '@/lib/ui';
import { HiPlus } from 'react-icons/hi2';
import { BsTerminalPlus } from 'react-icons/bs';
import { AddSourceModal } from './AddSourceModal';

function flattenSources(
  sources: Record<string, { name: string; id: string }[]>
) {
  return Object.values(sources)
    .flat()
    .map((project) => ({
      id: project.id,
      name: project.name,
    }));
}

function SourceList({
  sourceId,
  projects,
  visibleProjects,
}: {
  sourceId: string;
  projects: { name: string; id: string }[];
  visibleProjects: { id: string; name: string }[];
}) {
  const decodedSource = useMemo(() => atob(sourceId), [sourceId]);
  return (
    <div className='grid gap-2'>
      <div className='flex items-center gap-2 p-1 text-foreground-1 py-4'>
        <MdTerminal className='w-6 h-6 text-foreground' />
        <span className='font-mono'>{decodedSource}</span>
      </div>
      {projects && projects.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {projects.map((project, i) =>
            visibleProjects.some((p) => p.id === project.id) ? (
              <Link
                key={project.id}
                href={`/projects/${project.id}/threads`}
                className='flex items-center gap-2 min-w-[300px] p-1 rounded-lg hover:bg-background-2 transition-colors relative'
                style={{ flex: '0 1 220px' }}
              >
                <span className='w-5 h-5 text-foreground-2 shrink-0 bg-border rounded-full' />
                <span className='truncate max-w-full text-lg text-foreground-1'>
                  {project.name}
                </span>
                {i < 3 && (
                  <span className='w-2 h-2 rounded-full bg-emerald-600' />
                )}
              </Link>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  const projects = useProjects();

  const flattened = useMemo(() => {
    return flattenSources(projects.data?.projects ?? {});
  }, [projects.data?.projects]);

  const [visibleProjects, setVisibleProjects] =
    useState<{ id: string; name: string }[]>(flattened);
  const [modalOpen, setModalOpen] = useState(false);
  const [addSourceModalOpen, setAddSourceModalOpen] = useState(false);
  const [refreshIdx, setRefreshIdx] = useState(0);
  const invalidateProjects = useInvalidateProjects();

  // Reset visibleProjects if actual projects list changes (e.g. after add/delete)
  useEffect(() => {
    if (projects?.data?.projects) setVisibleProjects(flattened);
  }, [projects.data?.projects, refreshIdx]);

  const handleProjectCreated = () => {
    setRefreshIdx((i) => i + 1);
    invalidateProjects();
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
              onClick={() => setAddSourceModalOpen(true)}
            >
              <BsTerminalPlus className='w-6 h-6' />
            </Button>
          </>
        }
        values={visibleProjects}
        setValues={setVisibleProjects}
        allValues={flattened}
        getSearchString={(sourceItem) => sourceItem.name}
      />
      <ProjectAddModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
      <AddSourceModal
        open={addSourceModalOpen}
        onClose={() => setAddSourceModalOpen(false)}
      />
      <div className='grid gap-8'>
        {[...Object.entries(projects.data?.projects ?? {})]
          .sort((a, b) => {
            if (a[0].length !== b[0].length) {
              return a[0].length - b[0].length;
            }
            return a[0].localeCompare(b[0]);
          })
          .map(([sourceId, projects]) => {
            const shouldShow = projects.some((p) =>
              visibleProjects.some((_p) => _p.id === p.id)
            );
            if (!shouldShow) return null;
            // now we sort them by length then by name
            return (
              <SourceList
                key={sourceId}
                sourceId={sourceId}
                projects={projects}
                visibleProjects={visibleProjects}
              />
            );
          })}
        {visibleProjects.length === 0 && (
          <div className='text-center text-foreground-2 py-8'>
            <p className='text-lg'>No projects found</p>
            <p className='text-sm mt-2'>
              Click the <span className='font-semibold'>Add Project</span>{' '}
              button to create a new project or add a custom source folder.
            </p>
          </div>
        )}
      </div>
    </HomeSectionSharedLayout>
  );
}
