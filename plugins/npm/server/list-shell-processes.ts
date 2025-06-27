import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { readlink } from 'node:fs/promises';
import path from 'node:path';

const execAsync = promisify(exec);
const HOME = process.env.HOME ?? '';

interface HomeProc {
  pid: number;
  cmd: string;
  cwd: string;
}

/** platform-specific cwd resolver */
async function getCwd(pid: number): Promise<string | null> {
  if (process.platform === 'linux') {
    try {
      return await readlink(`/proc/${pid}/cwd`);
    } catch {
      return null;
    }
  } else if (process.platform === 'darwin') {
    try {
      // lsof: -a “and” the filters, -p <pid>, -d cwd (just that fd), -Fn (path only)
      const { stdout } = await execAsync(
        `lsof -a -p ${pid} -d cwd -Fn 2>/dev/null | tail -1`
      );
      const line = stdout.trim();
      return line.startsWith('n') ? line.slice(1) : null;
    } catch {
      return null;
    }
  }
  throw new Error('Unsupported OS (only Linux & macOS handled)');
}

export async function listHomeShellProcesses(): Promise<HomeProc[]> {
  // default-selection ps: only your UID + controlling TTY :contentReference[oaicite:1]{index=1}
  const { stdout } = await execAsync('ps -o pid=,args= -ww');
  const candidates = stdout
    .trim()
    .split('\n')
    .map((line) => {
      const firstSpace = line.trimStart().indexOf(' ');
      const pid = Number(line.slice(0, firstSpace).trim());
      const cmd = line.slice(firstSpace).trim();
      return { pid, cmd };
    })
    .filter((p) => !Number.isNaN(p.pid));

  const result: HomeProc[] = [];
  await Promise.all(
    candidates.map(async (p) => {
      const cwd = await getCwd(p.pid);
      if (cwd && cwd.startsWith(HOME + path.sep)) {
        result.push({ ...p, cwd });
      }
    })
  );

  return result.sort((a, b) => a.pid - b.pid);
}
