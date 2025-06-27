import React from 'react';
export function Lane() {
  return (
    <mesh position={[0, -0.11, 0]} receiveShadow>
      <boxGeometry args={[3, 0.02, 12]} />
      <meshStandardMaterial color='#222' />
    </mesh>
  );
}
