import { evaluate } from "https://cdn.jsdelivr.net/npm/mathjs@13.2.0/+esm";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const tooltip = document.getElementById("tooltip");

const nInput = document.getElementById("nInput");
const wInput = document.getElementById("wInput");
const cInput = document.getElementById("cInput");
const colorFilter = document.getElementById("colorFilter");
const plotButton = document.getElementById("plotButton");
const statusText = document.getElementById("status");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");

let history = [];
let currentHistoryIndex = -1;
let points = [];
let colorCount = 3;

let zoomFactor = 1;
let panX = 0;
let panY = 0;

let canvasW = 0;
let canvasH = 0;
let dpr = 1;

let rafPending = false;
function requestDraw() {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => {
    rafPending = false;
    draw();
  });
}


function downloadImage() {
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gaussian-period-n${currentState.n}-w${currentState.w}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

const HOVER_CELL = 10;
let hoverGrid = new Map();

function clearHoverGrid() { hoverGrid = new Map(); }

function addHoverPoint(sx, sy, point) {
  const key = `${(sx / HOVER_CELL) | 0},${(sy / HOVER_CELL) | 0}`;
  let bucket = hoverGrid.get(key);
  if (!bucket) { bucket = []; hoverGrid.set(key, bucket); }
  bucket.push({ sx, sy, k: point.k, color: point.k % colorCount,
                real: point.real, imag: point.imag });
}

function findNearestHoverPoint(mouseX, mouseY) {
  const cx = (mouseX / HOVER_CELL) | 0;
  const cy = (mouseY / HOVER_CELL) | 0;
  let best = null, bestDist = Infinity;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const bucket = hoverGrid.get(`${cx + dx},${cy + dy}`);
      if (!bucket) continue;
      for (const p of bucket) {
        const d = Math.hypot(mouseX - p.sx, mouseY - p.sy);
        if (d < bestDist) { bestDist = d; best = p; }
      }
    }
  }
  const radius = points.length > 8000 ? 5 : 10;
  return bestDist <= radius ? best : null;
}

function gcd(a, b) {
  while (b) { const t = b; b = a % b; a = t; }
  return a;
}

function modInverse(w, n) {
  let [oldR, r, oldS, s] = [w, n, 1, 0];
  while (r) {
    const q = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }
  return oldR === 1 ? ((oldS % n) + n) % n : null;
}

const colorCache = new Map();

function hsvToRgb(h, s, v) {
  const key = `${h},${s},${v}`;
  if (colorCache.has(key)) return colorCache.get(key);
  const c = v * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if      (h < 60)  [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else              [r, g, b] = [c, 0, x];
  const rgb = `rgb(${(r + m) * 255 | 0},${(g + m) * 255 | 0},${(b + m) * 255 | 0})`;
  colorCache.set(key, rgb);
  return rgb;
}

let colorPalette = [];

function buildPalette() {
  colorPalette = [];
  for (let i = 0; i < colorCount; i++) {
    colorPalette.push(hsvToRgb((360 * i) / colorCount, 0.9, 1.0));
  }
}

function computeGaussianPeriodPoints(n, w) {
  w %= n;
  const residues = [];
  let res = 1;
  do { residues.push(res); res = (res * w) % n; } while (res !== 1);

  const cosA = new Float64Array(n);
  const sinA = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const angle = 2 * Math.PI * i / n;
    cosA[i] = Math.cos(angle);
    sinA[i] = Math.sin(angle);
  }

  const output = new Array(n);
  for (let k = 0; k < n; k++) {
    let real = 0, imag = 0;
    for (const r of residues) {
      const idx = (k * r) % n;
      real += cosA[idx];
      imag += sinA[idx];
    }
    output[k] = { k, real, imag };
  }
  return { points: output, residues, order: residues.length };
}

function countDistinctPoints(pts, precision = 6) {
  const seen = new Set();
  for (const p of pts) seen.add(`${p.real.toFixed(precision)},${p.imag.toFixed(precision)}`);
  return seen.size;
}

function getParamsFromUrl() {
  const p = new URLSearchParams(window.location.search);
  return { n: p.get("n") ?? "12", w: p.get("w") ?? "7", c: p.get("c") ?? "3" };
}

function updateUrl(n, w, c, replace = false) {
  const url = new URL(window.location.href);
  url.searchParams.set("n", n);
  url.searchParams.set("w", w);
  url.searchParams.set("c", c);
  const state = { n, w, c };
  if (replace) {
    window.history.replaceState(state, "", url);
  }
  else {
    window.history.pushState(state, "", url);
  }
}

function loadParamsFromUrl() {
  const { n, w, c } = getParamsFromUrl();
  nInput.value = n; wInput.value = w; cInput.value = c;
}

function updateHistoryButtons() {
  prevButton.disabled = currentHistoryIndex <= 0;
  nextButton.disabled = currentHistoryIndex >= history.length - 1;
}

function buildStatusText(state) {
  return [
    `time: ${state.computeTime.toFixed(2)} ms`,
    `N: ${state.n}`,
    `omega: ${state.w}`,
    `colors: ${state.c}`,
    `ord_N(omega): ${state.order}`,
    `roots per point: ${state.order}`,
    `distinct visible: ${state.distinctCount} / ${state.n}`,
    `gcd(N, omega): ${state.gcdOmegaN}`,
    `gcd(N, omega - 1): ${state.gcdOmegaMinusOne}`,
    `gcd(colors, N): ${state.gcdColorsN}`,
    `gcd(colors, ord_N(omega)): ${state.gcdColorsOrder}`,
    `omega inverse mod N: ${state.omegaInverse}`,
    `history: ${currentHistoryIndex + 1} / ${history.length}`
  ].join("\n");
}

function loadState(index) {
  if (index < 0 || index >= history.length) return;
  currentHistoryIndex = index;
  const state = history[index];
  points = state.points;
  colorCount = state.c;
  buildPalette();
  nInput.value = state.n; wInput.value = state.w; cInput.value = state.c;
  updateColorFilterOptions(state.c, state.selectedColors);
  statusText.textContent = buildStatusText(state);
  requestDraw();
  updateHistoryButtons();
}

function saveState(state) {
  history = history.slice(0, currentHistoryIndex + 1);
  history.push(state);
  currentHistoryIndex = history.length - 1;
  updateHistoryButtons();
}

function updateColorFilterOptions(c, selectedColors = null) {
  colorFilter.innerHTML = "";
  for (let i = 0; i < c; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `Color ${i}`;
    opt.selected = selectedColors === null || selectedColors.includes(i);
    colorFilter.appendChild(opt);
  }
}

function getSelectedColors() {
  return Array.from(colorFilter.selectedOptions).map(o => Number(o.value));
}

function syncCanvasSize() {
  const rect = canvas.getBoundingClientRect();
  const newDpr = window.devicePixelRatio || 1;
  const newW = Math.floor(rect.width * newDpr);
  const newH = Math.floor(rect.height * newDpr);
  if (newW === canvas.width && newH === canvas.height && newDpr === dpr) return false;
  canvas.width  = newW;
  canvas.height = newH;
  dpr = newDpr;
  canvasW = rect.width;
  canvasH = rect.height;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return true;
}

function draw() {
  syncCanvasSize();

  const width   = canvasW;
  const height  = canvasH;
  const centerX = width  / 2;
  const centerY = height / 2;

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

  clearHoverGrid();
  ctx.save();
  ctx.translate(panX, panY);

  const visL = (0 - panX) / zoomFactor;
  const visR = (width - panX) / zoomFactor;
  const visT = (0 - panY) / zoomFactor;
  const visB = (height - panY) / zoomFactor;

  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 1 / zoomFactor;
  ctx.beginPath();
  ctx.moveTo(visL, centerY); 
  ctx.lineTo(visR, centerY);
  ctx.moveTo(centerX, visT); 
  ctx.lineTo(centerX, visB);
  ctx.stroke();

  if (points.length === 0) { 
    ctx.restore(); return; 
  }

  let maxAbs = 0;
  for (const p of points) {
    const a = Math.hypot(p.real, p.imag);
    if (a > maxAbs) maxAbs = a;
  }
  if (maxAbs === 0) maxAbs = 1;

  const scale  = 0.42 * Math.min(width, height) / maxAbs;
  const radius = Math.max(1, Math.min(8, scale / 25));
  const bigData = points.length > 8000;

  const selectedSet = new Set(getSelectedColors());
  const showAll = selectedSet.size === 0;

  if (!bigData) {
    const r   = radius / zoomFactor;
    const TAU = 2 * Math.PI;
    let lastCol = -1;
    for (const p of points) {
      const col = p.k % colorCount;
      if (!showAll && !selectedSet.has(col)) continue;
      const wx = centerX + p.real * scale;
      const wy = centerY - p.imag * scale;
      if (col !== lastCol) { ctx.fillStyle = colorPalette[col]; lastCol = col; }
      ctx.beginPath();
      ctx.arc(wx, wy, r, 0, TAU);
      ctx.fill();
      addHoverPoint(wx * zoomFactor + panX, wy * zoomFactor + panY, p);
    }
  } else {
    const pxSize = 1 / zoomFactor;
    let lastCol = -1;
    for (const p of points) {
      const col = p.k % colorCount;
      if (!showAll && !selectedSet.has(col)) continue;
      const wx = centerX + p.real * scale;
      const wy = centerY - p.imag * scale;
      if (col !== lastCol) { ctx.fillStyle = colorPalette[col]; lastCol = col; }
      ctx.fillRect(wx, wy, pxSize, pxSize);
      addHoverPoint(wx * zoomFactor + panX, wy * zoomFactor + panY, p);
    }
  }

  ctx.restore();
}

const MIN_ZOOM = 0.05;
const MAX_ZOOM = 200;

function zoomAt(mouseX, mouseY, newZoom) {
  newZoom = Math.max(MIN_ZOOM, Math.min(newZoom, MAX_ZOOM));
  const worldX = (mouseX - panX) / zoomFactor;
  const worldY = (mouseY - panY) / zoomFactor;
  zoomFactor = newZoom;
  panX = mouseX - worldX * newZoom;
  panY = mouseY - worldY * newZoom;
}

function plot({ updateBrowserHistory = true } = {}) {
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
    statusText.textContent =
      `n and w must be coprime. gcd(${n}, ${w}) = ${gcd(n, w)}.`;
    return;
  }

  colorCount = c;
  buildPalette();

  const t0 = performance.now();
  const result = computeGaussianPeriodPoints(n, w);
  const computeTime = performance.now() - t0;

  updateColorFilterOptions(c);
  points = result.points;

  const state = {
    n, w, c,
    points: result.points,
    residues: result.residues,
    order: result.order,
    distinctCount: countDistinctPoints(result.points),
    gcdOmegaN: gcd(n, w),
    gcdOmegaMinusOne: gcd(w - 1, n),
    gcdColorsN: gcd(c, result.order), 
    gcdColorsOrder: gcd(c, result.order),
    omegaInverse: modInverse(w, n),
    computeTime,
    selectedColors: getSelectedColors()
  };

  state.gcdColorsN = gcd(c, n);

  saveState(state);
  if (updateBrowserHistory) updateUrl(n, w, c);
  statusText.textContent = buildStatusText(state);
  requestDraw();
}

function recolorCurrentPlot() {
  if (points.length === 0 || currentHistoryIndex < 0) return;
  const raw = cInput.value.trim();
  if (!raw) return;
  const newC = evaluate(raw);
  if (!Number.isInteger(newC) || newC < 1) return;

  colorCount = newC;
  buildPalette();

  const state = history[currentHistoryIndex];
  state.c              = newC;
  state.gcdColorsN     = gcd(newC, state.n);
  state.gcdColorsOrder = gcd(newC, state.order);

  updateColorFilterOptions(newC);
  state.selectedColors = getSelectedColors();
  updateUrl(state.n, state.w, newC, true);
  statusText.textContent = buildStatusText(state);
  requestDraw();
}

plotButton.addEventListener("click", plot);

document.addEventListener("keydown", e => {
  if (e.key !== "Enter") return;
  if (document.activeElement === colorFilter) return;
  e.preventDefault();
  plot();
});

let recolorTimer = null;
cInput.addEventListener("input", () => {
  clearTimeout(recolorTimer);
  recolorTimer = setTimeout(recolorCurrentPlot, 300);
});

prevButton.addEventListener("click", () => loadState(currentHistoryIndex - 1));
nextButton.addEventListener("click", () => loadState(currentHistoryIndex + 1));

colorFilter.addEventListener("change", () => {
  if (currentHistoryIndex >= 0)
    history[currentHistoryIndex].selectedColors = getSelectedColors();
  requestDraw();
});

canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const nearest = findNearestHoverPoint(mx, my);
  if (!nearest) { tooltip.style.display = "none"; return; }
  tooltip.style.display = "block";
  tooltip.style.left    = `${mx + 12}px`;
  tooltip.style.top     = `${my + 12}px`;
  tooltip.textContent   =
    `k = ${nearest.k}\ncolor = ${nearest.color}\n` +
    `Re ≈ ${nearest.real.toFixed(5)}\nIm ≈ ${nearest.imag.toFixed(5)}`;
});

canvas.addEventListener("mouseleave", () => { tooltip.style.display = "none"; });

window.addEventListener("resize", () => {
  syncCanvasSize();
  requestDraw();
});

window.addEventListener("popstate", () => {
  loadParamsFromUrl();
  plot({ updateBrowserHistory: false });
});

let pendingWheelMX = 0;
let pendingWheelMY = 0;
let pendingWheelDelta = 0;
let wheelRafPending = false;

function flushWheel() {
  wheelRafPending = false;
  if (pendingWheelDelta === 0) return;
  const factor = Math.exp(-pendingWheelDelta * 0.001);
  zoomAt(pendingWheelMX, pendingWheelMY, zoomFactor * factor);
  pendingWheelDelta = 0;
  draw();
}

canvas.addEventListener("wheel", e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  pendingWheelMX = e.clientX - rect.left;
  pendingWheelMY = e.clientY - rect.top;
  const lineH = 16;
  const pageH = canvasH || 600;
  const raw =
    e.deltaMode === 2 ? e.deltaY * pageH :
    e.deltaMode === 1 ? e.deltaY * lineH :
    e.deltaY;
  pendingWheelDelta += raw;
  if (!wheelRafPending) {
    wheelRafPending = true;
    requestAnimationFrame(flushWheel);
  }
}, { passive: false });

canvas.addEventListener("dblclick", () => {
  zoomFactor = 1; panX = 0; panY = 0;
  requestDraw();
});

canvas.addEventListener("contextmenu", e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  zoomAt(e.clientX - rect.left, e.clientY - rect.top, zoomFactor / 1.2);
  requestDraw();
});

let lastPinchDist = null;
let lastPinchMX = 0;
let lastPinchMY = 0;

canvas.addEventListener("touchstart", e => {
  if (e.touches.length === 2) {
    e.preventDefault();
    const t0 = e.touches[0], t1 = e.touches[1];
    lastPinchDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
    const rect = canvas.getBoundingClientRect();
    lastPinchMX = ((t0.clientX + t1.clientX) / 2) - rect.left;
    lastPinchMY = ((t0.clientY + t1.clientY) / 2) - rect.top;
  }
}, { passive: false });

canvas.addEventListener("touchmove", e => {
  if (e.touches.length === 2 && lastPinchDist !== null) {
    e.preventDefault();
    const t0 = e.touches[0], t1 = e.touches[1];
    const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
    const ratio = dist / lastPinchDist;
    lastPinchDist = dist;
    const rect = canvas.getBoundingClientRect();
    lastPinchMX = ((t0.clientX + t1.clientX) / 2) - rect.left;
    lastPinchMY = ((t0.clientY + t1.clientY) / 2) - rect.top;
    zoomAt(lastPinchMX, lastPinchMY, zoomFactor * ratio);
    requestDraw();
  }
}, { passive: false });

canvas.addEventListener("touchend", () => { lastPinchDist = null; });

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragPanX = 0;
let dragPanY = 0;

canvas.addEventListener("mousedown", e => {
  if (e.button !== 0) return;
  isDragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  dragPanX = panX;
  dragPanY = panY;
  canvas.style.cursor = "grabbing";
});

window.addEventListener("mousemove", e => {
  if (!isDragging) return;
  panX = dragPanX + (e.clientX - dragStartX);
  panY = dragPanY + (e.clientY - dragStartY);
  requestDraw();
});

window.addEventListener("mouseup", () => {
  if (!isDragging) return;
  isDragging = false;
  canvas.style.cursor = "";
});

document.getElementById("downloadButton").addEventListener("click", downloadImage);

loadParamsFromUrl();
syncCanvasSize();
plot({ updateBrowserHistory: false });

const initialN = evaluate(nInput.value);
const initialW = evaluate(wInput.value);
const initialC = evaluate(cInput.value);
updateUrl(initialN, initialW, initialC, true);
updateHistoryButtons();