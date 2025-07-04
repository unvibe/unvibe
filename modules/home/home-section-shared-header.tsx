import { HiMagnifyingGlass } from 'react-icons/hi2';
import { IconType } from 'react-icons/lib';

export function HomeSectionSharedHeader({
  Icon,
  buttons = null,
  sectionDescription,
  sectionName,
  search,
  setSearch,
}: {
  Icon: IconType;
  buttons?: React.ReactNode;
  search: string;
  sectionDescription?: string;
  sectionName: string;
  setSearch: (value: string) => void;
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
        {buttons}
      </div>
    </div>
  );
}
