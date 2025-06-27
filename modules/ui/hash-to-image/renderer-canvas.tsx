import { useEffect, useRef } from 'react';

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
  fillCell = '#000',
  background = '#fff',
  className,
}: RendererProps) {
  const ref = useRef<null | HTMLCanvasElement>(null);

  useEffect(() => {
    // here we render the canvas
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // now we draw the grid
    grid?.forEach((row, i) => {
      row.forEach((cell, j) => {
        ctx.fillStyle = cell === 0 ? background : fillCell;
        ctx.fillRect(i * (size / 5), j * (size / 5), size / 5, size / 5);
      });
    });
  }, [size, grid, fillCell, background]);

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      className={`overflow-hidden${className ? ` ${className}` : ''}`}
    />
  );
}
