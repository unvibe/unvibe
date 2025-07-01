// NOTE: For HTTPS support on https://local.unvibe, vite-plugin-mkcert is used. On first run, it will prompt for trust. See vite.config.ts.
// scripts/cli.ts
import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

// const REPO_URL = 'https://github.com/unvibe/unvibe.git';
const GH_REPO = 'unvibe/unvibe';
const HOME = os.homedir();
const PROJECT_DIR = path.join(HOME, '.unvibe');
const LOCAL_DOMAIN = 'unvibe.io';
const ENV_FILE = path.join(PROJECT_DIR, '.env.local');

function run(cmd: string, cwd?: string) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd });
}

async function main() {
  if (!fs.existsSync(PROJECT_DIR)) {
    // Use GitHub CLI for cloning private repo
    run(`gh repo clone ${GH_REPO} ${PROJECT_DIR}`);
    // Fallback for public repo in the future:
    // run(`git clone ${REPO_URL} ${PROJECT_DIR}`);
  } else {
    console.log('Project already cloned at ~/.unvibe.');
  }

  // Create empty .env.local if not exists
  if (!fs.existsSync(ENV_FILE)) {
    fs.writeFileSync(ENV_FILE, '', { encoding: 'utf8' });
    console.log('Created empty .env.local');
  }

  run('npm install', PROJECT_DIR);
  run('npm run build', PROJECT_DIR);

  // Run database migrations
  run('npx drizzle-kit push', PROJECT_DIR);

  // Optionally set up local domain (platform-specific)
  if (os.platform() === 'darwin' || os.platform() === 'linux') {
    try {
      run(`sudo -- sh -c 'echo "127.0.0.1 ${LOCAL_DOMAIN}" >> /etc/hosts'`);
      console.log(`Added ${LOCAL_DOMAIN} to /etc/hosts`);
    } catch {
      console.log('Could not update /etc/hosts. Try manually if needed.');
    }
  } else {
    console.log(
      `Please map 127.0.0.1 to ${LOCAL_DOMAIN} in your hosts file manually.`
    );
  }

  run('npm start', PROJECT_DIR);
}

main();
