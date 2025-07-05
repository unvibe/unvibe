// kill-script.ts
import { Project } from './types';
import { noop } from '@/lib/core/noop/index';
import { spawn } from 'node:child_process';
import { v4 as uuid } from 'uuid';
import { sendWebsocketEvent } from '@/server/websocket/server';

export interface ProcessMetadata extends Record<string, unknown> {
  id: string;
  pid: number;
  state: 'running' | 'stopped';
  exitCode?: number;
  stdout: string;
  stderr: string;
  cwd: string;
  command: string;
  args: string[];
}

export const store: Record<string, ProcessMetadata> = {};

export function sendScriptWebsocketEvent(event: ProcessMetadata) {
  sendWebsocketEvent({
    ts: Date.now(),
    id: 'project-run-script',
    type: 'json',
    content: { data: event },
  });
}

export function runScript(project: Project, command: string, args?: string[]) {
  const proc = spawn(command, args || [], {
    shell: true,
    cwd: project.path,
  });

  const metadata: ProcessMetadata = {
    id: uuid(),
    state: 'running',
    pid: proc.pid || -1,
    stdout: '',
    stderr: '',
    cwd: project.path,
    command,
    args: args || [],
  };

  store[project.path] = metadata;

  proc.stdout.on('data', (data) => {
    store[project.path].stdout += data.toString();
    sendScriptWebsocketEvent(metadata);
  });

  proc.stderr.on('data', (data) => {
    store[project.path].stderr += data.toString();
    sendScriptWebsocketEvent(metadata);
  });

  proc.on('exit', (code) => {
    store[project.path].state = 'stopped';
    if (code != null) {
      store[project.path].exitCode = code;
    }
    sendScriptWebsocketEvent(metadata);
  });

  return metadata;
}
/**
 * Kill a running script (child process) for a given project and process.
 * @param project The project object.
 * @param processMetadata The process metadata object.
 * @returns Success (true) if killed, false otherwise.
 */
export async function killScript(
  project: Project,
  processMetadata: ProcessMetadata
): Promise<boolean> {
  if (
    !processMetadata ||
    processMetadata.state !== 'running' ||
    !processMetadata.pid
  )
    return false;
  try {
    process.kill(processMetadata.pid, 'SIGTERM');
    processMetadata.state = 'stopped';
    // Optionally update the store if this is a tracked process
    if (store[project.path]?.pid === processMetadata.pid) {
      store[project.path].state = 'stopped';
    }
    sendScriptWebsocketEvent(processMetadata);
    return true;
  } catch (err) {
    // Already dead or no permission
    noop(err);
    return false;
  }
}
