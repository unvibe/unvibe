import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function AnimatedDotsBackground({
  count = 80,
  radius = 7,
  speed = 0.05,
}) {
  // Each dot has: spherical position (theta, phi), speed, and offset
  const dots = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const baseSpeed = speed * (0.5 + Math.random());
      const offset = Math.random() * 1000;
      return { theta, phi, baseSpeed, offset };
    });
  }, [count, speed]);
  const meshRef = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!meshRef.current) return;
    const positions = meshRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const { theta, phi, baseSpeed, offset } = dots[i];
      // Animate theta for "orbiting" motion
      const animatedTheta = theta + (t + offset) * baseSpeed;
      const x = radius * Math.sin(phi) * Math.cos(animatedTheta);
      const y = radius * Math.sin(phi) * Math.sin(animatedTheta);
      const z = radius * Math.cos(phi);
      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  // Initial positions
  const initialPositions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const { theta, phi } = dots[i];
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      arr[i * 3 + 0] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
    return arr;
  }, [dots, count, radius]);

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach='attributes-position'
          count={count}
          array={initialPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color={'black'} size={0.11} sizeAttenuation={false} />
    </points>
  );
}
