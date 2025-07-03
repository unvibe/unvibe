import Link from '@/lib/next/link';
import { useProjects } from '@/modules/home/useProjects';
import { TiFolder } from 'react-icons/ti';
import { useState, useMemo } from 'react';
import { ProjectAddModal } from './ProjectAddModal';
import { Button } from '@/modules/ui';
import { HiPlus } from 'react-icons/hi2';

export default function ProjectsPage() {
  const projects = useProjects();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshIdx, setRefreshIdx] = useState(0);
  const filtered = useMemo(() => {
    if (!projects) return [];
    if (!search.trim()) return projects;
    return projects.filter((p: string) =>
      p.toLowerCase().includes(search.toLowerCase())
    );
  }, [projects, search, refreshIdx]);

  const handleProjectCreated = () => {
    setRefreshIdx((i) => i + 1);
  };

  return (
    <div className='p-10'>
      <div className='flex flex-col gap-4 max-w-2xl pb-8'>
        <h1 className='text-3xl font-bold flex-1 flex items-center gap-3'>
          <span>
            <TiFolder className='w-8 h-8' />
          </span>
          <span>Projects</span>
        </h1>
        <div className='flex items-center w-full gap-2 relative py-4'>
          <input
            type='text'
            className='w-full px-4 py-2 rounded-xl bg-background-2 focus:bg-background-3 outline-none border border-border'
            placeholder='Search projects...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            variant='secondary'
            className='flex items-center justify-center p-2!'
            title='Add Project'
            onClick={() => setModalOpen(true)}
          >
            <HiPlus className='w-6 h-6' />
          </Button>
        </div>
      </div>
      <ProjectAddModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
      {filtered && filtered.length > 0 ? (
        <div className='flex flex-wrap gap-2'>
          {filtered.map((project, i) => (
            <Link
              key={project}
              href={`/projects/${project}/threads`}
              className='flex items-center gap-2 min-w-[300px] p-1 rounded hover:bg-background-2 transition-colors relative'
              style={{ flex: '0 1 220px' }}
            >
              <span className='w-5 h-5 text-foreground-2 shrink-0 bg-border rounded-full' />
              <span className='truncate max-w-full text-lg text-foreground-1'>
                {project}
              </span>
              {i < 3 && (
                <span className='absolute right-2 top-3 w-2 h-2 rounded-full bg-emerald-600' />
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className='text-foreground-2 text-center mt-20'>
          No projects found.
        </div>
      )}
    </div>
  );
}
