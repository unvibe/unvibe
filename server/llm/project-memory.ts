// server/llm/project-memory.ts
import { promises as fs } from 'fs';
import * as path from 'path';
import os from 'os';

export type MemoryEntry = {
  text: string;
  embedding: number[];
};

const OLLAMA_EMBED_URL = 'http://localhost:11434/api/embeddings';
const OLLAMA_MODEL = 'nomic-embed-text';

function getMemoryFilePath(projectId: string): string {
  // Store at: <home>/.unvibe/.unvibe-memory/<projectId>/memory.json
  const home = os.homedir();
  return path.join(home, '.unvibe', '.unvibe-memory', projectId, 'memory.json');
}

async function ensureMemoryFile(projectId: string): Promise<void> {
  const home = os.homedir();
  const dir = path.join(home, '.unvibe', '.unvibe-memory', projectId);
  await fs.mkdir(dir, { recursive: true });
  const file = getMemoryFilePath(projectId);
  try {
    await fs.access(file);
  } catch {
    await fs.writeFile(file, '[]', 'utf8');
  }
}

async function loadMemory(projectId: string): Promise<MemoryEntry[]> {
  await ensureMemoryFile(projectId);
  const file = getMemoryFilePath(projectId);
  const data = await fs.readFile(file, 'utf8');
  return JSON.parse(data) as MemoryEntry[];
}

async function saveMemory(
  projectId: string,
  memory: MemoryEntry[]
): Promise<void> {
  const file = getMemoryFilePath(projectId);
  await fs.writeFile(file, JSON.stringify(memory, null, 2), 'utf8');
}

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch(OLLAMA_EMBED_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_MODEL, prompt: text }),
  });
  if (!res.ok) {
    throw new Error(
      `Ollama embedding API error: ${res.status} ${res.statusText}`
    );
  }
  const data = await res.json();
  if (!Array.isArray(data.embedding)) {
    throw new Error('No embedding returned from Ollama');
  }
  return data.embedding;
}

export async function addProjectMemory(
  projectId: string,
  text: string
): Promise<void> {
  const embedding = await getEmbedding(text);
  const memory = await loadMemory(projectId);
  memory.push({ text, embedding });
  await saveMemory(projectId, memory);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; ++i) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function searchProjectMemory(
  projectId: string,
  query: string,
  topK: number = 3
): Promise<{ text: string; score: number }[]> {
  const memory = await loadMemory(projectId);
  if (!memory.length) return [];
  const queryEmbedding = await getEmbedding(query);
  const results = memory.map(({ text, embedding }) => ({
    text,
    score: cosineSimilarity(queryEmbedding, embedding),
  }));
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topK);
}
