// Main orchestration: imports modules and wires event flow
// Delegates computation to worker, rendering to canvas, and state to central store

import { evaluate } from 'https://cdn.jsdelivr.net/npm/mathjs@13.2.0/+esm';
import { state } from './modules/state.js';
import { gcd, modInverse, countDistinctPoints } from './modules/math-utils.js';
import { buildPalette, getColorClass } from './modules/color-utils.js';
import { zoomAt, resetViewport } from './modules/viewport.js';
import { draw, syncCanvasSize, getCanvasElement } from './modules/canvas-renderer.js';
import { getHoverPoint } from './modules/canvas-renderer.js';
import { computeAsync } from './modules/worker-manager.js';
import {
  getParamsFromUrl,
  updateUrl,
  loadParamsFromUrl,
  updateHistoryButtons,
  buildStatusText,
  updateColorFilterOptions,
  getSelectedColors,
  saveState as saveStateUrl
} from './modules/url-state.js';
import {
  attachMouseEvents,
  attachWheelEvent,
  attachDoubleClickEvent,
  attachRightClickEvent,
  attachTouchEvents,
  attachResizeEvent,
  requestDraw
} from './modules/event-handlers.js';
import { validateInput, validateRecolorInput } from './modules/computation.js';

const canvas = getCanvasElement();
const tooltip = document.getElementById('tooltip');
const nInput = document.getElementById('nInput');
const wInput = document.getElementById('wInput');
const cInput = document.getElementById('cInput');
const colorFilter = document.getElementById('colorFilter');
const plotButton = document.getElementById('plotButton');
const statusText = document.getElementById('status');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const downloadButton = document.getElementById('downloadButton');
const downloadCSVButton = document.getElementById('downloadCSV');
const pointSizeSlider = document.getElementById('pointSizeSlider');
const pointSizeValue = document.getElementById('pointSizeValue');
const kInput = document.getElementById('kInput');

let colorPalette = [];

// Safely evaluate expression and catch parsing/evaluation errors
function safeEvaluate(expr, displayName) {
  try {
    return evaluate(expr);
  } catch (err) {
    const msg = err.message || String(err);
    statusText.textContent = `Error in ${displayName}: ${msg}`;
    return null;
  }
}

function updateHistoryButtonsUI() {
  updateHistoryButtons(prevButton, nextButton, state.currentHistoryIndex, state.history.length);
}

// Add computation to history and update URL
function saveState(newState) {
  const result = saveStateUrl(newState, state.history, state.currentHistoryIndex);
  state.history = result.history;
  state.currentHistoryIndex = result.currentHistoryIndex;
  updateHistoryButtonsUI();
}

// Navigate history: restore UI, points, and palette from saved state
function loadState(index) {
  if (index < 0 || index >= state.history.length) return;
  state.currentHistoryIndex = index;
  const savedState = state.history[index];

  state.points = savedState.points;
  state.colorCount = savedState.c;
  state.trackedK = null;
  colorPalette = buildPalette(savedState.c);

  nInput.value = savedState.n;
  wInput.value = savedState.w;
  cInput.value = savedState.c;
  kInput.value = '';

  updateColorFilterOptions(colorFilter, savedState.c, savedState.selectedColors);
  statusText.textContent = buildStatusText(savedState, state.currentHistoryIndex, state.history.length);
  requestDraw(drawWrapped);
  updateHistoryButtonsUI();
}

function drawWrapped() {
  const selectedSet = new Set(getSelectedColors(colorFilter));
  draw(state, colorPalette, selectedSet);
}

function downloadImage() {
  const savedState = state.history[state.currentHistoryIndex];
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = savedState
      ? `gaussian-period-n${savedState.n}-w${savedState.w}-c${savedState.c}.png`
      : `gaussian-period.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

function downloadCSV() {
  const savedState = state.history[state.currentHistoryIndex];
  if (!savedState || !state.points.length) {
    alert('No data to download');
    return;
  }

  const rows = [['k', 'Real Part', 'Imaginary Part', 'Color']];

  for (const p of state.points) {
    const color = getColorClass(p, state.colorCount);
    rows.push([
      p.k,
      p.real.toFixed(10),
      p.imag.toFixed(10),
      color
    ]);
  }

  const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = savedState
    ? `gaussian-period-n${savedState.n}-w${savedState.w}-c${savedState.c}.csv`
    : `gaussian-period.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Compute Gaussian period points asynchronously, save result, and render
function plot() {
  const n = safeEvaluate(nInput.value, 'n');
  const w = safeEvaluate(wInput.value, 'w');
  const c = safeEvaluate(cInput.value, 'colors');

  if (n === null || w === null || c === null) return;
  if (!validateInput(n, w, c, statusText)) return;

  const t0 = performance.now();
  statusText.textContent = 'Computing...';

  computeAsync(n, w, (result, error) => {
    if (error) {
      statusText.textContent = error.message;
      return;
    }

    const { reals, imags, residues, order } = result;
    const computeTime = performance.now() - t0;
    const pts = Array.from({ length: n }, (_, k) => ({
      k,
      real: reals[k],
      imag: imags[k]
    }));

    state.colorCount = c;
    state.points = pts;
    state.trackedK = null;
    colorPalette = buildPalette(c);

    kInput.value = '';
    updateColorFilterOptions(colorFilter, c);

    // Pack computation metadata alongside points for history
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
      selectedColors: getSelectedColors(colorFilter)
    };

    saveState(newState);
    updateUrl(n, w, c);
    statusText.textContent = buildStatusText(newState, state.currentHistoryIndex, state.history.length);
    requestDraw(drawWrapped);
  });
}

// Track a specific k point on the plot and display its coordinates
function trackKPoint() {
  if (state.points.length === 0) {
    statusText.textContent = 'No points to track. Plot first.';
    return;
  }

  const raw = kInput.value.trim();
  if (!raw) {
    state.trackedK = null;
    requestDraw(drawWrapped);
    return;
  }

  let k;
  try {
    k = evaluate(raw);
  } catch (err) {
    statusText.textContent = `Error in k: ${err.message}`;
    state.trackedK = null;
    requestDraw(drawWrapped);
    return;
  }

  if (!Number.isInteger(k) || k < 0 || k >= state.points.length) {
    statusText.textContent = `k must be an integer from 0 to ${state.points.length - 1}`;
    state.trackedK = null;
    requestDraw(drawWrapped);
    return;
  }

  state.trackedK = k;
  const point = state.points[k];
  statusText.textContent = `k=${k}: Re ≈ ${point.real.toFixed(6)}, Im ≈ ${point.imag.toFixed(6)}`;
  requestDraw(drawWrapped);
}

// Change color count without recomputing points (called on color input change)
function recolorCurrentPlot() {
  if (state.points.length === 0 || state.currentHistoryIndex < 0) return;

  const raw = cInput.value.trim();
  if (!raw) return;

  const newC = safeEvaluate(raw, 'colors');
  if (newC === null) return;

  const savedState = state.history[state.currentHistoryIndex];

  if (!validateRecolorInput(newC, savedState.n, statusText)) return;

  state.colorCount = newC;
  colorPalette = buildPalette(newC);

  savedState.c = newC;
  savedState.gcdColorsN = gcd(newC, savedState.n);
  savedState.gcdColorsOrder = gcd(newC, savedState.order);

  updateColorFilterOptions(colorFilter, newC);
  savedState.selectedColors = getSelectedColors(colorFilter);
  updateUrl(savedState.n, savedState.w, newC, true);
  statusText.textContent = buildStatusText(savedState, state.currentHistoryIndex, state.history.length);
  requestDraw(drawWrapped);
}

function setupEventListeners() {
  plotButton.addEventListener('click', plot);

  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    if (document.activeElement === colorFilter) return;
    e.preventDefault();
    plot();
  });

  // Debounce color input to avoid recomputing on every keystroke
  let recolorTimer = null;
  cInput.addEventListener('input', () => {
    clearTimeout(recolorTimer);
    recolorTimer = setTimeout(recolorCurrentPlot, 300);
  });

  prevButton.addEventListener('click', () => loadState(state.currentHistoryIndex - 1));
  nextButton.addEventListener('click', () => loadState(state.currentHistoryIndex + 1));

  colorFilter.addEventListener('change', () => {
    if (state.currentHistoryIndex >= 0) {
      state.history[state.currentHistoryIndex].selectedColors = getSelectedColors(colorFilter);
    }
    requestDraw(drawWrapped);
  });

  pointSizeSlider.addEventListener('input', () => {
    const size = parseFloat(pointSizeSlider.value);
    state.pointSizeMultiplier = size;
    pointSizeValue.textContent = size.toFixed(1) + 'x';
    requestDraw(drawWrapped);
  });

  // Debounce k input to avoid tracking on every keystroke
  let kTrackTimer = null;
  kInput.addEventListener('input', () => {
    clearTimeout(kTrackTimer);
    kTrackTimer = setTimeout(trackKPoint, 200);
  });

  // Show hover tooltip with point info using spatial hash grid query
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const nearest = getHoverPoint(mx, my, state);

    if (!nearest) {
      tooltip.style.display = 'none';
      return;
    }

    tooltip.style.display = 'block';
    tooltip.style.left = `${mx + 12}px`;
    tooltip.style.top = `${my + 12}px`;
    tooltip.textContent =
      `k = ${nearest.k}\ncolor = ${nearest.color}\n` +
      `Re ≈ ${nearest.real.toFixed(5)}\nIm ≈ ${nearest.imag.toFixed(5)}`;
  });

  canvas.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
  });

  window.addEventListener('popstate', () => {
    loadParamsFromUrl(nInput, wInput, cInput);
    plot();
  });

  downloadButton.addEventListener('click', downloadImage);
  downloadCSVButton.addEventListener('click', downloadCSV);

  attachMouseEvents(drawWrapped);
  attachWheelEvent(drawWrapped);
  attachDoubleClickEvent(drawWrapped);
  attachRightClickEvent(drawWrapped);
  attachTouchEvents(drawWrapped);
  attachResizeEvent(() => requestDraw(drawWrapped));
}

function initialize() {
  loadParamsFromUrl(nInput, wInput, cInput);
  syncCanvasSize(state);
  setupEventListeners();

  const initialN = safeEvaluate(nInput.value, 'n');
  const initialW = safeEvaluate(wInput.value, 'w');
  const initialC = safeEvaluate(cInput.value, 'colors');

  if (initialN !== null && initialW !== null && initialC !== null) {
    updateUrl(initialN, initialW, initialC, true);
  }
  updateHistoryButtonsUI();

  plot();
}

initialize();
