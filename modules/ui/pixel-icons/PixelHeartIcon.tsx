import React from 'react';
export const PixelHeartIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated', display: 'inline-block' }} xmlns="http://www.w3.org/2000/svg">
    {/* Main heart */}
    <rect x="10" y="14" width="4" height="6" fill="#FF4E74" />
    <rect x="18" y="14" width="4" height="6" fill="#FF4E74" />
    <rect x="12" y="10" width="8" height="8" fill="#FF4E74" />
    <rect x="14" y="18" width="4" height="6" fill="#FF4E74" />
    {/* Highlight */}
    <rect x="13" y="12" width="2" height="2" fill="#FFF0F6" />
    <rect x="19" y="12" width="2" height="2" fill="#FFF0F6" />
  </svg>
);
