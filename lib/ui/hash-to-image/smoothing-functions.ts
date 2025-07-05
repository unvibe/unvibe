// 1) Smoothing functions (with slight refactoring to unify the signature):
//    We accept (points, options) where "options" can contain tension, frequency, amplitude, etc.
//    If a function doesn't use certain options, it just ignores them.
export const SmoothingFunctions = {
  catmullRomToBezier(
    points: { x: number; y: number }[],
    options: { tension?: number } = {}
  ): string {
    const { tension = 0.5 } = options;
    if (points.length < 2) return '';
    let d = `M${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i === 0 ? points[0] : points[i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i + 2 < points.length ? points[i + 2] : p2;

      const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension;
      const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension;
      const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension;
      const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension;

      d += ` C${cp1x},${cp1y},${cp2x},${cp2y},${p2.x},${p2.y}`;
    }
    return d;
  },

  cardinalToBezier(
    points: { x: number; y: number }[],
    options: { tension?: number } = {}
  ): string {
    const { tension = 0.5 } = options;
    if (points.length < 2) return '';
    let d = `M${points[0].x},${points[0].y}`;
    const t = (1 - tension) / 2;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i === 0 ? points[0] : points[i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i + 2 < points.length ? points[i + 2] : p2;

      const cp1x = p1.x + t * (p2.x - p0.x);
      const cp1y = p1.y + t * (p2.y - p0.y);
      const cp2x = p2.x - t * (p3.x - p1.x);
      const cp2y = p2.y - t * (p3.y - p1.y);

      d += ` C${cp1x},${cp1y},${cp2x},${cp2y},${p2.x},${p2.y}`;
    }
    return d;
  },

  basisSpline(points: { x: number; y: number }[]): string {
    if (points.length < 2) return '';
    let d = `M${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length - 1; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];

      // Simple 3-point average step
      const cp1x = (p0.x + 4 * p1.x + p2.x) / 6;
      const cp1y = (p0.y + 4 * p1.y + p2.y) / 6;
      d += ` L${cp1x},${cp1y}`;
    }
    const last = points[points.length - 1];
    d += ` L${last.x},${last.y}`;
    return d;
  },

  // We'll omit showing *all* the others again, but you can slot them in here
  // (monotoneCubic, hermiteSpline, noiseDistorted, etc.) as needed.
};

// 2) Basic nearest-neighbor path logic
interface Point {
  x: number;
  y: number;
}

function euclideanDistance(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function nearestNeighborPath(points: Point[]): Point[] {
  if (points.length === 0) {
    return [];
  }
  const path: Point[] = [];
  const unvisited = new Set(points);

  let current = points[0];
  unvisited.delete(current);
  path.push(current);

  while (unvisited.size > 0) {
    let nextP: Point | null = null;
    let minDist = Infinity;
    for (const p of unvisited) {
      const d = euclideanDistance(current, p);
      if (d < minDist) {
        minDist = d;
        nextP = p;
      }
    }
    if (nextP) {
      unvisited.delete(nextP);
      path.push(nextP);
      current = nextP;
    } else {
      break;
    }
  }

  return path;
}

// 3) Default line function (no smoothing)
function buildLinePath(points: Point[]): string {
  if (points.length === 0) {
    return '';
  }
  const [first, ...rest] = points;
  const commands: string[] = [`M ${first.x} ${first.y}`];
  for (const pt of rest) {
    commands.push(`L ${pt.x} ${pt.y}`);
  }
  return commands.join(' ');
}

// 4) The combined function
//    "smoothingFn" is optional; if not provided, we just do a line path.
export function GridToSVGPath<Options extends Record<string, unknown>>(
  grid: number[][],
  cellWidth: number,
  cellHeight: number,
  // Optional smoothing function:
  smoothingFn?: (pts: Point[], opts?: Options) => string,
  // Optional smoothing options (tension, freq, amplitude, etc.)
  smoothingOptions?: Options
): string {
  // 1. Gather scaled points
  const points: Point[] = [];
  grid.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell === 1) {
        points.push({
          x: j * cellWidth + cellWidth / 2,
          y: i * cellHeight + cellHeight / 2,
        });
      }
    });
  });

  // 2. Sort for deterministic start
  points.sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y));

  // 3. Get nearest neighbor ordering
  const nnPath = nearestNeighborPath(points);

  // 4. Build path:
  //    - If there's no smoothing function, return a simple polyline
  //    - Otherwise, call the smoothing function
  if (!smoothingFn) {
    return buildLinePath(nnPath);
  } else {
    return smoothingFn(nnPath, smoothingOptions);
  }
}
