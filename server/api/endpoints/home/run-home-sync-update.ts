import { createEndpoint } from '@/server/api/create-endpoint';
import { spawn } from 'node:child_process';
import stripAnsi from 'strip-ansi';

export const runHomeSyncUpdate = createEndpoint({
  type: 'POST',
  pathname: '/home/sync-update',
  handler: async () => {
    return await new Promise<{
      status: 'updating' | 'done' | 'error';
      logs: string;
    }>((resolve) => {
      let logs = '';
      let status: 'updating' | 'done' | 'error' = 'updating';
      const proc = spawn('node', ['cli.ts', '--update'], { shell: true });
      proc.stdout.on('data', (data) => {
        logs += stripAnsi(data.toString());
      });
      proc.stderr.on('data', (data) => {
        logs += stripAnsi(data.toString());
      });
      proc.on('close', (code) => {
        status = code === 0 ? 'done' : 'error';
        resolve({ status, logs });
      });
      proc.on('error', (err) => {
        status = 'error';
        resolve({ status, logs: logs + '\n' + stripAnsi(err.toString()) });
      });
    });
  },
});
