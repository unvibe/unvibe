import { Alert } from '@/lib/ui/alert';

export default function AlertDemo() {
  return (
    <div className='min-h-screen container mx-auto py-10 px-6'>
      <h1 className='text-3xl font-semibold mb-6'>🔔 Alerts Demo</h1>
      <div className='flex flex-col gap-3 max-w-xl'>
        <Alert variant='info' heading='Info Alert' opacity='50'>
          This is an info alert. Use it for neutral information messages.
        </Alert>
        <Alert variant='success' heading='Success Alert' opacity='50'>
          This is a success alert. Everything went as expected!
        </Alert>
        <Alert variant='error' heading='Error Alert' opacity='50'>
          Something went wrong. Please try again or check your data.
        </Alert>
        <Alert variant='warning' heading='Warning Alert' opacity='50'>
          This is a warning alert. Pay attention to this critical detail.
        </Alert>
      </div>
    </div>
  );
}
