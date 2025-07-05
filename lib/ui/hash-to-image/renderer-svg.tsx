export interface RendererProps {
  size: number;
  grid?: number[][];
  className?: string;
  background?: string;
  fillCell?: string;
}

export function Renderer({
  size,
  grid,
  className,
  background,
  fillCell,
}: RendererProps) {
  return (
    <svg
      className={`overflow-hidden rotate-90 ${className ? ` ${className}` : ''}`}
      xmlns='http://www.w3.org/2000/svg'
      viewBox={`0 0 ${size} ${size}`}
    >
      {/* Background */}
      <rect width='100%' height='100%' fill={background} />
      {/* Grid */}
      {grid?.map((row, i) =>
        row.map((cell, j) => {
          const fill = cell === 0 ? background : fillCell;
          const numRows = grid.length;
          const numCols = grid[0].length;
          const cellWidth = size / numCols;
          const cellHeight = size / numRows;
          return (
            <rect
              key={`${i}-${j}`}
              x={j * cellWidth}
              y={i * cellHeight}
              width={cellWidth}
              height={cellHeight}
              fill={fill}
              stroke={fill}
            />
          );
        }),
      )}
    </svg>
  );
}
