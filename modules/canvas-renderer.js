import { getColorClass } from './color-utils.js';
import { clearHoverGrid, addHoverPoint, findNearestHoverPoint } from './hover-system.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

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

  let maxAbs = 0;
  for (const p of state.points) {
    const a = Math.hypot(p.real, p.imag);
    if (a > maxAbs) maxAbs = a;
  }
  if (maxAbs === 0) maxAbs = 1;

  const scale = 0.42 * Math.min(width, height) / maxAbs;
  const radius = Math.max(1, Math.min(8, scale / 25));
  const bigData = state.points.length > 8000;

  const showAll = selectedColors.size === 0;

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

  ctx.restore();
}

export function getHoverPoint(mouseX, mouseY, state) {
  return findNearestHoverPoint(mouseX, mouseY, state.points.length);
}
