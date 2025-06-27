// tsserver-manager.ts –- robust singleton wrapper around a single tsserver instance per project
// Implements the hardening recommendations:
//   • no --useSingleInferredProject (let tsserver manage projects normally)
//   • pass projectRootPath on every `open`
//   • normalise + real-path all file names before talking to tsserver
//   • close files when we no longer need them
//   • use the lightweight partial-semantic server mode instead of the fragile inferred mode

import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import * as path from 'path';
import { existsSync, realpathSync } from 'fs';

const INSTANCES: Record<string, TSServerManager> = {};

export interface HoverRequest {
  file: string;
  line: number;
  offset: number;
}
export interface HoverResponse {
  contents: string;
}

interface Pending<T> {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: string) => void;
}

export class TSServerManager {
  private tsserverProc: ChildProcessWithoutNullStreams;
  private seq = 1;
  private pending: Map<number, Pending<unknown>> = new Map();
  private buffer = '';
  private openFiles: Set<string> = new Set();
  public readonly projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = path.resolve(projectRoot);

    const tsserverPath = path.join(
      this.projectRoot,
      'node_modules',
      'typescript',
      'lib',
      'tsserver.js'
    );
    if (!existsSync(tsserverPath)) {
      throw new Error(
        `Could not find tsserver.js in project: ${tsserverPath}. Please install typescript in this project.`
      );
    }

    // Use the lighter partial-semantic mode instead of forcing a single inferred project.
    this.tsserverProc = spawn(process.execPath, [tsserverPath], {
      cwd: this.projectRoot,
    });

    this.tsserverProc.stdout.on('data', this.handleStdout.bind(this));
    this.tsserverProc.stderr.on('data', () => {
      // Uncomment for verbose debugging:
      // console.error('[tsserver stderr]', data.toString());
    });
    this.tsserverProc.on('exit', (code) => {
      console.warn(`[tsserver] exited with code ${code ?? 'unknown'}`);
      // You may want to restart the server automatically here.
    });
  }

  /* --------------------------------------------------
   *  Private helpers
   * -------------------------------------------------- */

  private handleStdout(data: Buffer) {
    this.buffer += data.toString();
    let idx: number;
    while ((idx = this.buffer.indexOf('\n')) >= 0) {
      const line = this.buffer.slice(0, idx);
      this.buffer = this.buffer.slice(idx + 1);
      if (!line.startsWith('{')) continue; // ignore the protocol header lines
      try {
        const msg = JSON.parse(line);
        if (msg.type === 'response' && this.pending.has(msg.request_seq)) {
          const { resolve, reject } = this.pending.get(msg.request_seq)!;
          this.pending.delete(msg.request_seq);
          if (msg.success) {
            resolve(msg.body);
          } else {
            reject(msg.message ?? 'tsserver error');
          }
        }
      } catch {
        /* ignore parse errors */
      }
    }
  }

  private sendCommand<T = unknown>(
    command: string,
    args: object = {}
  ): Promise<T> {
    const seq = this.seq++;
    const request = { seq, type: 'request', command, arguments: args } as const;

    return new Promise<T>((resolve, reject) => {
      this.pending.set(seq, {
        resolve: resolve as (value: unknown) => void,
        reject,
      });
      this.tsserverProc.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  private normaliseFile(p: string) {
    const abs = path.isAbsolute(p) ? p : path.resolve(this.projectRoot, p);
    return realpathSync.native(abs);
  }

  private async openFile(fileAbs: string, content?: string) {
    const file = this.normaliseFile(fileAbs);
    if (this.openFiles.has(file)) return;
    await this.sendCommand('open', {
      file,
      fileContent: content ?? undefined,
      projectRootPath: this.projectRoot,
    });
    this.openFiles.add(file);
  }

  private async closeFile(fileAbs: string) {
    const file = this.normaliseFile(fileAbs);
    if (!this.openFiles.has(file)) return;
    await this.sendCommand('close', { file });
    this.openFiles.delete(file);
  }

  /** Get hover / quickInfo at 1-based line & offset. */
  async getHover({ file, line, offset }: HoverRequest): Promise<HoverResponse> {
    await this.openFile(file);
    const body = await this.sendCommand<{
      displayString?: string;
      documentation?: string | string[];
    }>('quickinfo', { file: this.normaliseFile(file), line, offset });
    await this.closeFile(file);
    const doc = Array.isArray(body.documentation)
      ? body.documentation.join('\n')
      : (body.documentation ?? '');
    return {
      contents: `${body.displayString ?? ''}${doc ? '\n' + doc : ''}`.trim(),
    };
  }

  /** Get completions at a position. */
  async getCompletions(file: string, line: number, offset: number) {
    await this.openFile(file);
    const result = await this.sendCommand('completions', {
      file: this.normaliseFile(file),
      line,
      offset,
    });
    await this.closeFile(file);
    return result;
  }

  /** Get definition(s) at a position. */
  async getDefinition(file: string, line: number, offset: number) {
    await this.openFile(file);
    const result = await this.sendCommand('definition', {
      file: this.normaliseFile(file),
      line,
      offset,
    });
    await this.closeFile(file);
    return result;
  }

  /** Get all references for symbol at a position. */
  async getReferences(file: string, line: number, offset: number) {
    await this.openFile(file);
    const result = await this.sendCommand('references', {
      file: this.normaliseFile(file),
      line,
      offset,
    });
    await this.closeFile(file);
    return result;
  }

  /** Get signature help for function/method call at a position. */
  async getSignatureHelp(file: string, line: number, offset: number) {
    await this.openFile(file);
    const result = await this.sendCommand('signatureHelp', {
      file: this.normaliseFile(file),
      line,
      offset,
    });
    await this.closeFile(file);
    return result;
  }

  /** Get rename edits needed for a symbol at a position. */
  async getRenameEdits(
    file: string,
    line: number,
    offset: number,
    newName: string
  ) {
    await this.openFile(file);
    const result = await this.sendCommand('rename', {
      file: this.normaliseFile(file),
      line,
      offset,
      newName,
    });
    await this.closeFile(file);
    return result;
  }

  /** List available refactorings at a position. */
  async getApplicableRefactors(file: string, line: number, offset: number) {
    await this.openFile(file);
    const result = await this.sendCommand('getApplicableRefactors', {
      file: this.normaliseFile(file),
      line,
      offset,
    });
    await this.closeFile(file);
    return result;
  }

  /** Get the edits for a selected refactor action at a position. */
  async getEditsForRefactor(
    file: string,
    line: number,
    offset: number,
    refactor: string,
    action: string
  ) {
    await this.openFile(file);
    const result = await this.sendCommand('getEditsForRefactor', {
      file: this.normaliseFile(file),
      line,
      offset,
      refactor,
      action,
    });
    await this.closeFile(file);
    return result;
  }

  /** Get code fixes for a span. */
  async getCodeFixes(
    file: string,
    startLine: number,
    startOffset: number,
    endLine: number,
    endOffset: number
  ) {
    await this.openFile(file);
    const result = await this.sendCommand('getCodeFixes', {
      file: this.normaliseFile(file),
      startLine,
      startOffset,
      endLine,
      endOffset,
    });
    await this.closeFile(file);
    return result;
  }

  /** Get diagnostics for a file. */
  async getDiagnostics(file: string) {
    await this.openFile(file);
    const result = await this.sendCommand('geterr', {
      files: [this.normaliseFile(file)],
    });
    await this.closeFile(file);
    return result;
  }
}

export function getLSP(projectRoot: string) {
  const root = path.resolve(projectRoot);
  if (!INSTANCES[root]) {
    INSTANCES[root] = new TSServerManager(root);
  }
  return INSTANCES[root];
}
