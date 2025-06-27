import React from 'react';

export function TrafficCar({ x, z }: { x: number; z: number }) {
  // Red enemy car
  const bodyColor = '#F35555';
  const roofColor = '#363648';
  const windowColor = '#b8e5fc';
  const wheelColor = '#131317';
  const wheelR = 0.085; // match player but a tiny bit smaller
  const wheelW = 0.12;
  const wheelY = -0.09;

  return (
    <group position={[x, 0.11, z]} castShadow>
      {/* Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.48, 0.17, 0.89]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 0.13, -0.09]} castShadow>
        <boxGeometry args={[0.24, 0.055, 0.34]} />
        <meshStandardMaterial color={roofColor} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 0.14, 0.19]}>
        <boxGeometry args={[0.17, 0.028, 0.09]} />
        <meshStandardMaterial color={windowColor} />
      </mesh>
      {/* Rear window */}
      <mesh position={[0, 0.14, -0.21]}>
        <boxGeometry args={[0.12, 0.022, 0.07]} />
        <meshStandardMaterial color={windowColor} />
      </mesh>
      {/* Headlights */}
      <mesh position={[-0.12, 0.045, 0.44]}>
        <boxGeometry args={[0.07, 0.02, 0.022]} />
        <meshStandardMaterial color={'#f6f6dc'} />
      </mesh>
      <mesh position={[0.12, 0.045, 0.44]}>
        <boxGeometry args={[0.07, 0.02, 0.022]} />
        <meshStandardMaterial color={'#f6f6dc'} />
      </mesh>
      {/* Tail lights */}
      <mesh position={[-0.12, 0.045, -0.44]}>
        <boxGeometry args={[0.07, 0.02, 0.02]} />
        <meshStandardMaterial color={'#ed365d'} />
      </mesh>
      <mesh position={[0.12, 0.045, -0.44]}>
        <boxGeometry args={[0.07, 0.02, 0.02]} />
        <meshStandardMaterial color={'#ed365d'} />
      </mesh>
      {/* Wheels: big, dark, offset for cartoon style */}
      <mesh
        position={[-0.18, wheelY, 0.25]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[wheelR, wheelR, wheelW, 16]} />
        <meshStandardMaterial color={wheelColor} />
      </mesh>
      <mesh
        position={[0.18, wheelY, 0.25]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[wheelR, wheelR, wheelW, 16]} />
        <meshStandardMaterial color={wheelColor} />
      </mesh>
      <mesh
        position={[-0.18, wheelY, -0.25]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[wheelR, wheelR, wheelW, 16]} />
        <meshStandardMaterial color={wheelColor} />
      </mesh>
      <mesh
        position={[0.18, wheelY, -0.25]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[wheelR, wheelR, wheelW, 16]} />
        <meshStandardMaterial color={wheelColor} />
      </mesh>
    </group>
  );
}
