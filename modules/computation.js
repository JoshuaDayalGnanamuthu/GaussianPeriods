import { evaluate } from 'https://cdn.jsdelivr.net/npm/mathjs@13.2.0/+esm';
import { gcd, modInverse, countDistinctPoints } from './math-utils.js';
import { buildPalette } from './color-utils.js';
import { computeAsync } from './worker-manager.js';
import { updateUrl, updateColorFilterOptions, getSelectedColors as urlGetSelectedColors } from './url-state.js';

export function validateInput(n, w, c, statusText) {
  if (!Number.isInteger(n) || !Number.isInteger(w) || !Number.isInteger(c)) {
    statusText.textContent = 'n, w, and colors must be integers.';
    return false;
  }

  if (n < 2 || w < 1 || c < 1) {
    statusText.textContent = 'Use n >= 2, w >= 1, and colors >= 1.';
    return false;
  }

  if (gcd(n, w) !== 1) {
    statusText.textContent =
      `n and w must be coprime. gcd(${n}, ${w}) = ${gcd(n, w)}.`;
    return false;
  }

  if (n % c !== 0) {
    statusText.textContent =
      `To match the paper's residue-class coloring, colors must divide n. ` +
      `${c} does not divide ${n}.`;
    return false;
  }

  if (c === n) {
    statusText.textContent =
      `Use a proper divisor of n for the paper's coloring rule; colors must be less than n.`;
    return false;
  }

  return true;
}

export function validateRecolorInput(newC, n, statusText) {
  if (!Number.isInteger(newC) || newC < 1) {
    statusText.textContent = 'The color modulus must be a positive integer.';
    return false;
  }

  if (n % newC !== 0) {
    statusText.textContent =
      `For the paper's coloring, the color modulus must divide n. ` +
      `${newC} does not divide ${n}.`;
    return false;
  }

  if (newC >= n) {
    statusText.textContent =
      `The color modulus must be a proper divisor of ${n}.`;
    return false;
  }

  return true;
}

export function computePlot(n, w, c, state, colorFilter, statusText, buildStatusTextFn, saveStateFn, requestDraw, updateUrlFn) {
  const t0 = performance.now();
  statusText.textContent = 'Computing...';

  computeAsync(n, w, ({ reals, imags, residues, order }) => {
    const computeTime = performance.now() - t0;
    const pts = Array.from({ length: n }, (_, k) => ({
      k,
      real: reals[k],
      imag: imags[k]
    }));

    state.colorCount = c;
    state.points = pts;
    const colorPalette = buildPalette(c);

    updateColorFilterOptions(colorFilter, c);

    const newState = {
      n, w, c,
      points: pts,
      residues,
      order,
      distinctCount: countDistinctPoints(pts),
      gcdOmegaN: gcd(n, w),
      gcdOmegaMinusOne: gcd(w - 1, n),
      gcdColorsN: gcd(c, n),
      gcdColorsOrder: gcd(c, order),
      omegaInverse: modInverse(w, n),
      computeTime,
      selectedColors: urlGetSelectedColors(colorFilter)
    };

    saveStateFn(newState);
    updateUrlFn(n, w, c);
    statusText.textContent = buildStatusTextFn(newState);
    requestDraw();

    return colorPalette;
  });
}
