import { make, CreateTool } from '@/plugins/_types/tools';
import * as llm from '@/server/llm';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { exec } from 'child_process';

export const config = make({
  name: 'node_scratch_pad',
  description: `Executes provided JavaScript code using Node.js (by writing to a temp file and running node on it). This tool is intended as a general-purpose JavaScript scratch pad for the LLM to answer questions, whether related or unrelated to the project context. It is a thinking tool for running quick computations, logic checks, or data transformations in JavaScript.\n\n**IMPORTANT:** Use this tool ONLY for Node.js scripts that complete quickly (a few seconds at most). Avoid starting servers or running long processes, as this will hang the model response.`,
  usage: `**node_scratch_pad**: A general-purpose JavaScript scratch pad (runs code in a temp file via Node.js).\n\nIntended for the LLM to answer questions or perform quick logic/data checks, not limited to project-specific code.\n\nParams:\n- code (string, required): JavaScript code to execute.\n- cwd (string, optional): Working directory (defaults to project root).\n\n**IMPORTANT:** Only use for scripts that end quickly. Do NOT use for long-running processes like starting servers, as this will hang your session.`,
  parameters: {
    code: { type: 'string', description: 'JavaScript code to execute in Node.js.' },
    cwd: {
      type: 'string',
      description: 'Working directory (default: project root).',
      nullable: true,
    },
  },
});

function makeTempJsFilePath() {
  const randomPart = Math.random().toString(36).slice(2);
  return path.join(os.tmpdir(), `node_scratch_${randomPart}.js`);
}

async function runNodeScript(command: string, cwd: string): Promise<string> {
  return new Promise((resolve) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (stdout && stdout.trim().length > 0) {
        resolve(stdout);
      } else if (stderr && stderr.trim().length > 0) {
        resolve(stderr);
      } else if (error) {
        resolve(error.message);
      } else {
        resolve('');
      }
    });
  });
}

export const createTool: CreateTool = ({ project }) => {
  return llm.tool(
    config.name,
    config.description,
    config.parameters,
    async ({ code, cwd }) => {
      if (typeof code !== 'string' || code.trim().length === 0) {
        return '';
      }
      const tempFile = makeTempJsFilePath();
      try {
        await fs.writeFile(tempFile, code, { encoding: 'utf8' });
        const command = `node "${tempFile}"`;
        const output = await runNodeScript(command, cwd || project.path);
        await fs.unlink(tempFile); // cleanup
        return output;
      } catch (error) {
        try { await fs.unlink(tempFile); } catch { /* ignore */ }
        return error instanceof Error ? error.message : String(error);
      }
    }
  );
};
