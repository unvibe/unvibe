import React from 'react';
import { Canvas } from '@react-three/fiber';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function RotatingBox(props: React.ComponentProps<'mesh'>) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });
  return (
    <mesh {...props} ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={'orange'} />
    </mesh>
  );
}

export default function Page() {
  return (
    <div style={{ width: '100%', height: '100vh', background: '#111' }}>
      <h1 style={{ textAlign: 'center', color: 'white', paddingTop: 20 }}>
        react-three-fiber Demo
      </h1>
      <Canvas
        camera={{ position: [0, 0, 5] }}
        style={{
          height: 500,
          margin: '0 auto',
          display: 'block',
          background: '#222',
        }}
      >
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <RotatingBox position={[0, 0, 0]} />
      </Canvas>
      <p style={{ color: '#ccc', textAlign: 'center', marginTop: 20 }}>
        This is a simple 3D cube rendered using @react-three/fiber.
      </p>
    </div>
  );
}
