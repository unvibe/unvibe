// server/llm/memory.ts
export type MemoryEntry = {
  text: string;
  embedding: number[];
};

const OLLAMA_EMBED_URL = 'http://localhost:11434/api/embeddings';
const OLLAMA_MODEL = 'nomic-embed-text';

// In-memory storage for demonstration (replace with DB or vector DB for persistence)
const memory: MemoryEntry[] = [];

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

export async function addMemory(text: string): Promise<void> {
  const embedding = await getEmbedding(text);
  memory.push({ text, embedding });
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

export async function searchMemory(
  query: string,
  topK: number = 3
): Promise<{ text: string; score: number }[]> {
  if (!memory.length) return [];
  const queryEmbedding = await getEmbedding(query);
  const results = memory.map(({ text, embedding }) => ({
    text,
    score: cosineSimilarity(queryEmbedding, embedding),
  }));
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topK);
}

// For demonstration: add a quick test when run directly
(async () => {
  await addMemory('The Eiffel Tower is in Paris.');
  await addMemory('Python is a popular programming language.');
  await addMemory('The capital of Japan is Tokyo.');
  const results = await searchMemory('What is the capital of France?');
  console.log('Recall Results:');
  for (const r of results) {
    console.log(`${r.score.toFixed(3)}: ${r.text}`);
  }
})();
