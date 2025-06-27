import React from 'react';
export const PixelAxeIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated', display: 'inline-block' }} xmlns="http://www.w3.org/2000/svg">
    <rect x="14" y="6" width="4" height="16" fill="#B6866F" />
    <rect x="14" y="22" width="4" height="4" fill="#875439" />
    <rect x="9" y="4" width="6" height="6" fill="#D9D9D9" />
    <rect x="8" y="5" width="1" height="4" fill="#A6A6A6" />
    <rect x="15" y="4" width="6" height="2" fill="#D9D9D9" />
    <rect x="17" y="6" width="4" height="2" fill="#A6A6A6" />
    <rect x="19" y="8" width="2" height="2" fill="#787878" />
    <rect x="9" y="4" width="1" height="1" fill="#FFFFFF" />
    <rect x="15" y="4" width="1" height="1" fill="#FFFFFF" />
  </svg>
);
