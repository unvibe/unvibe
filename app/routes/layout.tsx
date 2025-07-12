import { useTheme } from '~/modules/root-providers/theme';
import { Outlet } from 'react-router';
import { ThemeMetaTags } from '@/themes/meta';
import {
  AWS_KEYS,
  MODELS_KEYS,
  useEnvironmentStatus,
} from './(home)/home/environment/useEnvironmentStatus';
import React from 'react';
import { Modal } from '@/lib/ui/modal';
import { defaultTrigger, Select } from '@/lib/ui/select';
import clsx from 'clsx';
import { HiChevronDown, HiChevronUp, HiXMark } from 'react-icons/hi2';
import { Button, Checkbox } from '@/lib/ui';
import { noop } from '@/lib/core/noop';
import { MdInfoOutline } from 'react-icons/md';

const modelsOptions = MODELS_KEYS.map((key) => ({
  value: key,
  label: key
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase()),
}));

function HomeEnvModal() {
  // const { env } = useHomeInfo();
  const envStatus = useEnvironmentStatus();
  const [isEnvSetup, setIsEnvSetup] = React.useState(envStatus);
  const [optionalExpanded, setOptionalExpanded] = React.useState(false);

  if (isEnvSetup) {
    return null; // Don't render modal if environment is not set up
  }

  return (
    <Modal
      onClose={noop}
      className='max-w-xl max-h-[90vh] overflow-y-auto w-full'
    >
      <div className='p-5 grid gap-5 text-foreground-1'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <MdInfoOutline className='w-8 h-8' />
            <h2 className='text-2xl font-bold w-full'>Complete the setup</h2>
          </div>
          <button
            className='text-foreground-2 p-2 bg-background rounded-xl'
            onClick={() => setIsEnvSetup(true)}
          >
            <HiXMark className='w-5 h-5' />
          </button>
        </div>
        <div className='flex'>
          You need at least one model API key, and optionally enable AWS to
          enable LLM image input/output capabilities.
        </div>
        <div className='grid gap-2 border-2 border-border border-dashed p-4 rounded-2xl'>
          <h3 className='text-lg font-semibold flex items-center gap-2'>
            <span className='w-7 h-7 bg-background flex items-center justify-center text-foreground-2 rounded-lg text-base leading-0'>
              1
            </span>
            <span>
              Enable a model
              <span className='font-mono text-rose-600 ps-1'>*</span>
            </span>
          </h3>
          <Select
            options={modelsOptions}
            value={
              modelsOptions.find((opt) => opt.value.includes('OPENAI'))?.value
            }
            placeholder='Select model provider key'
          />
          <input
            type='text'
            placeholder='--API Key--'
            className={clsx(defaultTrigger, 'w-full !font-normal')}
          />
        </div>
        <div className='grid gap-2 border-2 border-border border-dashed p-4 rounded-2xl'>
          <h3 className='text-lg font-semibold flex items-center gap-2 relative'>
            <span className='w-7 h-7 bg-background flex items-center justify-center text-foreground-2 rounded-lg text-base leading-0'>
              2
            </span>
            <span>Enable AWS (optional)</span>
            <button
              className='p-2 bg-background absolute right-0 rounded-xl cursor-pointer'
              onClick={() => setOptionalExpanded(!optionalExpanded)}
            >
              {optionalExpanded ? <HiChevronUp /> : <HiChevronDown />}
            </button>
          </h3>
          {optionalExpanded &&
            AWS_KEYS.map((key) => {
              return (
                <div key={key} className='flex items-center gap-2'>
                  <label className='w-1/2'>
                    {key
                      .replace(/_/g, ' ')
                      .toLowerCase()
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </label>
                  <input
                    type='text'
                    key={key}
                    className={clsx(defaultTrigger, 'w-1/2 !font-normal')}
                  />
                </div>
              );
            })}
        </div>
        <div className='flex justify-between items-center gap-3 pt-4'>
          <div>
            <Checkbox
              label='Dont show again'
              className='rounded-lg'
              checked={true}
            />
          </div>
          <div className='flex justify-end items-center gap-3'>
            <Button variant='secondary'>Cancel</Button>
            <Button variant='success' disabled>
              Save
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function Layout() {
  const [theme] = useTheme();
  return (
    <>
      <ThemeMetaTags theme={theme} />
      <Outlet />
      <HomeEnvModal />
    </>
  );
}
