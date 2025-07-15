#!/usr/bin/env node

// FAST CLI: Skips redundant installs/builds, minimizes cold starts
import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const GH_REPO = 'unvibe/unvibe';
const HOME = os.homedir();
const PROJECT_DIR = path.join(HOME, '.unvibe');
const ENV_FILE = path.join(PROJECT_DIR, '.env.local');

function run(cmd, cwd) {
  const [command, ...args] = cmd.split(' ');
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      NO_COLOR: '1', // Force no color in output
      FORCE_COLOR: '0', // Disable color output
    },
  });
  if (result.status !== 0) {
    process.exit(result.status);
  }
  return result.stdout;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const flags = new Set(args);
  return {
    update: flags.has('--update'),
    restart: flags.has('--restart'),
  };
}

function mtimeOf(file) {
  try {
    return fs.statSync(file).mtimeMs;
  } catch {
    return 0;
  }
}

function getLatestMtimeInDirs(dirs) {
  let latest = 0;
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    const files = walkAllFiles(dir);
    for (const f of files) {
      const m = mtimeOf(f);
      if (m > latest) latest = m;
    }
  }
  return latest;
}

function walkAllFiles(dir) {
  let files = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    try {
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        files = files.concat(walkAllFiles(full));
      } else {
        files.push(full);
      }
    } catch {}
  }
  return files;
}

function shouldRunNpmInstall() {
  const pkg = path.join(PROJECT_DIR, 'package.json');
  const lock = path.join(PROJECT_DIR, 'package-lock.json');
  const nodeModules = path.join(PROJECT_DIR, 'node_modules');
  // If node_modules does not exist, must install
  if (!fs.existsSync(nodeModules)) return true;
  // If lock or package.json is newer than node_modules, must install
  const nodeModulesM = mtimeOf(nodeModules);
  return mtimeOf(pkg) > nodeModulesM || mtimeOf(lock) > nodeModulesM;
}

function shouldRunBuild() {
  const buildDir = path.join(PROJECT_DIR, 'build');
  if (!fs.existsSync(buildDir)) return true;
  const sourceDirs = [
    path.join(PROJECT_DIR, 'app'),
    path.join(PROJECT_DIR, 'server'),
    path.join(PROJECT_DIR, 'lib'),
    path.join(PROJECT_DIR, 'plugins'),
    path.join(PROJECT_DIR, 'themes'),
  ];
  const latestSrc = getLatestMtimeInDirs(sourceDirs);
  const latestBuild = getLatestMtimeInDirs([buildDir]);
  return latestSrc > latestBuild;
}

function shouldRunDrizzlePush() {
  // For now, always run; can optimize by schema file timestamps.
  return true;
}

function updateApp() {
  run('git pull', PROJECT_DIR);
  if (shouldRunNpmInstall()) {
    console.log('Running npm install...');
    run('npm install', PROJECT_DIR);
  } else {
    console.log('Skipping npm install (no changes)');
  }
  if (shouldRunBuild()) {
    console.log('Running npm run build...');
    run('npm run build', PROJECT_DIR);
  } else {
    console.log('Skipping build (no source changes)');
  }
  if (shouldRunDrizzlePush()) {
    console.log('Running npx drizzle-kit push...');
    run('npx drizzle-kit push', PROJECT_DIR);
  }
}

function startApp() {
  if (shouldRunNpmInstall()) {
    console.log('Running npm install...');
    run('npm install', PROJECT_DIR);
  } else {
    console.log('Skipping npm install (no changes)');
  }
  if (shouldRunBuild()) {
    console.log('Running npm run build...');
    run('npm run build', PROJECT_DIR);
  } else {
    console.log('Skipping build (no source changes)');
  }
  if (shouldRunDrizzlePush()) {
    console.log('Running npx drizzle-kit push...');
    run('npx drizzle-kit push', PROJECT_DIR);
  }
  run('npm start', PROJECT_DIR);
}

async function main() {
  const { update } = parseArgs();

  if (
    !fs.existsSync(PROJECT_DIR) &&
    !fs.existsSync(path.join(PROJECT_DIR, '.git'))
  ) {
    run(`gh repo clone ${GH_REPO} ${PROJECT_DIR}`);
  } else {
    console.log('Project already cloned at ~/.unvibe.');
  }

  if (update) {
    console.log('Updating project at ~/.unvibe...');
    updateApp();
    console.log('Project updated successfully, restart the app');
    return;
  }

  if (!fs.existsSync(ENV_FILE)) {
    fs.writeFileSync(ENV_FILE, '', { encoding: 'utf8' });
    console.log('Created empty .env.local');
  }

  startApp();
}

main();
