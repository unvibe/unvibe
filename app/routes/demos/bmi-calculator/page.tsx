import { useState } from 'react';
import { Button } from '@/modules/ui/button';
import TextInput from '@/modules/ui/input/text';

function BMIResult({ bmi, category }: { bmi: string; category: string }) {
  return (
    <div className='mt-8 flex flex-col items-center animate-fade-in'>
      <p className='text-xl md:text-2xl font-extrabold mb-2 tracking-tight text-gradient bg-gradient-to-r from-blue-600 via-teal-400 to-green-400 dark:from-blue-300 dark:via-teal-400 dark:to-green-400 bg-clip-text text-transparent'>
        Your BMI: <span>{bmi}</span>
      </p>
      <p className='text-lg md:text-xl font-semibold text-gradient bg-gradient-to-r from-green-500 via-yellow-400 to-pink-400 dark:from-green-300 dark:via-yellow-300 dark:to-pink-300 bg-clip-text text-transparent'>
        Category: <span>{category}</span>
      </p>
    </div>
  );
}

export default function BMICalculator() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [error, setError] = useState<string | null>(null);

  const calculateBMI = () => {
    setError(null);
    const weightInKg = parseFloat(weight);
    const heightInM = parseFloat(height);

    if (isNaN(weightInKg) || isNaN(heightInM)) {
      setError('Please enter valid numbers for both weight and height.');
      setBmi(null);
      return;
    }
    if (weightInKg <= 0 || heightInM <= 0) {
      setError('Weight and height must be positive values.');
      setBmi(null);
      return;
    }
    if (heightInM > 3) {
      setError('Height should be in meters (e.g., 1.75), not centimeters.');
      setBmi(null);
      return;
    }

    const bmiValue = weightInKg / (heightInM * heightInM);
    setBmi(bmiValue.toFixed(2));

    if (bmiValue < 18.5) {
      setCategory('Underweight');
    } else if (bmiValue >= 18.5 && bmiValue < 24.9) {
      setCategory('Normal weight');
    } else if (bmiValue >= 25 && bmiValue < 29.9) {
      setCategory('Overweight');
    } else {
      setCategory('Obesity');
    }
  };

  return (
    <div className='w-full min-h-screen flex items-center justify-center bg-[var(--background-1)] dark:bg-[var(--background-1)] px-2 py-12 transition-colors'>
      <div
        className='w-full max-w-md p-8 rounded-3xl shadow-xl'
        style={{
          background: 'var(--background)',
          boxShadow:
            '0 4px 32px 0 rgba(0,0,0,0.07), 0 1.5px 3px 0 rgba(0,0,0,0.09)',
          border: '1px solid var(--border)',
        }}
      >
        <div className='absolute -top-16 -right-16 w-60 h-60 pointer-events-none select-none'>
          <div className='w-full h-full bg-gradient-to-br from-blue-300 to-green-200 dark:from-blue-900 dark:to-green-700 opacity-30 rounded-full blur-2xl' />
        </div>
        <h1
          className='text-4xl font-extrabold mb-8 text-center tracking-tight drop-shadow'
          style={{ color: 'var(--foreground)' }}
        >
          BMI Calculator
        </h1>
        <div className='mb-6'>
          <label
            className='block text-md font-semibold mb-2'
            style={{ color: 'var(--foreground-1)' }}
          >
            Weight (kg)
          </label>
          <div className='relative flex items-center w-full'>
            <span className='absolute left-3 text-blue-400 dark:text-blue-300'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                className='w-5 h-5'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 16V7a4 4 0 018 0v9m4 4H6a2 2 0 01-2-2v-1a8 8 0 0116 0v1a2 2 0 01-2 2z'
                />
              </svg>
            </span>
            <TextInput
              type='number'
              placeholder='e.g. 70 (in kilograms)'
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className='pl-10 pr-4 py-2 rounded-lg border focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition mb-1 w-full shadow-sm'
              style={{
                background: 'var(--background-2)',
                color: 'var(--foreground)',
                borderColor: 'var(--border)',
              }}
            />
          </div>
        </div>
        <div className='mb-6'>
          <label
            className='block text-md font-semibold mb-2'
            style={{ color: 'var(--foreground-1)' }}
          >
            Height (m)
          </label>
          <div className='relative flex items-center w-full'>
            <span className='absolute left-3 text-green-400 dark:text-green-300'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                className='w-5 h-5'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 20v-16m8 8h-16'
                />
              </svg>
            </span>
            <TextInput
              type='number'
              placeholder='e.g. 1.75 (in meters)'
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className='pl-10 pr-4 py-2 rounded-lg border focus:border-green-400 focus:ring-2 focus:ring-green-100 transition mb-1 w-full shadow-sm'
              style={{
                background: 'var(--background-2)',
                color: 'var(--foreground)',
                borderColor: 'var(--border)',
              }}
            />
          </div>
        </div>
        {error && (
          <div className='mb-4 px-4 py-2 rounded bg-yellow-100 text-yellow-800 border border-yellow-300'>
            {error}
          </div>
        )}
        <Button
          onClick={calculateBMI}
          className='w-full bg-gradient-to-r from-blue-500 to-green-400 dark:from-blue-600 dark:to-green-500 hover:from-blue-600 hover:to-green-500 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-200 mb-2 text-lg tracking-wide hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2'
        >
          Calculate BMI
        </Button>
        {bmi !== null && <BMIResult bmi={bmi} category={category} />}
      </div>
      <style jsx global>{`
        .text-gradient {
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}
