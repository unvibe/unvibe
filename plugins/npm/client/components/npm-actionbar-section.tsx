import { SiNpm } from 'react-icons/si';
import { id } from '../../plugin.shared';
import { useProject, useProjectActions } from '@/modules/project/provider';
import {
  MdOutlinePlayCircle,
  MdOutlineRefresh,
  MdOutlineStopCircle,
  MdOutlineVisibility,
} from 'react-icons/md';
import { Alert } from '@/modules/ui/alert';
import { useAPIMutation } from '@/server/api/client';
import { getScriptsSyntax } from '../lib/pm-scripts-syntax';
import { useScriptsStore } from './store';
import clsx from 'clsx';
import { useState } from 'react';
import { Modal } from '@/modules/ui/modal';
import type { ProcessMetadata } from '@/plugins/core/server/api';

function ScriptButton({
  script,
  using,
  isAlreadyRunning,
}: {
  isAlreadyRunning: boolean;
  script: string;
  using: string;
}) {
  const project = useProject();
  const { projectDirname } = useProjectActions();
  const { mutate: runScript, isPending: isRunScriptRequestPending } =
    useAPIMutation('POST /projects/run-script');
  const { mutate: killScript, isPending: isKillScriptRequestPending } =
    useAPIMutation('POST /projects/kill-script');
  const scriptsStore = useScriptsStore();
  const [processMetadata, setProcessMetadata] =
    useState<ProcessMetadata | null>(null);

  const command = getScriptsSyntax(using as 'npm').run(script);
  const commandsState = scriptsStore.data[project.path];
  const state = commandsState?.find((item) => item.command === command);
  const [stdModalOpen, setStdModalOpen] = useState(false);

  const isRunning = (!state && isAlreadyRunning) || state?.state === 'running';

  return (
    <div className='bg-background-1/50 p-2 rounded-xl flex items-center justify-between gap-4'>
      <button
        className='flex items-center gap-4 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed'
        disabled={isAlreadyRunning}
        onClick={() => {
          if (isRunScriptRequestPending) return;
          if (isRunning && processMetadata && !isKillScriptRequestPending) {
            // stop the script
            killScript({
              processMetadata,
              projectDirname,
              source: 'projects',
            });
          } else {
            runScript(
              {
                command,
                args: [],
                source: 'projects',
                projectDirname,
              },
              {
                onSuccess(data) {
                  setProcessMetadata(data.processMetadata);
                },
              }
            );
          }
        }}
      >
        <div className='text-foreground-2/50'>
          {state?.state === 'stopped' ? (
            <MdOutlineRefresh className='w-5 h-5' />
          ) : isRunning ? (
            <MdOutlineStopCircle className='w-5 h-5 !text-foreground-2' />
          ) : (
            <MdOutlinePlayCircle className='w-5 h-5' />
          )}
        </div>
        <div>{script}</div>
      </button>
      <div className='flex gap-4 items-center'>
        {(state?.stdout || state?.stderr) && (
          <button
            onClick={() => {
              setStdModalOpen(true);
            }}
          >
            <MdOutlineVisibility className='w-5 h-5 text-foreground-2/50' />
          </button>
        )}
        <div
          className={clsx(
            'justify-self-end w-3 h-3 border border-border-1 rounded-full transition-colors',
            !state
              ? isRunning
                ? 'bg-emerald-900'
                : 'bg-background-1'
              : state.state === 'running'
                ? 'bg-emerald-900'
                : state.exitCode
                  ? 'bg-rose-900'
                  : 'bg-emerald-900'
          )}
        ></div>
      </div>
      {stdModalOpen && (
        <Modal
          onClose={() => setStdModalOpen(false)}
          className='max-w-xl mx-auto w-full p-5'
        >
          <div className='font-mono whitespace-pre-wrap max-h-[50vh] overflow-y-auto text-xs w-full'>
            {state?.stdout}
            {state?.stderr}
          </div>
        </Modal>
      )}
    </div>
  );
}

export function NPMActionbarSection() {
  const project = useProject();
  const info = project.plugins[id].info;

  const pkgJSON = JSON.parse(info.config);
  const scripts = pkgJSON?.scripts || {};
  const using = info.packageManager;
  const showUsing = using !== 'npm';
  const shell: unknown[] = JSON.parse(info.shellProcesses);
  const isInstalled = JSON.parse(info.isInstalled);

  return (
    <div>
      <div className='text-xs font-mono text-foreground-2 p-2 gap-3 h-full overflow-y-auto content-start flex items-center px-4 py-2'>
        <SiNpm className='w-4 h-4' />
        <span className='capitalize'>
          {id}
          {showUsing ? <span className='lowercase ps-1'>({using})</span> : ''}
        </span>
      </div>
      {!isInstalled && (
        <div className='p-[2px]'>
          <Alert
            heading='Warning'
            variant='warning'
            className='text-xs !p-2'
            opacity='50'
          >
            `npm install` may not have been run.
          </Alert>
        </div>
      )}
      <div className='p-2 font-mono text-xs flex flex-col gap-1'>
        {Object.keys(scripts).map((script) => {
          const command = getScriptsSyntax(using as 'npm').run(script);

          const isAlreadyRunning = shell.some(
            (s) =>
              typeof s === 'object' &&
              s != null &&
              'cmd' in s &&
              s.cmd === command
          );
          return (
            <ScriptButton
              key={script}
              script={script}
              using={using}
              isAlreadyRunning={isAlreadyRunning}
            />
          );
        })}
      </div>
    </div>
  );
}
