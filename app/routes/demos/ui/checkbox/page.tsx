import { useState } from 'react';
import { Checkbox } from '@/lib/ui/input/checkbox';

export default function CheckboxDemo() {
  const [isChecked, setIsChecked] = useState(false);
  return (
    <div className='min-h-screen container mx-auto py-10 px-6'>
      <h1 className='text-3xl font-semibold mb-6'>☑️ Checkbox Demo</h1>
      <Checkbox
        label={isChecked ? 'Checked! ✅' : 'Check me'}
        checked={isChecked}
        onCheckedChange={(v) => setIsChecked(v === true)}
      />
    </div>
  );
}
