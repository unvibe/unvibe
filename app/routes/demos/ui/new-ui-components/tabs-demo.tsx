import { useState } from 'react';
import { Tabs } from '@/modules/ui/tabs';
import { Badge } from '@/modules/ui/badge';

export default function TabsDemo() {
  const [tabIndex] = useState(0);
  return (
    <div>
      <h3 className='font-semibold text-xl mb-2'>🗂️ Tabs</h3>
      <Tabs
        tabs={[
          { label: 'First', content: <div>First tab content</div> },
          {
            label: 'Second',
            content: (
              <div>
                Second tab content <Badge color='success'>New</Badge>
              </div>
            ),
          },
          { label: 'Third', content: <div>Third tab content</div> },
        ]}
        defaultActive={tabIndex}
      />
    </div>
  );
}
