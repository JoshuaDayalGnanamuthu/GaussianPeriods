import { evaluate } from "https://cdn.jsdelivr.net/npm/mathjs@13.2.0/+esm";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const nInput = document.getElementById("nInput");
const wInput = document.getElementById("wInput");
const cInput = document.getElementById("cInput");
const plotButton = document.getElementById("plotButton");
const statusText = document.getElementById("status");

let points = [];
let colorCount = 3;

function gcd(a, b) {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

function hsvToRgb(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return `rgb(${Math.round((r + m) * 255)}, ${Math.round((g + m) * 255)}, ${Math.round((b + m) * 255)})`;
}

function computeGaussianPeriodPoints(n, w, colorCount) {
  w %= n;

  const residues = [];
  let residue = 1;

  do {
    residues.push(residue);
    residue = (residue * w) % n;
  } while (residue !== 1);

  const roots = new Array(n);

  for (let i = 0; i < n; i++) {
    const angle = 2 * Math.PI * i / n;
    roots[i] = [Math.cos(angle), Math.sin(angle)];
  }

  const output = new Array(n);

  for (let k = 0; k < n; k++) {
    let real = 0;
    let imag = 0;

    for (const r of residues) {
      const index = (k * r) % n;
      real += roots[index][0];
      imag += roots[index][1];
    }

    output[k] = {
      real,
      imag,
      color: k % colorCount
    };
  }

  return {
    points: output,
    residues,
    order: residues.length
  };
}

function countDistinctPoints(points, precision = 6) {
  const seen = new Set();

  for (const p of points) {
    const key = `${p.real.toFixed(precision)},${p.imag.toFixed(precision)}`;
    seen.add(key);
  }

  return seen.size;
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function draw() {
  resizeCanvas();

  const width = canvas.getBoundingClientRect().width;
  const height = canvas.getBoundingClientRect().height;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = height / 2;

  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(width, centerY);
  ctx.moveTo(centerX, 0);
  ctx.lineTo(centerX, height);
  ctx.stroke();

  if (points.length === 0) return;

  let maxAbs = 0;

  for (const p of points) {
    const dist = Math.hypot(p.real, p.imag);
    maxAbs = Math.max(maxAbs, dist);
  }

  if (maxAbs === 0) maxAbs = 1;

  const scale = 0.42 * Math.min(width, height) / maxAbs;
  const radius = Math.max(1, Math.min(8, scale / 25));

  // For large n, draw 1px points for speed.
  if (points.length > 8000) {
    for (const p of points) {
      const x = centerX + p.real * scale;
      const y = centerY - p.imag * scale;
      const hue = (360 * p.color) / colorCount;

      ctx.fillStyle = hsvToRgb(hue, 0.9, 1.0);
      ctx.fillRect(x, y, 1, 1);
    }

    return;
  }

  for (const p of points) {
    const x = centerX + p.real * scale;
    const y = centerY - p.imag * scale;
    const hue = (360 * p.color) / colorCount;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = hsvToRgb(hue, 0.9, 1.0);
    ctx.fill();
  }
}

function plot() {
  const n = evaluate(nInput.value);
  const w = evaluate(wInput.value);
  const c = evaluate(cInput.value);

  if (!Number.isInteger(n) || !Number.isInteger(w) || !Number.isInteger(c)) {
    statusText.textContent = "n, w, and colors must be integers.";
    return;
  }

  if (n < 2 || w < 1 || c < 1) {
    statusText.textContent = "Use n >= 2, w >= 1, and colors >= 1.";
    return;
  }

  if (gcd(n, w) !== 1) {
    statusText.textContent = `n and w must be coprime. gcd(${n}, ${w}) = ${gcd(n, w)}.`;
    return;
  }

  colorCount = c;

  const start = performance.now();
  const result = computeGaussianPeriodPoints(n, w, c);
  points = result.points;
  const end = performance.now();

  const distinctCount = countDistinctPoints(points);
  const order = result.order;
  const gcdOmegaN = gcd(n, w);
  const gcdOmegaMinusOne = gcd(w - 1, n);
  const gcdColorsN = gcd(c, n);
  const gcdColorsOrder = gcd(c, order);

  statusText.textContent =
    `Plotted ${n} points in ${(end - start).toFixed(2)} ms.\n` +
    `ord_N(omega) = ${order}; each point sums ${order} roots of unity.\n` +
    `Distinct visible points ≈ ${distinctCount} out of ${n}.\n` +
    `gcd(N, omega) = ${gcdOmegaN}; gcd(N, omega - 1) = ${gcdOmegaMinusOne}.\n` +
    `gcd(colors, N) = ${gcdColorsN}; gcd(colors, ord_N(omega)) = ${gcdColorsOrder}.`;
  
  draw();
}

plotButton.addEventListener("click", plot);
window.addEventListener("resize", draw);

plot();
