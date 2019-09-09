export function sample(xs: any[], previous: any = null) {
  let next: any;

  while (!next || previous === next) {
    next = xs[Math.floor(Math.random() * xs.length)];
  }

  return next;
}
