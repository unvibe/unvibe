// Utility functions for Traffic Racer
export function checkCollision(
  playerX: number,
  playerZ: number,
  aiX: number,
  aiZ: number
) {
  const dx = Math.abs(playerX - aiX);
  const dz = Math.abs(playerZ - aiZ);
  return dx < 0.5 && dz < 1;
}
