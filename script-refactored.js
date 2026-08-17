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
import { drawBoxZoomRect } from './modules/canvas-renderer.js';
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
const canvasWrap = document.querySelector('.canvas-wrap');
const nInput = document.getElementById('nInput');
const wInput = document.getElementById('wInput');
const cInput = document.getElementById('cInput');
const plotButton = document.getElementById('plotButton');
const statusText = document.getElementById('status');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingN = document.querySelector('[data-loading-n]');
const loadingW = document.querySelector('[data-loading-w]');
const loadingC = document.querySelector('[data-loading-c]');
// const prevButton = document.getElementById('prevButton');
// const nextButton = document.getElementById('nextButton');
const kSlider = document.getElementById('kSlider');
const kSliderValue = document.getElementById('kSliderValue');
const kInput = document.getElementById('kInput');
const playButton = document.getElementById('playButton');
const pauseButton = document.getElementById('pauseButton');
const animationCounter = document.getElementById('animationCounter');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const viewAllButton = document.getElementById('viewAllButton');
const colorPreviewsWrapper = document.getElementById('colorPreviewsWrapper');
const downloadPngBtn = document.getElementById('downloadPngBtn');
const downloadCsvBtn = document.getElementById('downloadCsvBtn');
const resetAxisBtn = document.getElementById('resetAxisBtn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const boxZoomBtn = document.getElementById('boxZoomBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const appElement = document.querySelector('.app');

let boxZoomMode = false;
let boxZoomStart = null;
let boxZoomRect = null;

let colorPalette = [];
let selectedColorGroups = new Set(); // Contains indices of selected color groups

function setLoadingState(isLoading, params = {}) {
  canvasWrap.classList.toggle('is-loading', isLoading);
  canvasWrap.setAttribute('aria-busy', isLoading ? 'true' : 'false');
  loadingOverlay.setAttribute('aria-hidden', isLoading ? 'false' : 'true');
  plotButton.disabled = isLoading;

  if (params.n !== undefined) loadingN.textContent = `n = ${params.n}`;
  if (params.w !== undefined) loadingW.textContent = `omega = ${params.w}`;
  if (params.c !== undefined) loadingC.textContent = `colors = ${params.c}`;
}

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
  // updateHistoryButtons(prevButton, nextButton, state.currentHistoryIndex, state.history.length);
}

let urlSelectedColorsToApply = [];

function generateColorPreviews(colorCount, points, colorPalette) {
  colorPreviewsWrapper.innerHTML = '';
  selectedColorGroups.clear();

  const previewSize = 80;
  const canvasScale = 2;

  // Add start divider
  const startDivider = document.createElement('div');
  startDivider.className = 'color-preview-divider';
  colorPreviewsWrapper.appendChild(startDivider);

  for (let colorIdx = 0; colorIdx < colorCount; colorIdx++) {
    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = previewSize * canvasScale;
    previewCanvas.height = previewSize * canvasScale;
    previewCanvas.className = 'color-preview-canvas';

    const ctx = previewCanvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, previewSize * canvasScale, previewSize * canvasScale);

    let maxAbs = 0;
    const colorPoints = points.filter(p => getColorClass(p, colorCount) === colorIdx);

    if (colorPoints.length > 0) {
      for (const p of colorPoints) {
        const a = Math.hypot(p.real, p.imag);
        if (a > maxAbs) maxAbs = a;
      }
      if (maxAbs === 0) maxAbs = 1;

      const scale = 0.35 * previewSize / maxAbs;
      const centerX = (previewSize / 2) * canvasScale;
      const centerY = (previewSize / 2) * canvasScale;
      const radius = Math.max(1.5, Math.min(4, scale / 25));

      ctx.fillStyle = colorPalette[colorIdx];
      for (const p of colorPoints) {
        const wx = centerX + p.real * scale;
        const wy = centerY - p.imag * scale;
        ctx.beginPath();
        ctx.arc(wx, wy, radius, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    const item = document.createElement('div');
    item.className = 'color-preview-item';
    item.dataset.colorIndex = colorIdx;

    previewCanvas.style.cursor = 'pointer';
    previewCanvas.style.width = previewSize + 'px';
    previewCanvas.style.height = previewSize + 'px';

    const label = document.createElement('div');
    label.className = 'color-preview-label';
    label.textContent = `Color ${colorIdx}`;

    item.appendChild(previewCanvas);
    item.appendChild(label);

    item.addEventListener('click', () => toggleColorGroup(colorIdx));
    colorPreviewsWrapper.appendChild(item);

    if (colorIdx < colorCount - 1) {
      const divider = document.createElement('div');
      divider.className = 'color-preview-divider';
      colorPreviewsWrapper.appendChild(divider);
    }
  }

  // Add end divider
  const endDivider = document.createElement('div');
  endDivider.className = 'color-preview-divider';
  colorPreviewsWrapper.appendChild(endDivider);

  // Apply selected colors from URL if available
  if (urlSelectedColorsToApply.length > 0) {
    selectedColorGroups = new Set(urlSelectedColorsToApply);
    updateColorPreviewUI();
    urlSelectedColorsToApply = [];
  }
}

function toggleColorGroup(colorIdx) {
  if (selectedColorGroups.has(colorIdx)) {
    selectedColorGroups.delete(colorIdx);
  } else {
    selectedColorGroups.add(colorIdx);
  }
  updateColorPreviewUI();
}

function navigateColorGroups(direction) {
  if (selectedColorGroups.size === 0) return;

  const currentColor = Array.from(selectedColorGroups)[0];
  const colorCount = state.colorCount;

  let nextColor;
  if (direction === 'left') {
    nextColor = (currentColor - 1 + colorCount) % colorCount;
  } else {
    nextColor = (currentColor + 1) % colorCount;
  }

  selectedColorGroups.clear();
  selectedColorGroups.add(nextColor);
  updateColorPreviewUI();

  const previewItem = colorPreviewsWrapper.querySelector(`[data-color-index="${nextColor}"]`);
  if (previewItem) {
    previewItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}

function updateColorPreviewUI() {
  const items = colorPreviewsWrapper.querySelectorAll('.color-preview-item');
  items.forEach((item, idx) => {
    if (selectedColorGroups.has(idx)) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  const filteredSet = new Set(selectedColorGroups);
  requestDraw(() => {
    const filteredSelected = filteredSet.size === 0 ? new Set() : filteredSet;
    draw(state, colorPalette, filteredSelected);
  });

  // Update URL with selected colors
  if (state.currentHistoryIndex >= 0) {
    const savedState = state.history[state.currentHistoryIndex];
    updateUrl(savedState.n, savedState.w, savedState.c, true, Array.from(selectedColorGroups));
  }
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

  statusText.textContent = buildStatusText(savedState, state.currentHistoryIndex, state.history.length);
  requestDraw(drawWrapped);
  updateHistoryButtonsUI();
}

function drawWrapped() {
  draw(state, colorPalette, selectedColorGroups);
  if (boxZoomRect) {
    drawBoxZoomRect(boxZoomRect);
  }
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
  const showAll = selectedColorGroups.size === 0;

  for (const p of state.points) {
    const color = getColorClass(p, state.colorCount);

    // Only include points if showing all colors or if this color is selected
    if (!showAll && !selectedColorGroups.has(color)) continue;

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
  setLoadingState(true, { n, w, c });

  computeAsync(n, w, (result, error) => {
    setLoadingState(false);

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
    state.isAnimating = false;
    state.animationK = 0;
    state.animationStartTime = null;
    colorPalette = buildPalette(c);

    kInput.value = '';
    kSlider.max = n - 1;
    kSlider.value = 0;
    kSlider.disabled = false;
    kSliderValue.textContent = '0';
    playButton.style.display = 'block';
    pauseButton.style.display = 'none';
    animationCounter.style.display = 'none';

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
      selectedColors: Array.from(selectedColorGroups)
    };

    saveState(newState);
    updateUrl(n, w, c, false, Array.from(selectedColorGroups));
    statusText.textContent = buildStatusText(newState, state.currentHistoryIndex, state.history.length);
    generateColorPreviews(c, pts, colorPalette);
    requestDraw(drawWrapped);
  });
}

// Animation loop for plotting points sequentially
function animationFrame(timestamp) {
  if (!state.isAnimating) return;

  if (state.animationStartTime === null) {
    state.animationStartTime = timestamp - (state.animationElapsedTime || 0);
  }

  const elapsed = timestamp - state.animationStartTime;
  const pointDuration = 1000 / (state.pointsPerSecond * state.animationSpeed);
  const newK = Math.floor(elapsed / pointDuration) + 1;

  if (newK >= state.points.length) {
    state.isAnimating = false;
    state.animationK = state.points.length;
    playButton.style.display = 'block';
    pauseButton.style.display = 'none';
    animationCounter.style.display = 'none';
    state.animationStartTime = null;
    state.animationElapsedTime = 0;
    state.lastAnimationFrameTime = null;
    requestDraw(drawWrapped);
    return;
  }

  state.animationK = newK;
  state.lastAnimationFrameTime = timestamp;
  animationCounter.textContent = `${newK}/${state.points.length}`;
  requestDraw(drawWrapped);
  requestAnimationFrame(animationFrame);
}

// Start/resume animation
function startAnimation() {
  if (state.points.length === 0) {
    statusText.textContent = 'Plot points first.';
    return;
  }

  // If animation finished, reset to beginning
  if (state.animationK >= state.points.length) {
    state.animationK = 0;
    state.animationStartTime = null;
    state.animationElapsedTime = 0;
    state.lastAnimationFrameTime = null;
  } else {
    // Resume from pause - just reset start time, keep the elapsed time
    state.animationStartTime = null;
  }

  state.isAnimating = true;
  playButton.style.display = 'none';
  pauseButton.style.display = 'block';
  animationCounter.style.display = 'block';
  requestAnimationFrame(animationFrame);
}

// Pause animation
function pauseAnimation() {
  state.isAnimating = false;
  playButton.style.display = 'block';
  pauseButton.style.display = 'none';
  animationCounter.style.display = 'none';

  // Store the elapsed time (calculated from the last animation frame's timestamp)
  if (state.lastAnimationFrameTime !== null && state.animationStartTime !== null) {
    state.animationElapsedTime = state.lastAnimationFrameTime - state.animationStartTime;
  }

  // Redraw to show only points up to current animation index
  requestDraw(drawWrapped);
}

// Reset animation
function resetAnimation() {
  state.isAnimating = false;
  state.animationK = 0;
  state.animationStartTime = null;
  state.animationElapsedTime = 0;
  state.lastAnimationFrameTime = null;
  playButton.style.display = 'block';
  pauseButton.style.display = 'none';
  requestDraw(drawWrapped);
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

  savedState.selectedColors = Array.from(selectedColorGroups);
  generateColorPreviews(newC, state.points, colorPalette);
  updateUrl(savedState.n, savedState.w, newC, true, Array.from(selectedColorGroups));
  statusText.textContent = buildStatusText(savedState, state.currentHistoryIndex, state.history.length);
  requestDraw(drawWrapped);
}

function resetAxis() {
  state.panX = 0;
  state.panY = 0;
  state.zoomFactor = 1;
  requestDraw(drawWrapped);
}

function autoscale() {
  if (state.points.length === 0) return;

  let minReal = Infinity, maxReal = -Infinity;
  let minImag = Infinity, maxImag = -Infinity;

  for (const p of state.points) {
    minReal = Math.min(minReal, p.real);
    maxReal = Math.max(maxReal, p.real);
    minImag = Math.min(minImag, p.imag);
    maxImag = Math.max(maxImag, p.imag);
  }

  const rangeReal = maxReal - minReal || 1;
  const rangeImag = maxImag - minImag || 1;
  const maxRange = Math.max(rangeReal, rangeImag);

  const canvasWidth = state.canvasW;
  const canvasHeight = state.canvasH;
  const zoomFactor = Math.min(canvasWidth, canvasHeight) / (maxRange * 2.5);

  state.zoomFactor = Math.max(0.1, Math.min(10, zoomFactor));
  state.panX = canvasWidth / 2 - ((minReal + maxReal) / 2) * state.zoomFactor;
  state.panY = canvasHeight / 2 + ((minImag + maxImag) / 2) * state.zoomFactor;

  requestDraw(drawWrapped);
}

function zoomIn() {
  const centerScreenX = state.canvasW / 2;
  const centerScreenY = state.canvasH / 2;

  const oldZoom = state.zoomFactor;
  const newZoom = Math.min(10, oldZoom * 1.5);

  // Calculate world coordinates of center point before zoom
  const centerWorldX = (centerScreenX - state.panX) / oldZoom;
  const centerWorldY = (centerScreenY - state.panY) / oldZoom;

  // Update zoom
  state.zoomFactor = newZoom;

  // Recalculate pan to keep the same world point at the center
  state.panX = centerScreenX - centerWorldX * newZoom;
  state.panY = centerScreenY - centerWorldY * newZoom;

  requestDraw(drawWrapped);
}

function zoomOut() {
  const centerScreenX = state.canvasW / 2;
  const centerScreenY = state.canvasH / 2;

  const oldZoom = state.zoomFactor;
  const newZoom = Math.max(0.1, oldZoom / 1.5);

  // Calculate world coordinates of center point before zoom
  const centerWorldX = (centerScreenX - state.panX) / oldZoom;
  const centerWorldY = (centerScreenY - state.panY) / oldZoom;

  // Update zoom
  state.zoomFactor = newZoom;

  // Recalculate pan to keep the same world point at the center
  state.panX = centerScreenX - centerWorldX * newZoom;
  state.panY = centerScreenY - centerWorldY * newZoom;

  requestDraw(drawWrapped);
}

function toggleBoxZoomMode() {
  boxZoomMode = !boxZoomMode;
  boxZoomBtn.classList.toggle('active', boxZoomMode);
  canvas.style.cursor = boxZoomMode ? 'crosshair' : 'default';
}

function toggleFullscreen() {
  appElement.classList.toggle('fullscreen');
  fullscreenBtn.classList.toggle('active');

  // Trigger resize event to update canvas
  window.dispatchEvent(new Event('resize'));
}

function setupEventListeners() {
  plotButton.addEventListener('click', plot);

  downloadPngBtn.addEventListener('click', downloadImage);
  downloadCsvBtn.addEventListener('click', downloadCSV);
  resetAxisBtn.addEventListener('click', resetAxis);
  zoomInBtn.addEventListener('click', zoomIn);
  zoomOutBtn.addEventListener('click', zoomOut);
  boxZoomBtn.addEventListener('click', toggleBoxZoomMode);

  document.getElementById('gridlineBtn').addEventListener('click', () => {
    state.showGridlines = !state.showGridlines;
    const btn = document.getElementById('gridlineBtn');
    btn.classList.toggle('active', state.showGridlines);
    requestDraw(drawWrapped);
  });

  fullscreenBtn.addEventListener('click', toggleFullscreen);

  playButton.addEventListener('dblclick', resetAnimation);

  // Box zoom event listeners
  canvas.addEventListener('mousedown', (e) => {
    if (!boxZoomMode) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = canvas.getBoundingClientRect();
    boxZoomStart = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, true);

  canvas.addEventListener('mousemove', (e) => {
    if (!boxZoomMode || !boxZoomStart) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = canvas.getBoundingClientRect();
    const current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    boxZoomRect = {
      x: Math.min(boxZoomStart.x, current.x),
      y: Math.min(boxZoomStart.y, current.y),
      width: Math.abs(current.x - boxZoomStart.x),
      height: Math.abs(current.y - boxZoomStart.y)
    };
    requestDraw(drawWrapped);
  }, true);

  canvas.addEventListener('mouseup', (e) => {
    if (!boxZoomMode || !boxZoomStart || !boxZoomRect) return;
    e.preventDefault();
    e.stopPropagation();

    if (boxZoomRect.width > 5 && boxZoomRect.height > 5) {
      const canvasWidth = state.canvasW;
      const canvasHeight = state.canvasH;

      const oldZoom = state.zoomFactor;

      // Calculate zoom needed to fit the box on screen
      const zoomX = canvasWidth / boxZoomRect.width;
      const zoomY = canvasHeight / boxZoomRect.height;
      const newZoom = Math.min(zoomX, zoomY) * 0.9;
      state.zoomFactor = Math.max(0.1, Math.min(10, oldZoom * newZoom));

      // Calculate world coordinates of box center in screen space
      const boxCenterScreenX = boxZoomRect.x + boxZoomRect.width / 2;
      const boxCenterScreenY = boxZoomRect.y + boxZoomRect.height / 2;

      // Calculate world coordinates of box center
      const boxCenterWorldX = (boxCenterScreenX - state.panX) / oldZoom;
      const boxCenterWorldY = (boxCenterScreenY - state.panY) / oldZoom;

      // Calculate canvas center
      const canvasCenterX = canvasWidth / 2;
      const canvasCenterY = canvasHeight / 2;

      // Set pan so box center is at canvas center
      state.panX = canvasCenterX - boxCenterWorldX * state.zoomFactor;
      state.panY = canvasCenterY - boxCenterWorldY * state.zoomFactor;
    }

    boxZoomStart = null;
    boxZoomRect = null;
    requestDraw(drawWrapped);
  }, true);

  viewAllButton.addEventListener('click', () => {
    selectedColorGroups.clear();
    updateColorPreviewUI();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (appElement.classList.contains('fullscreen')) {
        e.preventDefault();
        toggleFullscreen();
      }
    } else if (e.key === 'ArrowLeft') {
      if (selectedColorGroups.size > 0) {
        e.preventDefault();
        navigateColorGroups('left');
      }
    } else if (e.key === 'ArrowRight') {
      if (selectedColorGroups.size > 0) {
        e.preventDefault();
        navigateColorGroups('right');
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      plot();
    }
  });

  // Debounce color input to avoid recomputing on every keystroke
  let recolorTimer = null;
  cInput.addEventListener('input', () => {
    clearTimeout(recolorTimer);
    recolorTimer = setTimeout(recolorCurrentPlot, 300);
  });

  // prevButton.addEventListener('click', () => loadState(state.currentHistoryIndex - 1));
  // nextButton.addEventListener('click', () => loadState(state.currentHistoryIndex + 1));

  // Debounce k input to avoid tracking on every keystroke
  let kTrackTimer = null;
  kInput.addEventListener('input', () => {
    const raw = kInput.value.trim();
    if (raw && !isNaN(raw)) {
      const k = parseInt(raw);
      if (k >= 0 && k <= parseInt(kSlider.max)) {
        kSlider.value = k;
        kSliderValue.textContent = k;
      }
    } else if (!raw) {
      kSlider.value = 0;
      kSliderValue.textContent = '(empty)';
    }
    clearTimeout(kTrackTimer);
    kTrackTimer = setTimeout(trackKPoint, 200);
  });

  kSlider.addEventListener('input', () => {
    const k = parseInt(kSlider.value);
    kInput.value = k;
    kSliderValue.textContent = k;
    if (state.points.length === 0) return;
    if (k >= 0 && k < state.points.length) {
      state.trackedK = k;
      const point = state.points[k];
      statusText.textContent = `k=${k}: Re ≈ ${point.real.toFixed(6)}, Im ≈ ${point.imag.toFixed(6)}`;
      requestDraw(drawWrapped);
    }
  });

  playButton.addEventListener('click', startAnimation);
  pauseButton.addEventListener('click', pauseAnimation);

  speedSlider.addEventListener('input', () => {
    const speed = parseFloat(speedSlider.value);
    state.animationSpeed = speed;
    speedValue.textContent = speed.toFixed(1) + 'x';

    // Adjust animation timing to continue smoothly from current position
    if (state.isAnimating && state.animationStartTime !== null) {
      const now = state.lastAnimationFrameTime || performance.now();
      const pointDuration = 1000 / (state.pointsPerSecond * speed);
      state.animationStartTime = now - (state.animationK - 1) * pointDuration;
    }
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

  attachMouseEvents(drawWrapped);
  attachWheelEvent(drawWrapped);
  attachDoubleClickEvent(drawWrapped);
  attachRightClickEvent(drawWrapped);
  attachTouchEvents(drawWrapped);
  attachResizeEvent(() => requestDraw(drawWrapped));
}

function initialize() {
  loadParamsFromUrl(nInput, wInput, cInput);
  const { selectedColors: urlSelectedColors } = getParamsFromUrl();
  syncCanvasSize(state);
  setupEventListeners();

  const initialN = safeEvaluate(nInput.value, 'n');
  const initialW = safeEvaluate(wInput.value, 'w');
  const initialC = safeEvaluate(cInput.value, 'colors');

  if (initialN !== null && initialW !== null && initialC !== null) {
    updateUrl(initialN, initialW, initialC, true, urlSelectedColors);
  }
  updateHistoryButtonsUI();

  if (urlSelectedColors.length > 0) {
    urlSelectedColorsToApply = urlSelectedColors;
  }
  plot();
}

initialize();
