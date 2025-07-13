import React from 'react';
import { Canvas } from '@react-three/fiber';
import { RotatingEarth } from './RotatingEarth';
import { AnimatedDotsBackground } from './StarsBackground';

export default function Page() {
  return (
    <div style={{ width: '100%', height: '100vh', background: '#fff' }}>
      <h1 style={{ textAlign: 'center', color: 'black', paddingTop: 20 }}>
        3D Low-Poly Earth with Edges (drei)
      </h1>
      <Canvas
        camera={{ position: [0, 0, 3] }}
        style={{
          height: 500,
          margin: '0 auto',
          display: 'block',
          background: '#fff',
        }}
      >
        <AnimatedDotsBackground />
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <RotatingEarth position={[0, 0, 0]} />
      </Canvas>
      <p style={{ color: '#333', textAlign: 'center', marginTop: 20 }}>
        This is a modern three-fiber + drei demo of a low-poly white Earth with
        real triangle edges.
      </p>
    </div>
  );
}
