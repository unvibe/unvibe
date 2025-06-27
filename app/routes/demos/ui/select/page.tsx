import { useState } from 'react';
import { Select } from '@/modules/ui/select';

export default function SelectDemo() {
  const options = [
    { value: 'apple', label: '🍎 Apple' },
    { value: 'banana', label: '🍌 Banana' },
    { value: 'grape', label: '🍇 Grape' },
    { value: 'watermelon', label: '🍉 Watermelon' },
  ];
  const [selectedFruit, setSelectedFruit] = useState('');

  return (
    <div className='min-h-screen container mx-auto py-10 px-6'>
      <h1 className='text-3xl font-semibold mb-6'>🍏 Select Input Demo</h1>
      <Select
        label='Choose a fruit'
        options={options}
        placeholder='Select a fruit...'
        onChange={setSelectedFruit}
      />
      <p className='mt-2'>
        Selected Fruit:{' '}
        <span className='font-bold'>
          {selectedFruit
            ? options.find((o) => o.value === selectedFruit)?.label
            : 'None'}
        </span>
      </p>
    </div>
  );
}
