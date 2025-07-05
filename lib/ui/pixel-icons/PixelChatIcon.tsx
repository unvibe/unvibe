import React from 'react';
export const PixelChatIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated', display: 'inline-block' }} xmlns="http://www.w3.org/2000/svg">
    {/* Bubble body */}
    <rect x="7" y="10" width="18" height="10" fill="#6EC1E4" />
    {/* Bubble tail */}
    <rect x="11" y="20" width="4" height="3" fill="#6EC1E4" />
    <rect x="12" y="23" width="2" height="2" fill="#36A2CF" />
    {/* Bubble highlight */}
    <rect x="9" y="12" width="4" height="2" fill="#C6F1FF" />
    {/* Dots */}
    <rect x="13" y="16" width="2" height="2" fill="#1C5DA7" />
    <rect x="17" y="16" width="2" height="2" fill="#1C5DA7" />
    <rect x="21" y="16" width="2" height="2" fill="#1C5DA7" />
  </svg>
);
