import React from 'react';
import { PLAYER_Z } from './types';

export function PlayerCar({
  carX,
  carRotation = 0,
  carRoll = 0,
}: {
  carX: number;
  carRotation?: number;
  carRoll?: number;
}) {
  // Styling parameters
  const bodyColor = '#fff';
  const roofColor = '#63636e';
  const windowColor = '#b8e5fc';
  const wheelColor = '#19191d';
  // Wheel geometry
  const wheelR = 0.09; // larger radius
  const wheelW = 0.13; // wheel width
  const wheelY = -0.1;

  return (
    <group
      position={[carX, 0.1, PLAYER_Z]}
      rotation={[0, carRotation ?? 0, carRoll ?? 0]}
      castShadow
    >
      {/* Body */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[0.5, 0.19, 1]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 0.14, -0.1]} castShadow>
        <boxGeometry args={[0.26, 0.07, 0.41]} />
        <meshStandardMaterial color={roofColor} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 0.15, 0.23]}>
        <boxGeometry args={[0.24, 0.04, 0.14]} />
        <meshStandardMaterial color={windowColor} />
      </mesh>
      {/* Rear window */}
      <mesh position={[0, 0.15, -0.32]}>
        <boxGeometry args={[0.18, 0.035, 0.11]} />
        <meshStandardMaterial color={windowColor} />
      </mesh>
      {/* Headlights */}
      <mesh position={[-0.15, 0.07, 0.48]}>
        <boxGeometry args={[0.08, 0.03, 0.05]} />
        <meshStandardMaterial color={'#ffe38a'} />
      </mesh>
      <mesh position={[0.15, 0.07, 0.48]}>
        <boxGeometry args={[0.08, 0.03, 0.05]} />
        <meshStandardMaterial color={'#ffe38a'} />
      </mesh>
      {/* Tail lights */}
      <mesh position={[-0.15, 0.07, -0.49]}>
        <boxGeometry args={[0.08, 0.03, 0.03]} />
        <meshStandardMaterial color={'#fe4f4e'} />
      </mesh>
      <mesh position={[0.15, 0.07, -0.49]}>
        <boxGeometry args={[0.08, 0.03, 0.03]} />
        <meshStandardMaterial color={'#fe4f4e'} />
      </mesh>
      {/* Wheels: big, dark, offset for cartoon style */}
      <mesh
        position={[-0.22, wheelY, 0.34]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[wheelR, wheelR, wheelW, 16]} />
        <meshStandardMaterial color={wheelColor} />
      </mesh>
      <mesh
        position={[0.22, wheelY, 0.34]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[wheelR, wheelR, wheelW, 16]} />
        <meshStandardMaterial color={wheelColor} />
      </mesh>
      <mesh
        position={[-0.22, wheelY, -0.36]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[wheelR, wheelR, wheelW, 16]} />
        <meshStandardMaterial color={wheelColor} />
      </mesh>
      <mesh
        position={[0.22, wheelY, -0.36]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[wheelR, wheelR, wheelW, 16]} />
        <meshStandardMaterial color={wheelColor} />
      </mesh>
    </group>
  );
}
