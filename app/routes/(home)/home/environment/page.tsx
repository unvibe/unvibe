import { HomeSectionSharedHeader } from '@/modules/home/home-section-shared-header';
import { HomeSectionSharedLayout } from '@/modules/home/home-section-shared-layout';
import { useAPIQuery, useAPIMutation } from '@/server/api/client';
import { useState } from 'react';
import { TiCogOutline } from 'react-icons/ti';

export default function EnvironmentPage() {
  const { data, isLoading, error, refetch } = useAPIQuery('GET /home/info');
  const mutation = useAPIMutation('POST /home/env-update');
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (key: string) => {
    setSaving(true);
    try {
      await mutation.mutateAsync({ key, value: editValue });
      setEditKey(null);
      setEditValue('');
      await refetch();
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div className='p-10'>Loading environment...</div>;
  if (error)
    return <div className='p-10 text-red-500'>Failed to load environment</div>;
  return (
    <HomeSectionSharedLayout>
      <HomeSectionSharedHeader
        Icon={TiCogOutline}
        sectionName='Environment'
        search=''
        setSearch={() => {}}
        sectionDescription='Manage environment variables and system settings'
      />
      <div className='max-w-2xl mx-auto flex flex-col gap-4'>
        {data?.env?.length === 0 && (
          <div className='text-foreground-2 text-center'>
            No environment variables found.
          </div>
        )}
        {data?.env?.map((envVar: { key: string; value: string }) => (
          <div
            key={envVar.key}
            className='flex items-center gap-2 p-4 rounded-xl bg-background-1'
          >
            <span className='w-48 font-mono'>{envVar.key}</span>
            {editKey === envVar.key ? (
              <>
                <input
                  className='flex-1 px-3 py-2 rounded-md bg-background-2 border-none outline-none font-mono text-base'
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  disabled={saving}
                />
                <button
                  className='ml-2 px-3 py-1 rounded-md bg-blue-500 text-white font-bold disabled:opacity-60'
                  onClick={() => handleSave(envVar.key)}
                  disabled={saving || editValue === envVar.value}
                >
                  Save
                </button>
                <button
                  className='ml-1 px-3 py-1 rounded-md bg-background-2 border border-border text-foreground-2'
                  onClick={() => setEditKey(null)}
                  disabled={saving}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className='flex-1 font-mono text-base truncate'>
                  {envVar.value}
                </span>
                <button
                  className='ml-2 px-3 py-1 rounded-md bg-background-2 border border-border text-blue-500 font-bold'
                  onClick={() => {
                    setEditKey(envVar.key);
                    setEditValue(envVar.value);
                  }}
                  disabled={saving}
                >
                  Edit
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </HomeSectionSharedLayout>
  );
}
