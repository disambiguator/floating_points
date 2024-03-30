import { Color } from 'three';

// min inclusive, max exclusive
export const rand = (a: number, b?: number) => {
  const [min, max] = b != null ? [a, b] : [0, a];
  return min + Math.random() * (max - min);
};

// min inclusive, max exclusive
export const randInt = (a: number, b?: number) => {
  return Math.floor(rand(a, b));
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

//  generate a palette of N colors that are similar
// to three random colors
export const generatePalette = (n: number) => {
  const palette = [];
  const baseColors = [
    new Color(Math.random(), Math.random(), Math.random()),
    new Color(Math.random(), Math.random(), Math.random()),
    new Color(Math.random(), Math.random(), Math.random()),
  ];

  for (let i = 0; i < n; i++) {
    const c = baseColors[i % baseColors.length].clone();
    c.offsetHSL(0, 0, (i / n) * 0.1);
    palette.push(c);
  }
  return palette;
};
