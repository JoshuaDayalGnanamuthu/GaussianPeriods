// Euclidean algorithm for greatest common divisor
export function gcd(a, b) {
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

// Extended Euclidean algorithm: finds modular inverse of w modulo n
export function modInverse(w, n) {
  let [oldR, r, oldS, s] = [w, n, 1, 0];
  while (r) {
    const q = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }
  return oldR === 1 ? ((oldS % n) + n) % n : null;
}

// Count unique points by rounding to precision decimal places
export function countDistinctPoints(pts, precision = 6) {
  const seen = new Set();
  for (const p of pts) {
    seen.add(`${p.real.toFixed(precision)},${p.imag.toFixed(precision)}`);
  }
  return seen.size;
}
