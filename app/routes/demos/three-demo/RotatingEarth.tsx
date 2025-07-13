import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';

export function RotatingEarth(props: React.ComponentProps<'mesh'>) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.005;
  });
  return (
    <mesh ref={meshRef} {...props}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color={'#fff'} flatShading />
      <Edges color='black' />
    </mesh>
  );
}
