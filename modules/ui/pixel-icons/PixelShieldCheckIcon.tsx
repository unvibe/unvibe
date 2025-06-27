import React from 'react';
export const PixelShieldCheckIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated', display: 'inline-block' }} xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="8" width="12" height="14" fill="#B6D4C7" />
    <rect x="14" y="22" width="4" height="4" fill="#A3BFB6" />
    <rect x="10" y="8" width="12" height="1" fill="#59796B" />
    <rect x="10" y="21" width="12" height="1" fill="#59796B" />
    <rect x="10" y="8" width="1" height="13" fill="#59796B" />
    <rect x="21" y="8" width="1" height="13" fill="#59796B" />
    <rect x="14" y="22" width="4" height="1" fill="#59796B" />
    <rect x="14" y="25" width="4" height="1" fill="#59796B" />
    <rect x="14" y="16" width="2" height="2" fill="#5BA768" />
    <rect x="16" y="18" width="2" height="2" fill="#5BA768" />
    <rect x="18" y="14" width="2" height="2" fill="#5BA768" />
  </svg>
);
