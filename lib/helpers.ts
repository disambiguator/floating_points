// min inclusive, max exclusive
export const rand = (a: number, b?: number) => {
  const min = b != null ? a : 0;
  const max = b ?? a;

  return min + Math.random() * (max - min);
};

// min inclusive, max exclusive
export const randInt = (a: number, b?: number) => {
  const min = b != null ? a : 0;
  const max = b ?? a;

  return min + Math.floor(Math.random()) * (max - min);
};

export function scaleExponential(
  v: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  // normalize value to range 0-1
  const normalized = (v - inMin) / (inMax - inMin);

  // apply exponential function and scale to output range
  const exponential =
    Math.exp(normalized * Math.log(outMax - outMin + 1)) - 1 + outMin;

  return exponential;
}
