import React from 'react';
export const PixelRocketIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated', display: 'inline-block' }} xmlns="http://www.w3.org/2000/svg">
    {/* Rocket body */}
    <rect x="14" y="6" width="4" height="10" fill="#D7E8FA" />
    {/* Nose cone */}
    <rect x="15" y="3" width="2" height="3" fill="#3286C2" />
    {/* Left fin */}
    <rect x="12" y="15" width="3" height="4" fill="#F6842A" />
    {/* Right fin */}
    <rect x="17" y="15" width="3" height="4" fill="#F6842A" />
    {/* Window */}
    <rect x="15" y="8" width="2" height="2" fill="#66E6E3" />
    {/* Flame */}
    <rect x="15" y="16" width="2" height="4" fill="#FFD93A" />
    <rect x="16" y="20" width="1" height="2" fill="#FF7A00" />
  </svg>
);
