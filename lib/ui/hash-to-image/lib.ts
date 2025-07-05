interface RuleEntry {
  chunk: string;
  asInt: number;
  position: [number, number];
  grid: number[][];
}

const createRuleEntry = (
  binaryChunks: string[][],
  position: [number, number],
  grid: number[][],
): RuleEntry => {
  const [i, j] = position;
  const chunk = binaryChunks[i][j];
  return {
    chunk,
    asInt: parseInt(chunk, 2),
    position,
    grid,
  };
};

function hexToBinary(hex: string): string {
  let binary = '';
  for (let i = 0; i < hex.length; i++) {
    const bits = parseInt(hex[i], 16).toString(2).padStart(4, '0');
    binary += bits;
  }
  return binary;
}

function chunk(string: string, size: number) {
  const chunks = [];
  for (let i = 0; i < string.length; i += size) {
    chunks.push(string.slice(i, i + size));
  }
  return chunks;
}

function map(
  value: number,
  start1: number,
  stop1: number,
  start2: number,
  stop2: number,
) {
  return ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
}

function hexgroupToNumber(hexgroup: string) {
  return map(parseInt(hexgroup, 16), 0, 1048576, 0, 255);
}

const createRGB = (rSlice: string, gSlice: string, bSlice: string) => {
  const r = hexgroupToNumber(rSlice);
  const g = hexgroupToNumber(gSlice);
  const b = hexgroupToNumber(bSlice);

  return {
    raw: [rSlice, gSlice, bSlice],
    rgb: [r, g, b],
    css: `rgb(${r}, ${g}, ${b})`,
    r,
    g,
    b,
  };
};

function f(entry: RuleEntry) {
  return entry.asInt % 2 === 0 ? 0 : 1;
}

const rotate90 = (grid: number[][]) =>
  grid[0].map((_, i) => grid.map((row) => row.reverse()[i]));
const shiftLeft = (grid: number[][]) =>
  grid.map((row) => [...row.slice(1), row[0]]);

const verticalMirror = (grid: number[][]) => {
  const newGrid = grid.map((row) => [...row]);
  const mid = Math.floor(newGrid.length / 2);
  for (let row = 0; row < mid; row++) {
    for (let col = 0; col < newGrid[0].length; col++) {
      newGrid[newGrid.length - row - 1][col] = newGrid[row][col];
    }
  }
  return newGrid;
};

function t(_grid: number[][]) {
  let grid = rotate90(_grid);
  grid = shiftLeft(grid);
  grid = verticalMirror(grid);
  return grid;
}

export function getMetaData(hash?: string | null) {
  if (!hash) return null;

  const rgb = createRGB(
    hash.slice(0, 5),
    hash.slice(5, 10),
    hash.slice(10, 15),
  );

  const shapeSlice = hash.slice(15);
  const bin = hexToBinary(shapeSlice);
  const binChunks = chunk(bin, bin.length / 5);
  const binChunksChunks = binChunks.map((_chunk) =>
    chunk(_chunk, _chunk.length / 5),
  );

  let grid: number[][] = [];
  for (let i = 0; i < binChunksChunks.length; i++) {
    grid[i] = [];
    for (let j = 0; j < binChunksChunks[i].length; j++) {
      const entry = createRuleEntry(binChunksChunks, [i, j], grid);
      grid[i][j] = f(entry);
    }
  }

  grid = t(grid);

  return { rgb, grid };
}
