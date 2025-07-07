import React from 'react';
export const PixelSyncIcon = ({ size = 32 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 32 32'
    shapeRendering='crispEdges'
    style={{ imageRendering: 'pixelated', display: 'inline-block' }}
    xmlns='http://www.w3.org/2000/svg'
  >
    {/* Arrows forming a circle */}
    <rect x='7' y='15' width='10' height='2' fill='#5BC0EB' />
    <polygon points='17,13 21,16 17,19' fill='#5BC0EB' />
    <rect x='15' y='7' width='2' height='10' fill='#5BC0EB' />
    <polygon points='13,17 16,21 19,17' fill='#5BC0EB' />
  </svg>
);
