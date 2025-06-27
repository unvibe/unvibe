import React, {
  useState,
  useEffect,
  useRef,
  Suspense,
  useCallback,
} from 'react';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { LANES, TrafficCarType } from './types';
import { GameScene } from './GameScene';

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function spring(
  current: number,
  target: number,
  velocity: number,
  stiffness: number,
  damping: number
): [number, number] {
  const force = -stiffness * (current - target);
  const damp = -damping * velocity;
  const accel = force + damp;
  const newVelocity = velocity + accel;
  const newPos = current + newVelocity;
  return [newPos, newVelocity];
}

type GameState = 'menu' | 'playing' | 'gameover';

export default function TrafficRacerDemoPage() {
  const [carX, setCarX] = useState(0);
  const [targetX, setTargetX] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>('menu');
  const [traffic, setTraffic] = useState<TrafficCarType[]>([]);
  const trafficId = useRef(0);
  const [playerSpeed, setPlayerSpeed] = useState(0.08);
  const [playerForwardVelocity, setPlayerForwardVelocity] = useState(0.0);
  const maxSpeed = 0.23;
  const accelRate = 0.0003;
  const friction = 0.00008;
  const spawnCooldown = useRef(0);
  const leftBound = -1.2;
  const rightBound = 1.2;
  const [carRotation, setCarRotation] = useState(0);
  const [carRotationVelocity, setCarRotationVelocity] = useState(0);
  const [targetRotation, setTargetRotation] = useState(0);
  const [carRoll, setCarRoll] = useState(0);
  const [carRollVelocity, setCarRollVelocity] = useState(0);
  const [targetRoll, setTargetRoll] = useState(0);
  const prevCarXRef = useRef(carX);

  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setCarX(0);
    setTargetX(0);
    setCarRotation(0);
    setCarRotationVelocity(0);
    setTargetRotation(0);
    setCarRoll(0);
    setCarRollVelocity(0);
    setTargetRoll(0);
    setTraffic([]);
    trafficId.current = 0;
    spawnCooldown.current = 0;
    setPlayerSpeed(0.08);
    setPlayerForwardVelocity(0.0);
    prevCarXRef.current = 0;
  }, []);

  const setGameOver = useCallback(
    (v: boolean) => {
      if (v && gameState !== 'gameover') {
        setGameState('gameover');
      }
    },
    [gameState]
  );

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (gameState === 'gameover') {
        if (e.key === 'r') {
          startGame();
        }
        return;
      }
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowLeft') {
        setTargetX((x) => Math.max(leftBound, x - 0.9));
      } else if (e.key === 'ArrowRight') {
        setTargetX((x) => Math.min(rightBound, x + 0.9));
      }
    },
    [leftBound, rightBound, gameState, startGame]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    let raf: number;
    function animate() {
      setCarX((prev) => {
        const eased = lerp(prev, targetX, 0.13);
        const dx = eased - prev;
        const maxRoll = 0.3;
        const roll = Math.max(-maxRoll, Math.min(maxRoll, -dx * 2.5));
        setTargetRoll(roll);
        const maxRotation = Math.PI / 8;
        const steer = targetX - eased;
        setTargetRotation(steer * maxRotation);
        prevCarXRef.current = eased;
        return Math.abs(eased - targetX) < 0.01 ? targetX : eased;
      });
      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [targetX, gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    let raf: number;
    function animate() {
      setCarRotation((curr) => {
        const v = carRotationVelocity;
        const [newR, newV] = spring(curr, targetRotation, v, 0.12, 0.1);
        setCarRotationVelocity(newV);
        return Math.abs(newR - targetRotation) < 0.001 ? targetRotation : newR;
      });
      setCarRoll((curr) => {
        const v = carRollVelocity;
        const [newRoll, newV] = spring(curr, targetRoll, v, 0.17, 0.13);
        setCarRollVelocity(newV);
        return Math.abs(newRoll - targetRoll) < 0.001 ? targetRoll : newRoll;
      });
      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [
    targetRotation,
    carRotationVelocity,
    targetRoll,
    carRollVelocity,
    gameState,
  ]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    let raf: number;
    function step() {
      setPlayerForwardVelocity((vel) => {
        let nextVel = vel + accelRate;
        if (nextVel > maxSpeed) nextVel = maxSpeed;
        if (nextVel > playerSpeed) {
          nextVel -= friction;
        }
        return nextVel < 0.08 ? 0.08 : nextVel;
      });
      setPlayerSpeed((curr) => lerp(curr, playerForwardVelocity, 0.06));
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [gameState, accelRate, friction, playerForwardVelocity]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    let raf: number;
    function gameLoop() {
      setTraffic((prev) =>
        prev
          .map((car) => ({ ...car, z: car.z + playerSpeed }))
          .filter((car) => car.z < 6)
      );
      if (spawnCooldown.current <= 0) {
        const lane = LANES[Math.floor(Math.random() * LANES.length)];
        setTraffic((prev) => [
          ...prev,
          { x: lane, z: -6, id: trafficId.current++ },
        ]);
        spawnCooldown.current = 45 + Math.random() * 35;
      } else {
        spawnCooldown.current -= 1;
      }
      raf = requestAnimationFrame(gameLoop);
    }
    raf = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(raf);
  }, [gameState, playerSpeed]);

  function increaseScore(delta = 1) {
    setScore((s) => s + delta);
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a20' }}>
      <Suspense fallback={<div>Loading 3D scene...</div>}>
        <Canvas shadows camera={{ position: [0, 3, 5], fov: 60 }}>
          <GameScene
            carX={carX}
            carRotation={carRotation}
            carRoll={carRoll}
            traffic={traffic}
            setGameOver={setGameOver}
            gameOver={gameState === 'gameover'}
            increaseScore={increaseScore}
            playerSpeed={playerSpeed}
            onRestart={startGame}
          />
          {gameState === 'menu' && (
            <Html center>
              <div
                style={{
                  background: 'rgba(20,20,20,0.94)',
                  borderRadius: 18,
                  padding: '2.5em 2.5em 2em 2.5em',
                  textAlign: 'center',
                  minWidth: 340,
                  maxWidth: 400,
                  minHeight: 200,
                  color: 'white',
                  boxShadow: '0 4px 38px rgba(0,0,0,0.32)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'monospace, sans-serif',
                }}
              >
                <div
                  style={{
                    fontSize: '2.5em',
                    fontWeight: 900,
                    letterSpacing: 2,
                    color: '#ffc870',
                    marginBottom: 12,
                  }}
                >
                  TRAFFIC RACER
                </div>
                <div
                  style={{
                    fontSize: 18,
                    marginBottom: 30,
                    color: '#dadada',
                    letterSpacing: 1,
                  }}
                >
                  Dodge cars to survive, score points!
                  <br />
                  Use <kbd>←</kbd> <kbd>→</kbd> arrow keys to switch lanes.
                </div>
                <button
                  style={{
                    padding: '0.6em 2.6em',
                    marginTop: 12,
                    border: 'none',
                    borderRadius: 7,
                    fontWeight: 700,
                    fontSize: 26,
                    background:
                      'linear-gradient(90deg, #4ADEDE 0%, #9F65E6 100%)',
                    color: '#fff',
                    cursor: 'pointer',
                    letterSpacing: 1,
                    boxShadow: '0 2px 15px #9f65e633',
                    transition: 'filter 0.15s',
                  }}
                  onClick={startGame}
                >
                  ▶ Play
                </button>
              </div>
            </Html>
          )}
        </Canvas>
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            color: 'white',
            fontSize: 20,
            zIndex: 10,
          }}
        >
          <b>Traffic Racer Demo</b>
          <br />
          Score: {score}
          <br />
          <span style={{ fontSize: 14 }}>
            Speed: {(playerSpeed * 100).toFixed(0)}
          </span>
          {gameState === 'gameover' && (
            <>
              <br />
              <span style={{ color: 'red', fontWeight: 'bold' }}>
                Game Over!
              </span>
              <br />
              Press <kbd>R</kbd> to restart
            </>
          )}
          <br />
          Use <kbd>←</kbd> <kbd>→</kbd> arrow keys to move the car.
        </div>
      </Suspense>
    </div>
  );
}
