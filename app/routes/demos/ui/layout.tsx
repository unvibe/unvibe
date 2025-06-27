import Link from '@/lib/next/link';
import { usePathname } from '@/lib/next/navigation';
import React from 'react';

const demoLinks = [
  { href: '/demos/ui/switch', label: 'Switch' },
  { href: '/demos/ui/alert', label: 'Alert' },
  { href: '/demos/ui/buttons', label: 'Buttons' },
  { href: '/demos/ui/checkbox', label: 'Checkbox' },
  { href: '/demos/ui/radio', label: 'Radio Buttons' },
  { href: '/demos/ui/select', label: 'Select' },
  { href: '/demos/ui/slider', label: 'Slider' },
  { href: '/demos/ui/modal', label: 'Modal' },
  { href: '/demos/ui/table', label: 'Table' },
  { href: '/demos/ui/text', label: 'Text Components' },
  { href: '/demos/ui/new-ui-components', label: 'New UI Components' },
  { href: '/demos/ui/pixel-axe-icon', label: 'PixelAxeIcon' },
  { href: '/demos/ui/snake', label: 'Snake Game' },
];

export default function UIDemosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className='flex min-h-screen'>
      <aside className='w-60 shrink-0 border-r border-border bg-background-2/60 px-4 py-8'>
        <Link href='/demos/ui' className='text-xl font-bold mb-4'>
          UI Demos
        </Link>
        <ul className='space-y-1'>
          {demoLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`block rounded px-2 py-1 font-medium transition-colors duration-75 hover:bg-accent-2/30 hover:text-accent-1 ${
                  pathname === link.href ? 'bg-accent-2/50 text-accent-1' : ''
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <main className='flex-1 bg-background-1 min-h-screen'>{children}</main>
    </div>
  );
}
