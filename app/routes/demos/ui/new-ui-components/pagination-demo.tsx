import { useState } from 'react';
import { Pagination } from '@/modules/ui/pagination';

export default function PaginationDemo() {
  const [paginationPage, setPaginationPage] = useState(2);
  return (
    <div>
      <h3 className='font-semibold text-xl mb-2'>🔢 Pagination</h3>
      <Pagination
        page={paginationPage}
        pageCount={5}
        onPageChange={setPaginationPage}
      />
      <p className='mt-2 font-bold'>Current page: {paginationPage}</p>
    </div>
  );
}
