import React from 'react';
export const PixelArchiveIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated', display: 'inline-block' }} xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="12" width="16" height="12" fill="#E5CC9A" />
    <rect x="8" y="10" width="16" height="4" fill="#C8B078" />
    <rect x="14" y="17" width="4" height="2" fill="#997642" />
    <rect x="21" y="12" width="3" height="12" fill="#CBB67A" />
    <rect x="8" y="12" width="16" height="1" fill="#997642" />
    <rect x="8" y="23" width="16" height="1" fill="#997642" />
    <rect x="8" y="12" width="1" height="12" fill="#997642" />
    <rect x="23" y="12" width="1" height="12" fill="#997642" />
  </svg>
);
