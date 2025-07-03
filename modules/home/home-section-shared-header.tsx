import { HiMagnifyingGlass, HiPlus } from 'react-icons/hi2';
import { Button } from '../ui';
import { IconType } from 'react-icons/lib';

export function HomeSectionSharedHeader({
  Icon,
  sectionDescription,
  sectionName,
  search,
  setSearch,
  onAdd,
}: {
  Icon: IconType;
  search: string;
  sectionDescription?: string;
  sectionName: string;
  setSearch: (value: string) => void;
  onAdd?: () => void;
}) {
  return (
    <div className='flex flex-col gap-4 pb-8'>
      <h1 className='text-3xl font-bold flex-1 flex items-center gap-3 max-w-2xl'>
        <span>
          <Icon className='w-8 h-8' />
        </span>
        <span>{sectionName}</span>
      </h1>
      {sectionDescription && (
        <p className='text-foreground-2'>{sectionDescription}</p>
      )}
      <div className='flex items-center w-full gap-2 relative py-4 max-w-2xl'>
        <span className='absolute left-4 inset-y-0 flex items-center pointer-events-none'>
          <HiMagnifyingGlass className='w-6 h-6 text-foreground-2' />
        </span>
        <input
          type='text'
          className='w-full px-4 pl-12 py-2 rounded-xl bg-background-2 focus:bg-background-3 outline-none border border-border'
          placeholder={`Search ${sectionName}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          variant='secondary'
          className='flex items-center justify-center p-2!'
          title='Add Project'
          onClick={onAdd}
        >
          <HiPlus className='w-6 h-6' />
        </Button>
        {/* <div className='w-0 border-r border-border h-6 mx-2' />
          <Button
            variant='secondary'
            className='flex items-center justify-center p-2!'
            title='Add Project'
            onClick={() => setModalOpen(true)}
          >
            <HiOutlineCog6Tooth className='w-6 h-6' />
          </Button> */}
      </div>
    </div>
  );
}
