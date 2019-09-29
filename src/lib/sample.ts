export const sample = <T>(xs: T[], previous: T | null = null): T => {
  let next;

  while (!next || previous === next) {
    next = xs[Math.floor(Math.random() * xs.length)];
  }

  return next;
};
