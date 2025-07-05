import { Button } from '@/lib/ui/button';

export default function ButtonsDemo() {
  return (
    <div className='min-h-screen container mx-auto py-10 px-6'>
      <h1 className='text-3xl font-semibold mb-6'>🖲️ Buttons Demo</h1>
      <div className='flex flex-wrap gap-4'>
        <Button
          variant='default'
          className='transition-all hover:scale-105'
          onClick={() => alert('Default Button Clicked!')}
        >
          Default
        </Button>
        <Button
          variant='primary'
          className='transition-all hover:scale-105'
          onClick={() => alert('Primary Button Clicked!')}
        >
          Primary
        </Button>
        <Button variant='secondary' className='transition-all hover:scale-105'>
          Secondary
        </Button>
        <Button variant='danger' className='transition-all hover:scale-105'>
          Danger
        </Button>
        <Button variant='success' className='transition-all hover:scale-105'>
          Success
        </Button>
        <Button variant='error' className='transition-all hover:scale-105'>
          Error
        </Button>
        <Button variant='warning' className='transition-all hover:scale-105'>
          Warning
        </Button>
        <Button variant='info' className='transition-all hover:scale-105'>
          Info
        </Button>
      </div>
    </div>
  );
}
