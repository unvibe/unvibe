import { useState } from 'react';
import { Slider } from '@/modules/ui/input/slider';

export default function SliderDemo() {
  const [sliderValue, setSliderValue] = useState(60);

  return (
    <div className='min-h-screen container mx-auto py-10 px-6'>
      <h1 className='text-3xl font-semibold mb-6'>🔊 Slider Demo</h1>
      <div className='flex items-center gap-4'>
        <Slider
          label='Volume'
          min={0}
          max={100}
          value={sliderValue}
          onChange={setSliderValue}
        />
        <span className='min-w-[3rem] text-lg font-mono'>{sliderValue}</span>
      </div>
      <p className='mt-2 font-bold'>Current volume: {sliderValue}</p>
    </div>
  );
}
