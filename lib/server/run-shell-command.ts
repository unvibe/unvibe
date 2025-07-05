import { ProcessEnvOptions } from 'child_process';

export async function runShellCommand(
  command: string,
  options?: ProcessEnvOptions
) {
  const { exec } = await import('child_process');
  return new Promise<string>((resolve, reject) => {
    exec(command, { cwd: options?.cwd || '.' }, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`stderr: ${stderr}`);
        return;
      }
      resolve(stdout);
    });
  });
}
