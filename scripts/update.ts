// scripts/update.ts
import { execSync } from 'child_process';
import os from 'os';
import path from 'path';

const HOME = os.homedir();
const PROJECT_DIR = path.join(HOME, '.unvibe');

function run(cmd: string, cwd?: string) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd });
}

function main() {
  run('git pull', PROJECT_DIR);
  // Re-run the CLI setup script
  run('node scripts/cli.ts');
}

main();
