const NOISE_FLOOR_DB = -50;
const FULL_SCALE_DB = -10;
const ATTACK_RATE = 0.7;
const RELEASE_RATE = 0.25;

export function computeRms(samples: Float32Array): number {
  let sumOfSquares = 0;
  for (let i = 0; i < samples.length; i++) {
    sumOfSquares += samples[i] * samples[i];
  }
  return Math.sqrt(sumOfSquares / samples.length);
}

export function rmsToLevel(rms: number): number {
  const decibels = 20 * Math.log10(Math.max(rms, 1e-7));
  const normalized = (decibels - NOISE_FLOOR_DB) / (FULL_SCALE_DB - NOISE_FLOOR_DB);
  return Math.min(1, Math.max(0, normalized));
}

export function smoothLevel(current: number, target: number): number {
  const rate = target > current ? ATTACK_RATE : RELEASE_RATE;
  return current + (target - current) * rate;
}
