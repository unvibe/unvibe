// Maps a value from one range to another
// Example: mapRange(5, 0, 10, 0, 100) === 50
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  if (inMin === inMax) {
    throw new Error('Input range cannot be zero');
  }
  const proportion = (value - inMin) / (inMax - inMin);
  return outMin + proportion * (outMax - outMin);
}
