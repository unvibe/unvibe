// Shared types and constants for Traffic Racer
export const LANES = [-0.9, 0, 0.9];
export const PLAYER_Z = 2;

export type TrafficCarType = {
  x: number;
  z: number;
  id: number;
  passed?: boolean;
};
