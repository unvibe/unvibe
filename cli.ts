#!/usr/bin/env node

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
const ENV_FILE = path.join(PROJECT_DIR, '.env.local');

function run(cmd: string, cwd?: string) {
  return execSync(cmd, {
    stdio: 'inherit',
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      NO_COLOR: '1', // Force no color in output
      FORCE_COLOR: '0', // Disable color output
    },
  });
}

function parseArgs() {
  const args = process.argv.slice(2);
  const flags = new Set(args);
  return {
    update: flags.has('--update'),
    restart: flags.has('--restart'),
  };
}

function updateApp() {
  run('git pull', PROJECT_DIR);
  run('npm install', PROJECT_DIR);
  run('npm run build', PROJECT_DIR);
  run('npx drizzle-kit push', PROJECT_DIR);
}

function startApp() {
  run('npm start', PROJECT_DIR);
}

async function main() {
  const { update } = parseArgs();

  if (
    !fs.existsSync(PROJECT_DIR) &&
    !fs.existsSync(path.join(PROJECT_DIR, '.git'))
  ) {
    // Use GitHub CLI for cloning private repo
    run(`gh repo clone ${GH_REPO} ${PROJECT_DIR}`);
    // Fallback for public repo in the future:
    // run(`git clone ${REPO_URL} ${PROJECT_DIR}`);
  } else {
    console.log('Project already cloned at ~/.unvibe.');
  }

  // If --update flag, pull latest code
  if (update) {
    console.log('Updating project at ~/.unvibe...');
    console.log('Running git pull at', PROJECT_DIR);

    updateApp();
    console.log('Project updated successfully, restart the app');
    return;
  }

  // Create empty .env.local if not exists
  if (!fs.existsSync(ENV_FILE)) {
    fs.writeFileSync(ENV_FILE, '', { encoding: 'utf8' });
    console.log('Created empty .env.local');
  }

  startApp();
}

main();
