import React from 'react';

export function RoadLines({ roadOffset }: { roadOffset: number }) {
  const lines = [];
  for (let i = -6; i < 10; i++) {
    lines.push(
      <mesh key={i} position={[0, -0.09, i * 1.1 + (roadOffset % 1.1)]}>
        <boxGeometry args={[0.1, 0.01, 0.5]} />
        <meshStandardMaterial color='white' />
      </mesh>
    );
  }
  return <>{lines}</>;
}
