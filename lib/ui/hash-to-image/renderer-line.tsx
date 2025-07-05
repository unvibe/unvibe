import type { RendererProps } from './renderer-svg';
import { SmoothingFunctions, GridToSVGPath } from './smoothing-functions';

export function RendererLine({
  size,
  grid = [[]],
  className,
  background,
  fillCell = '#000',
}: RendererProps) {
  const numRows = grid.length;
  const numCols = grid[0].length;
  const cellWidth = size / numCols;
  const cellHeight = size / numRows;

  // Convert points to a smooth path
  const pathData = GridToSVGPath(
    grid,
    cellWidth,
    cellHeight,
    SmoothingFunctions.catmullRomToBezier,
    { tension: 0.9 }
  );

  return (
    <svg
      className={`overflow-hidden rotate-90 ${className || ''}`}
      xmlns='http://www.w3.org/2000/svg'
      viewBox={`0 0 ${size} ${size}`}
    >
      <rect width='100%' height='100%' fill={background} />
      <path
        d={pathData}
        fill='none'
        stroke={fillCell}
        strokeWidth={Math.min(cellWidth, cellHeight) / 4}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}
