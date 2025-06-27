import Link from '@/lib/next/link';
import { useProjects } from '@/modules/home/useProjects';
import { TiFolder, TiPlus } from 'react-icons/ti';
import { useState, useMemo } from 'react';
import { ProjectAddModal } from './ProjectAddModal';

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
      <div className='flex flex-col items-center mb-10'>
        <div className='flex items-center justify-center w-full max-w-md mb-6 gap-2 relative'>
          <h1 className='text-3xl font-bold flex-1 text-center'>Projects</h1>
          <button
            className='absolute right-0 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow transition-colors flex items-center justify-center'
            title='Add Project'
            onClick={() => setModalOpen(true)}
          >
            <TiPlus className='w-6 h-6' />
          </button>
        </div>
        <input
          type='text'
          className='w-full max-w-md px-4 py-2 rounded-xl bg-background-2 focus:bg-background-3 transition-colors outline-none text-lg text-center font-mono mb-2 shadow-sm border-none'
          placeholder='Search projects...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <ProjectAddModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
      {filtered && filtered.length > 0 ? (
        <div className='flex flex-wrap gap-6 justify-center'>
          {filtered.map((project: string) => (
            <Link
              key={project}
              href={`/projects/${project}`}
              className='flex flex-col items-center justify-center min-w-[180px] min-h-[120px] px-8 py-6 rounded-2xl bg-background-1 hover:bg-background-2 transition-colors font-mono text-lg'
              style={{ flex: '0 1 220px' }}
            >
              <TiFolder className='w-10 h-10 text-foreground-2 mb-3' />
              <span className='truncate max-w-full'>{project}</span>
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
