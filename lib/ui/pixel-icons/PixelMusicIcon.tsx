import React from 'react';
export const PixelMusicIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated', display: 'inline-block' }} xmlns="http://www.w3.org/2000/svg">
    {/* Stem */}
    <rect x="17" y="6" width="2" height="14" fill="#472C7A" />
    {/* Note head */}
    <rect x="15" y="18" width="6" height="4" fill="#A97FFF" />
    {/* Accent */}
    <rect x="15" y="20" width="2" height="2" fill="#D6BFFF" />
    {/* Second note (eighth note style) */}
    <rect x="21" y="11" width="2" height="9" fill="#472C7A" />
    <rect x="19" y="18" width="6" height="4" fill="#A97FFF" />
    <rect x="19" y="20" width="2" height="2" fill="#D6BFFF" />
  </svg>
);
