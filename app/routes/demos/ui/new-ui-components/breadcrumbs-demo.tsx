import { Breadcrumbs } from '@/lib/ui/breadcrumbs';

export default function BreadcrumbsDemo() {
  return (
    <div>
      <h3 className='font-semibold text-xl mb-2'>🧭 Breadcrumbs</h3>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'UI', href: '/ui' },
          { label: 'Components' },
        ]}
      />
    </div>
  );
}
