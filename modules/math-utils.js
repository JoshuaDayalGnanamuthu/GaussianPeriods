export function gcd(a, b) {
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

export function modInverse(w, n) {
  let [oldR, r, oldS, s] = [w, n, 1, 0];
  while (r) {
    const q = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }
  return oldR === 1 ? ((oldS % n) + n) % n : null;
}

export function countDistinctPoints(pts, precision = 6) {
  const seen = new Set();
  for (const p of pts) {
    seen.add(`${p.real.toFixed(precision)},${p.imag.toFixed(precision)}`);
  }
  return seen.size;
}
