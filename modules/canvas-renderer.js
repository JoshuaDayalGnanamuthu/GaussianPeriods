import { getColorClass } from './color-utils.js';
import { clearHoverGrid, addHoverPoint, findNearestHoverPoint } from './hover-system.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Handle DPI scaling and canvas resize to match CSS dimensions
export function syncCanvasSize(state) {
  const rect = canvas.getBoundingClientRect();
  const newDpr = window.devicePixelRatio || 1;
  const newW = Math.floor(rect.width * newDpr);
  const newH = Math.floor(rect.height * newDpr);

  if (
    newW === canvas.width &&
    newH === canvas.height &&
    newDpr === state.dpr
  ) {
    return false;
  }

  canvas.width = newW;
  canvas.height = newH;
  state.dpr = newDpr;
  state.canvasW = rect.width;
  state.canvasH = rect.height;
  ctx.setTransform(newDpr, 0, 0, newDpr, 0, 0);
  return true;
}

export function getCanvasElement() {
  return canvas;
}

export function getCanvasContext() {
  return ctx;
}

// Render points on canvas with zoom/pan transforms and color filtering
export function draw(state, colorPalette, selectedColors = new Set()) {
  syncCanvasSize(state);

  const width = state.canvasW;
  const height = state.canvasH;
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);

  clearHoverGrid();
  ctx.save();
  ctx.translate(state.panX, state.panY);
  ctx.scale(state.zoomFactor, state.zoomFactor);

  // Draw crosshairs (adjust for visible viewport)
  const visL = (0 - state.panX) / state.zoomFactor;
  const visR = (width - state.panX) / state.zoomFactor;
  const visT = (0 - state.panY) / state.zoomFactor;
  const visB = (height - state.panY) / state.zoomFactor;

  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1 / state.zoomFactor;
  ctx.beginPath();
  ctx.moveTo(visL, centerY);
  ctx.lineTo(visR, centerY);
  ctx.moveTo(centerX, visT);
  ctx.lineTo(centerX, visB);
  ctx.stroke();

  if (state.points.length === 0) {
    ctx.restore();
    return;
  }

  // Autoscale complex plane to fit canvas
  let maxAbs = 0;
  for (const p of state.points) {
    const a = Math.hypot(p.real, p.imag);
    if (a > maxAbs) maxAbs = a;
  }
  if (maxAbs === 0) maxAbs = 1;

  const scale = 0.42 * Math.min(width, height) / maxAbs;
  const baseRadius = Math.max(1, Math.min(8, scale / 25));
  const radius = baseRadius * state.pointSizeMultiplier;
  const bigData = state.points.length > 8000;

  const showAll = selectedColors.size === 0;

  // Render as circles for <8k points, pixels for larger sets (performance optimization)
  if (!bigData) {
    const r = radius / state.zoomFactor;
    const TAU = 2 * Math.PI;
    let lastCol = -1;

    for (const p of state.points) {
      const col = getColorClass(p, state.colorCount);
      if (!showAll && !selectedColors.has(col)) continue;

      const wx = centerX + p.real * scale;
      const wy = centerY - p.imag * scale;

      if (col !== lastCol) {
        ctx.fillStyle = colorPalette[col];
        lastCol = col;
      }

      ctx.beginPath();
      ctx.arc(wx, wy, r, 0, TAU);
      ctx.fill();
      addHoverPoint(wx * state.zoomFactor + state.panX, wy * state.zoomFactor + state.panY, p, col);
    }
  } else {
    const pxSize = 1 / state.zoomFactor;
    let lastCol = -1;

    for (const p of state.points) {
      const col = getColorClass(p, state.colorCount);
      if (!showAll && !selectedColors.has(col)) continue;

      const wx = centerX + p.real * scale;
      const wy = centerY - p.imag * scale;

      if (col !== lastCol) {
        ctx.fillStyle = colorPalette[col];
        lastCol = col;
      }

      ctx.fillRect(wx, wy, pxSize, pxSize);
      addHoverPoint(wx * state.zoomFactor + state.panX, wy * state.zoomFactor + state.panY, p, col);
    }
  }

  // Highlight tracked k point with a glowing ring
  if (state.trackedK !== null && state.trackedK >= 0 && state.trackedK < state.points.length) {
    const trackedPoint = state.points[state.trackedK];
    const wx = centerX + trackedPoint.real * scale;
    const wy = centerY - trackedPoint.imag * scale;

    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 3 / state.zoomFactor;
    ctx.beginPath();
    const highlightRadius = (radius * 2) / state.zoomFactor;
    ctx.arc(wx, wy, highlightRadius, 0, 2 * Math.PI);
    ctx.stroke();
  }

  ctx.restore();
}

export function getHoverPoint(mouseX, mouseY, state) {
  return findNearestHoverPoint(mouseX, mouseY, state.points.length);
}
