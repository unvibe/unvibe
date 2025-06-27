import TooltipDemo from './tooltip-demo';
import PopoverDemo from './popover-demo';
import BadgeDemo from './badge-demo';
import AvatarDemo from './avatar-demo';
import TagDemo from './tag-demo';
import BreadcrumbsDemo from './breadcrumbs-demo';
import TabsDemo from './tabs-demo';
import PaginationDemo from './pagination-demo';
import NotificationDemo from './notification-demo';

export default function NewUIComponentsDemo() {
  return (
    <div className='min-h-screen container mx-auto py-10 px-6'>
      <h1 className='text-3xl font-semibold mb-6'>✨ New UI Components Demo</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
        <TooltipDemo />
        <PopoverDemo />
        <BadgeDemo />
        <AvatarDemo />
        <TagDemo />
        <BreadcrumbsDemo />
        <TabsDemo />
        <PaginationDemo />
        <NotificationDemo />
      </div>
    </div>
  );
}
