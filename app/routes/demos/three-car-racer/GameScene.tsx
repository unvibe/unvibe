import React, { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Lane } from './Lane';
import { RoadLines } from './RoadLines';
import { PlayerCar } from './PlayerCar';
import { TrafficCar } from './TrafficCar';
import { PLAYER_Z, TrafficCarType } from './types';
import { checkCollision } from './utils';

export function GameScene({
  carX,
  carRotation,
  carRoll = 0,
  traffic,
  setGameOver,
  gameOver,
  increaseScore,
  playerSpeed = 0.08,
  onRestart,
}: {
  carX: number;
  carRotation: number;
  carRoll?: number;
  traffic: TrafficCarType[];
  setGameOver: (v: boolean) => void;
  gameOver: boolean;
  increaseScore: (delta?: number) => void;
  playerSpeed?: number;
  onRestart?: () => void;
}) {
  const [roadOffset, setRoadOffset] = useState(0);
  const [closeCall, setCloseCall] = useState(false);
  const closeCallCars = useRef<Set<number>>(new Set());
  const passedCars = useRef<Set<number>>(new Set());

  useFrame(() => {
    if (!gameOver) {
      setRoadOffset((o) => o + (playerSpeed || 0.08));
    }
  });

  useFrame(() => {
    if (gameOver) return;
    for (const ai of traffic) {
      if (checkCollision(carX, PLAYER_Z, ai.x, ai.z)) {
        setGameOver(true);
        break;
      }
      if (!closeCallCars.current.has(ai.id) && ai.z > PLAYER_Z) {
        const closeX = Math.abs(carX - ai.x) < 0.3;
        const closeZ = Math.abs(ai.z - PLAYER_Z) < 0.7;
        if (closeX && closeZ) {
          setCloseCall(true);
          increaseScore(100);
          closeCallCars.current.add(ai.id);
          setTimeout(() => setCloseCall(false), 800);
        }
      }
    }
  });

  useEffect(() => {
    if (gameOver) return;
    traffic.forEach((ai) => {
      if (
        !passedCars.current.has(ai.id) &&
        ai.z > PLAYER_Z &&
        Math.abs(carX - ai.x) >= 0.3
      ) {
        increaseScore();
        passedCars.current.add(ai.id);
      }
    });
  }, [traffic, gameOver]);

  useEffect(() => {
    if (!gameOver) {
      closeCallCars.current.clear();
      passedCars.current.clear();
    }
  }, [gameOver]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[2, 4, 2]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <Lane />
      <RoadLines roadOffset={roadOffset} />
      <PlayerCar carX={carX} carRotation={carRotation} carRoll={carRoll} />
      {traffic.map((car) => (
        <TrafficCar key={car.id} x={car.x} z={car.z} />
      ))}
      {closeCall && (
        <group position={[carX, 0.55, PLAYER_Z]}>
          <mesh>
            <planeGeometry args={[0.7, 0.15]} />
            <meshBasicMaterial color={'gold'} transparent opacity={0.85} />
          </mesh>
          <Html
            position={[0, 0, 0.01]}
            center
            style={{
              fontWeight: 'bold',
              color: '#222',
              fontSize: '1.3em',
              textAlign: 'center',
            }}
          >
            Close Call! +100
          </Html>
        </group>
      )}
      {gameOver && (
        <Html center>
          <div
            style={{
              background: 'rgba(20,20,20,0.96)',
              borderRadius: 18,
              padding: '2.8em 2.5em 2em 2.5em',
              textAlign: 'center',
              minWidth: 320,
              maxWidth: 400,
              minHeight: 180,
              color: 'white',
              boxShadow: '0 4px 36px rgba(0,0,0,0.33)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'monospace, sans-serif',
            }}
          >
            <div
              style={{
                fontSize: '2.4em',
                fontWeight: 900,
                letterSpacing: 2,
                marginBottom: 10,
                color: '#ff5252',
              }}
            >
              YOU LOST
            </div>
            <button
              style={{
                padding: '0.5em 2.2em',
                marginTop: 20,
                border: 'none',
                borderRadius: 7,
                fontWeight: 600,
                fontSize: 22,
                background: 'linear-gradient(90deg, #FFC371 0%, #FF5F6D 100%)',
                color: '#fff',
                cursor: 'pointer',
                letterSpacing: 1,
                boxShadow: '0 2px 12px #ff5f6d99',
                transition: 'filter 0.15s',
              }}
              onClick={onRestart}
            >
              ▶ Play Again
            </button>
          </div>
        </Html>
      )}
    </>
  );
}
