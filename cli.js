#!/usr/bin/env node

// DX-enhanced CLI: Color, spinners, better output, usage help
import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import readline from 'readline';

// Simple color fallback for Node.js (works if no chalk)
const color = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  blue: (s) => `\x1b[34m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  gray: (s) => `\x1b[90m${s}\x1b[0m`,
};

const GH_REPO = 'unvibe/unvibe';
const HOME = os.homedir();
const PROJECT_DIR = path.join(HOME, '.unvibe');
const ENV_FILE = path.join(PROJECT_DIR, '.env.local');

function run(cmd, cwd, name) {
  printStep(`Running ${name || cmd}...`);
  const [command, ...args] = cmd.split(' ');
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      NO_COLOR: '0',
      FORCE_COLOR: '1',
    },
  });
  if (result.status !== 0) {
    printError(`${name || cmd} failed!`);
    process.exit(result.status);
  }
  printDone(name || cmd);
  return result.stdout;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const flags = new Set(args);
  if (flags.has('--help') || flags.has('-h')) {
    printHelp();
    process.exit(0);
  }
  return {
    update: flags.has('--update'),
    restart: flags.has('--restart'),
    dry: flags.has('--dry-run'),
    verbose: flags.has('--verbose'),
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
  if (!fs.existsSync(nodeModules)) return true;
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
  return true;
}

function printStep(msg) {
  process.stdout.write(`${color.blue('•')} ${msg} `);
  showSpinner();
}

function printDone(msg) {
  stopSpinner();
  process.stdout.write(`\r${color.green('✓')} ${msg}\n`);
}

function printSkipped(msg) {
  stopSpinner();
  process.stdout.write(`\r${color.yellow('➔')} ${msg}\n`);
}

function printError(msg) {
  stopSpinner();
  process.stderr.write(`\n${color.red('✖')} ${msg}\n`);
}

function printHelp() {
  console.log(color.bold('unvibe CLI - Developer Experience Enhanced'));
  console.log('');
  console.log(
    color.blue('Usage:') +
      ' cli.js [--update] [--restart] [--dry-run] [--verbose]'
  );
  console.log('');
  console.log(color.bold('Flags:'));
  console.log('  --update     Update project from GitHub and rebuild');
  console.log('  --restart    Restart app (same as default start)');
  console.log(
    '  --dry-run    Show what would be done, but do not run commands'
  );
  console.log('  --verbose    Print extra debug/log info');
  console.log('  --help, -h   Show this help');
  console.log('');
  console.log(color.gray('Project: https://github.com/unvibe/unvibe'));
}

// Simple spinner
let spinnerInterval = null;
let spinnerPos = 0;
const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
function showSpinner() {
  if (spinnerInterval) return;
  spinnerPos = 0;
  spinnerInterval = setInterval(() => {
    process.stdout.write(`\r${spinnerFrames[spinnerPos]} `);
    spinnerPos = (spinnerPos + 1) % spinnerFrames.length;
  }, 70);
}
function stopSpinner() {
  if (spinnerInterval) {
    clearInterval(spinnerInterval);
    spinnerInterval = null;
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
  }
}

function updateApp(opts) {
  run('git pull', PROJECT_DIR, 'git pull');
  if (shouldRunNpmInstall()) {
    if (opts.dry)
      return printSkipped('Would run npm install (skipped in dry-run)');
    run('npm install', PROJECT_DIR, 'npm install');
  } else {
    printSkipped('npm install (dependencies unchanged)');
  }
  if (shouldRunBuild()) {
    if (opts.dry)
      return printSkipped('Would run npm run build (skipped in dry-run)');
    run('npm run build', PROJECT_DIR, 'npm run build');
  } else {
    printSkipped('npm run build (no source changes)');
  }
  if (shouldRunDrizzlePush()) {
    if (opts.dry)
      return printSkipped(
        'Would run npx drizzle-kit push (skipped in dry-run)'
      );
    run('npx drizzle-kit push', PROJECT_DIR, 'drizzle-kit push');
  }
}

function startApp(opts) {
  if (shouldRunNpmInstall()) {
    if (opts.dry)
      return printSkipped('Would run npm install (skipped in dry-run)');
    run('npm install', PROJECT_DIR, 'npm install');
  } else {
    printSkipped('npm install (dependencies unchanged)');
  }
  if (shouldRunBuild()) {
    if (opts.dry)
      return printSkipped('Would run npm run build (skipped in dry-run)');
    run('npm run build', PROJECT_DIR, 'npm run build');
  } else {
    printSkipped('npm run build (no source changes)');
  }
  if (shouldRunDrizzlePush()) {
    if (opts.dry)
      return printSkipped(
        'Would run npx drizzle-kit push (skipped in dry-run)'
      );
    run('npx drizzle-kit push', PROJECT_DIR, 'drizzle-kit push');
  }
  if (opts.dry) return printSkipped('Would run npm start (skipped in dry-run)');
  run('npm start', PROJECT_DIR, 'npm start');
}

async function main() {
  const opts = parseArgs();
  const startTime = Date.now();

  if (
    !fs.existsSync(PROJECT_DIR) &&
    !fs.existsSync(path.join(PROJECT_DIR, '.git'))
  ) {
    if (opts.dry) return printSkipped('Would clone repo (skipped in dry-run)');
    run(`gh repo clone ${GH_REPO} ${PROJECT_DIR}`, null, 'clone repo');
  } else {
    printSkipped('Project already cloned at ~/.unvibe.');
  }

  if (opts.update) {
    updateApp(opts);
    console.log(
      color.green(
        'Project updated successfully. Restart the app to apply changes.'
      )
    );
    printSummary(startTime);
    return;
  }

  if (!fs.existsSync(ENV_FILE)) {
    if (!opts.dry) fs.writeFileSync(ENV_FILE, '', { encoding: 'utf8' });
    printSkipped('Created empty .env.local');
  }

  startApp(opts);
  printSummary(startTime);
}

function printSummary(startTime) {
  const total = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(color.bold(`\nDone! Total time: ${total}s\n`));
}

main();
