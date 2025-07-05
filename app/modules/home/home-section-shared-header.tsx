import * as React from 'react';
import { IconType } from 'react-icons/lib';
import { SearchBar } from './SearchBar';

export type HomeSectionSharedHeaderProps<T> = {
  Icon: IconType;
  buttons?: React.ReactNode;
  sectionDescription?: string;
  sectionName: string;
  values: T[];
  setValues: (newValues: T[]) => void;
  allValues: T[];
  getSearchString?: (item: T) => string;
};

export function HomeSectionSharedHeader<T>({
  Icon,
  buttons = null,
  sectionDescription,
  sectionName,
  // values,
  setValues,
  allValues,
  getSearchString,
}: HomeSectionSharedHeaderProps<T>) {
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
      {/* Internal search bar that filters and sets values using Fuse.js or fallback */}
      <SearchBar<T>
        sectionName={sectionName}
        allValues={allValues}
        setValues={setValues}
        getSearchString={getSearchString}
        buttons={buttons}
      />
    </div>
  );
}
