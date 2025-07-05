import * as React from 'react';
import Fuse from 'fuse.js';

interface SearchBarProps<T> {
  sectionName: string;
  allValues: T[];
  setValues: (values: T[]) => void;
  buttons?: React.ReactNode;
  getSearchString?: (item: T) => string;
}

export function SearchBar<T>({
  sectionName,
  allValues,
  buttons = null,
  setValues,
  getSearchString,
}: SearchBarProps<T>) {
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    if (!search.trim()) {
      setValues(allValues);
      return;
    }
    let filtered: T[] = [];
    if (typeof Fuse !== 'undefined') {
      // Use getSearchString as a key if provided, else fallback to string
      const fuse = new Fuse(allValues, {
        keys: getSearchString ? ['custom'] : undefined,
        threshold: 0.4,
        includeScore: true,
        getFn: getSearchString ? (obj) => getSearchString(obj) : undefined,
      });
      filtered = fuse.search(search).map((result) => result.item);
    } else {
      // fallback fuzzy filter
      filtered = allValues.filter((item) => {
        const str = getSearchString ? getSearchString(item) : String(item);
        return str.toLowerCase().includes(search.toLowerCase());
      });
    }
    setValues(filtered);
  }, [search, allValues, setValues, getSearchString]);

  return (
    <div className='flex items-center w-full gap-2 relative py-4 max-w-2xl'>
      <span className='absolute left-4 inset-y-0 flex items-center pointer-events-none'>
        <svg
          className='w-6 h-6 text-foreground-2'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <circle cx='11' cy='11' r='8' stroke='currentColor' strokeWidth='2' />
          <line
            x1='21'
            y1='21'
            x2='16.65'
            y2='16.65'
            stroke='currentColor'
            strokeWidth='2'
          />
        </svg>
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
  );
}
