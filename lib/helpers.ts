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
