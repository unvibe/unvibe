// kill-script.ts
import { Project } from './lib/project';
import { ProcessMetadata, sendScriptWebsocketEvent, store } from './run-script';
import { noop } from '@/lib/core/noop/index';

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
