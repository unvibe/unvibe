import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Shared materials for building exteriors (5 color themes)
const buildingMaterials = [
  new THREE.MeshStandardMaterial({ color: '#91aee2', roughness: 0.51 }),
  new THREE.MeshStandardMaterial({ color: '#aacfd6', roughness: 0.44 }),
  new THREE.MeshStandardMaterial({ color: '#a3b2cd', roughness: 0.57 }),
  new THREE.MeshStandardMaterial({ color: '#c3ceee', roughness: 0.33 }),
  new THREE.MeshStandardMaterial({ color: '#7794a8', roughness: 0.65 }),
];

// Shared materials for windows
const windowLitMat = new THREE.MeshStandardMaterial({
  color: '#eee98a',
  emissive: '#ffe377',
  emissiveIntensity: 1.15,
  toneMapped: false,
});
const windowOffMat = new THREE.MeshStandardMaterial({
  color: '#363f44',
  emissive: '#363f44',
  emissiveIntensity: 0.18,
  toneMapped: false,
});

// Generate random city buildings with reusable mesh materials
function generateCity(buildingCount = 140) {
  const buildings: {
    position: [number, number, number];
    scale: [number, number, number];
    hasWindows: boolean;
    windowMask: boolean[];
    windowCount: number;
    matIndex: number; // for material sharing
  }[] = [];
  for (let i = 0; i < buildingCount; i++) {
    const x =
      (Math.floor(Math.random() * 18) - 9) * 4 + (Math.random() - 0.5) * 2;
    const z =
      (Math.floor(Math.random() * 18) - 9) * 4 + (Math.random() - 0.5) * 2;
    if (Math.abs(x) < 2 && Math.abs(z) < 2) continue;
    const y = 2.3 + Math.random() * 14;
    const sx = 1.5 + Math.random() * 2.5;
    const sz = 1.5 + Math.random() * 2.5;
    const hasWindows = Math.random() < 0.35;
    const windowCount = Math.floor(y * 1.15);
    const windowMask: boolean[] = [];
    for (let w = 0; w < windowCount; w++) {
      windowMask.push(Math.random() > 0.28);
    }
    const matIndex = i % buildingMaterials.length;
    buildings.push({
      position: [x, y / 2, z],
      scale: [sx, y, sz],
      hasWindows,
      windowMask,
      windowCount,
      matIndex,
    });
  }
  return buildings;
}

function Buildings() {
  const buildings = React.useMemo(() => generateCity(), []);
  return (
    <group>
      {buildings.map((b, i) => (
        <group key={i}>
          <mesh
            position={b.position as [number, number, number]}
            scale={b.scale as [number, number, number]}
            castShadow
            receiveShadow
            material={buildingMaterials[b.matIndex]}
          >
            <boxGeometry />
          </mesh>
          {b.hasWindows && (
            <group
              position={[
                b.position[0],
                b.position[1],
                b.position[2] + (b.scale[2] / 2 + 0.06),
              ]}
            >
              {Array.from({ length: b.windowCount }, (_, yi) => (
                <mesh
                  position={[0, yi - b.scale[1] / 2 + 0.6, 0]}
                  key={'w' + yi}
                  material={b.windowMask[yi] ? windowLitMat : windowOffMat}
                >
                  <planeGeometry args={[b.scale[0] * 0.78, 0.22]} />
                </mesh>
              ))}
            </group>
          )}
        </group>
      ))}
    </group>
  );
}

function Ground() {
  return (
    <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[150, 150]} />
      <meshStandardMaterial color='#242a2f' />
    </mesh>
  );
}

function Street() {
  return (
    <>
      <mesh
        receiveShadow
        position={[0, 0.03, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[12, 150]} />
        <meshStandardMaterial color='#111319' />
      </mesh>
      <mesh
        receiveShadow
        position={[0, 0.04, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[150, 12]} />
        <meshStandardMaterial color='#22232c' />
      </mesh>
    </>
  );
}

function CityLights() {
  const { camera } = useThree();
  // Refs to all lamp point lights
  const lampRefs = useRef<THREE.PointLight[]>([]);
  // Lamp positions should match render order
  const lampPositions: [number, number, number][] = [];
  for (let dx = -60; dx <= 60; dx += 13) {
    for (let dz = -60; dz <= 60; dz += 44) {
      ['x', 'z'].forEach((axis) => {
        let pos: [number, number, number];
        if (axis === 'x') pos = [dx, 2.3, dz + 6];
        else pos = [dz + 6, 2.3, dx];
        lampPositions.push(pos);
      });
    }
  }

  // Reset refs every render (stale after scene graph renders)
  lampRefs.current = [];

  // Dynamic update: Enable shadows only for 4 closest lamps
  useFrame(() => {
    // flat list of [distance,curr-ref] for valid refs only
    const lamps = lampRefs.current.filter(Boolean);
    const camPos = camera.position;
    // Get distance to camera for each lamp
    const lampsWithDist = lamps.map((l, idx) => ({
      l,
      distSqr:
        (l.position.x - camPos.x) ** 2 +
        (l.position.y - camPos.y) ** 2 +
        (l.position.z - camPos.z) ** 2,
      idx,
    }));
    // Sort by distance
    lampsWithDist.sort((a, b) => a.distSqr - b.distSqr);
    // Set all to no shadow
    lamps.forEach((l) => (l.castShadow = false));
    // Top 4 nearest: shadow ON
    lampsWithDist.slice(0, 4).forEach(({ l }) => (l.castShadow = true));
  });

  return (
    <group>
      {lampPositions.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh position={[0, -1.0, 0]}>
            <cylinderGeometry args={[0.17, 0.21, 4.8, 8]} />
            <meshStandardMaterial color='#555a61' />
          </mesh>
          <mesh position={[0, 1.47, 0]}>
            <sphereGeometry args={[0.35, 15, 12]} />
            <meshStandardMaterial
              emissive='#ffee8a'
              emissiveIntensity={3.5}
              color='#dcc962'
            />
          </mesh>
          <pointLight
            ref={(el) => el && (lampRefs.current[i] = el)}
            position={[0, 1.55, 0]}
            intensity={2.5}
            color='#ffe16e'
            decay={2}
            distance={13}
            castShadow={false}
            shadow-mapSize-width={256}
            shadow-mapSize-height={256}
          />
        </group>
      ))}
    </group>
  );
}

function PlayerControls({ enabled = true }: { enabled?: boolean }) {
  const { camera, gl } = useThree();
  const [isPointerLocked, setPointerLocked] = useState(false);
  const movement = useRef({
    forward: false,
    back: false,
    left: false,
    right: false,
  });
  const speed = 0.16;
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (!enabled) return;
      const down = e.type === 'keydown';
      switch (e.code) {
        case 'KeyW':
          movement.current.forward = down;
          break;
        case 'KeyS':
          movement.current.back = down;
          break;
        case 'KeyA':
          movement.current.left = down;
          break;
        case 'KeyD':
          movement.current.right = down;
          break;
      }
    }
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
    };
  }, [enabled]);
  useEffect(() => {
    const dom = gl.domElement;
    function onClick() {
      if (!isPointerLocked) dom.requestPointerLock();
    }
    const handlePointerLockChange = () =>
      setPointerLocked(document.pointerLockElement === dom);
    dom.addEventListener('click', onClick);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => {
      dom.removeEventListener('click', onClick);
      document.removeEventListener(
        'pointerlockchange',
        handlePointerLockChange
      );
    };
  }, [gl, isPointerLocked]);
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isPointerLocked) return;
      const eAny = e as MouseEvent & { [key: string]: unknown };
      const dx =
        e.movementX ||
        (typeof eAny.mozMovementX === 'number'
          ? (eAny.mozMovementX as number)
          : 0) ||
        (typeof eAny.webkitMovementX === 'number'
          ? (eAny.webkitMovementX as number)
          : 0) ||
        0;
      const dy =
        e.movementY ||
        (typeof eAny.mozMovementY === 'number'
          ? (eAny.mozMovementY as number)
          : 0) ||
        (typeof eAny.webkitMovementY === 'number'
          ? (eAny.webkitMovementY as number)
          : 0) ||
        0;
      camera.rotation.order = 'YXZ';
      camera.rotation.y -= dx * 0.0023;
      camera.rotation.x -= dy * 0.0015;
      camera.rotation.x = Math.max(
        -Math.PI / 2 + 0.15,
        Math.min(Math.PI / 2 - 0.15, camera.rotation.x)
      );
    }
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [camera, isPointerLocked]);
  useFrame(() => {
    if (!isPointerLocked) return;
    let dirX = 0,
      dirZ = 0;
    if (movement.current.forward) dirZ += 1;
    if (movement.current.back) dirZ -= 1;
    if (movement.current.left) dirX -= 1;
    if (movement.current.right) dirX += 1;
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3()
      .crossVectors(forward, camera.up)
      .normalize();
    const move = forward
      .multiplyScalar(dirZ * speed)
      .add(right.multiplyScalar(dirX * speed));
    camera.position.add(move);
    camera.position.y = 1.7;
  });
  useEffect(() => {
    camera.position.set(0, 1.7, 8);
    camera.rotation.set(0, Math.PI, 0);
  }, [camera]);
  return null;
}

function CityScene() {
  return (
    <>
      {/* Night ambient bluish-dim */}
      <ambientLight intensity={0.14} color='#2d3b4b' />
      {/* Moon/sky direction subtle */}
      <directionalLight
        castShadow
        position={[13, 21, 10]}
        intensity={0.65}
        color='#a3caff'
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <CityLights />
      <Buildings />
      <Ground />
      <Street />
      <PlayerControls />
    </>
  );
}

export default function CityscapeDemoPage() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#141d26',
        position: 'relative',
      }}
    >
      <Suspense
        fallback={<div style={{ color: 'white' }}>Loading scene...</div>}
      >
        <Canvas shadows camera={{ position: [0, 1.7, 8], fov: 74 }}>
          <CityScene />
        </Canvas>
      </Suspense>
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 20,
          color: 'white',
          fontSize: 19,
          zIndex: 10,
          background: 'rgba(0,0,0,0.36)',
          padding: '17px 22px',
          borderRadius: 8,
          maxWidth: 380,
        }}
      >
        <b style={{ color: '#fffbe5', textShadow: '0 2px 12px #ffe77a62' }}>
          3D Cityscape: Night Walk Demo
        </b>
        <br />
        <span style={{ fontSize: '0.9em', color: '#c8e2fa' }}>
          WASD to move, mouse to look (click to capture mouse)
          <br />
          ESC = Release mouse
        </span>
      </div>
    </div>
  );
}
