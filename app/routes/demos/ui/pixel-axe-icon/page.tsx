import {
  PixelAxeIcon,
  PixelPuzzleIcon,
  PixelArchiveIcon,
  PixelShieldCheckIcon,
  PixelCogIcon,
  PixelRocketIcon,
  PixelMusicIcon,
  PixelHeartIcon,
  PixelChatIcon,
} from '@/lib/ui/pixel-icons';

export default function PixelAxeIconDemo() {
  return (
    <div className='min-h-screen container mx-auto py-10 px-6 flex flex-col items-center justify-center'>
      <h1 className='text-3xl font-semibold mb-6'>🪓 Pixel Art Icon Demo</h1>
      <div className='flex gap-8 items-end mb-3 flex-wrap'>
        <div className='flex flex-col items-center'>
          <PixelAxeIcon size={64} />
          <span className='mt-2 text-xs text-foreground-2'>Axe</span>
        </div>
        <div className='flex flex-col items-center'>
          <PixelPuzzleIcon size={64} />
          <span className='mt-2 text-xs text-foreground-2'>Puzzle</span>
        </div>
        <div className='flex flex-col items-center'>
          <PixelArchiveIcon size={64} />
          <span className='mt-2 text-xs text-foreground-2'>Archive</span>
        </div>
        <div className='flex flex-col items-center'>
          <PixelShieldCheckIcon size={64} />
          <span className='mt-2 text-xs text-foreground-2'>Shield Check</span>
        </div>
        <div className='flex flex-col items-center'>
          <PixelCogIcon size={64} />
          <span className='mt-2 text-xs text-foreground-2'>Cog (vibrant)</span>
        </div>
        <div className='flex flex-col items-center'>
          <PixelRocketIcon size={64} />
          <span className='mt-2 text-xs text-foreground-2'>Rocket</span>
        </div>
        <div className='flex flex-col items-center'>
          <PixelMusicIcon size={64} />
          <span className='mt-2 text-xs text-foreground-2'>Music Note</span>
        </div>
        <div className='flex flex-col items-center'>
          <PixelHeartIcon size={64} />
          <span className='mt-2 text-xs text-foreground-2'>Heart</span>
        </div>
        <div className='flex flex-col items-center'>
          <PixelChatIcon size={64} />
          <span className='mt-2 text-xs text-foreground-2'>Chat</span>
        </div>
      </div>
      <span className='mt-4 text-foreground-2 text-sm'>
        All icons are handcrafted pixel-art SVGs in the same style!
      </span>
    </div>
  );
}
