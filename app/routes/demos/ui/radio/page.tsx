import { useState } from 'react';
import { RadioGroup } from '@/lib/ui/input/radio';

export default function RadioDemo() {
  const radioOptions = [
    { value: 'coffee', label: 'Coffee' },
    { value: 'tea', label: 'Tea' },
    { value: 'juice', label: 'Juice' },
  ];
  const [radioValue, setRadioValue] = useState('');

  return (
    <div className='min-h-screen container mx-auto py-10 px-6'>
      <h1 className='text-3xl font-semibold mb-6'>🔘 Radio Buttons Demo</h1>
      <RadioGroup
        options={radioOptions}
        value={radioValue}
        onValueChange={setRadioValue}
      />
      {radioValue && (
        <p className='mt-3 font-semibold text-green-600'>
          Selected: {radioValue.charAt(0).toUpperCase() + radioValue.slice(1)}
        </p>
      )}
    </div>
  );
}
