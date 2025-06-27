import { useState } from 'react';
import { Switch } from '@/modules/ui/switch';

export default function SwitchDemo() {
  const [switchOn, setSwitchOn] = useState(false);
  const [switchOnSm, setSwitchOnSm] = useState(false);
  const [switchOnLg, setSwitchOnLg] = useState(false);
  return (
    <div className='min-h-screen container mx-auto py-10 px-6'>
      <h1 className='text-3xl font-semibold mb-6'>🟢 iOS-style Switch Demo</h1>
      <div className='flex flex-col gap-6'>
        <div>
          <Switch
            checked={switchOnSm}
            onCheckedChange={setSwitchOnSm}
            label={`Small: ${switchOnSm ? 'On' : 'Off'}`}
            size='sm'
          />
        </div>
        <div>
          <Switch
            checked={switchOn}
            onCheckedChange={setSwitchOn}
            label={`Medium: ${switchOn ? 'On' : 'Off'}`}
            size='md'
          />
        </div>
        <div>
          <Switch
            checked={switchOnLg}
            onCheckedChange={setSwitchOnLg}
            label={`Large: ${switchOnLg ? 'On' : 'Off'}`}
            size='lg'
          />
        </div>
      </div>
      <p className='mt-8 font-bold text-lg'>
        Medium switch is {switchOn ? 'ON' : 'OFF'}
      </p>
    </div>
  );
}
