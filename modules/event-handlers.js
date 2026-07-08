import { state } from './state.js';
import { zoomAt, resetViewport } from './viewport.js';
import { draw, getCanvasElement } from './canvas-renderer.js';

export function attachMouseEvents(draw) {
  const canvas = getCanvasElement();

  canvas.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    state.isDragging = true;
    state.dragStartX = e.clientX;
    state.dragStartY = e.clientY;
    state.dragPanX = state.panX;
    state.dragPanY = state.panY;
    canvas.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', e => {
    if (!state.isDragging) return;
    state.panX = state.dragPanX + (e.clientX - state.dragStartX);
    state.panY = state.dragPanY + (e.clientY - state.dragStartY);
    requestDraw(draw);
  });

  window.addEventListener('mouseup', () => {
    if (!state.isDragging) return;
    state.isDragging = false;
    canvas.style.cursor = '';
  });
}

export function attachWheelEvent(draw) {
  const canvas = getCanvasElement();

  function flushWheel() {
    state.wheelRafPending = false;
    if (state.pendingWheelDelta === 0) return;
    const factor = Math.exp(-state.pendingWheelDelta * 0.001);
    zoomAt(state, state.pendingWheelMX, state.pendingWheelMY, state.zoomFactor * factor);
    state.pendingWheelDelta = 0;
    draw();
  }

  canvas.addEventListener(
    'wheel',
    e => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      state.pendingWheelMX = e.clientX - rect.left;
      state.pendingWheelMY = e.clientY - rect.top;

      const lineH = 16;
      const pageH = state.canvasH || 600;
      const raw =
        e.deltaMode === 2 ? e.deltaY * pageH :
        e.deltaMode === 1 ? e.deltaY * lineH :
        e.deltaY;

      state.pendingWheelDelta += raw;

      if (!state.wheelRafPending) {
        state.wheelRafPending = true;
        requestAnimationFrame(flushWheel);
      }
    },
    { passive: false }
  );
}

export function attachDoubleClickEvent(draw) {
  const canvas = getCanvasElement();

  canvas.addEventListener('dblclick', () => {
    resetViewport(state);
    draw();
  });
}

export function attachRightClickEvent(draw) {
  const canvas = getCanvasElement();

  canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    zoomAt(state, e.clientX - rect.left, e.clientY - rect.top, state.zoomFactor / 1.2);
    draw();
  });
}

export function attachTouchEvents(draw) {
  const canvas = getCanvasElement();

  canvas.addEventListener(
    'touchstart',
    e => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const t0 = e.touches[0], t1 = e.touches[1];
        state.lastPinchDist = Math.hypot(
          t1.clientX - t0.clientX,
          t1.clientY - t0.clientY
        );
        const rect = canvas.getBoundingClientRect();
        state.lastPinchMX = ((t0.clientX + t1.clientX) / 2) - rect.left;
        state.lastPinchMY = ((t0.clientY + t1.clientY) / 2) - rect.top;
      }
    },
    { passive: false }
  );

  canvas.addEventListener(
    'touchmove',
    e => {
      if (e.touches.length === 2 && state.lastPinchDist !== null) {
        e.preventDefault();
        const t0 = e.touches[0], t1 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
        const ratio = dist / state.lastPinchDist;
        state.lastPinchDist = dist;

        const rect = canvas.getBoundingClientRect();
        state.lastPinchMX = ((t0.clientX + t1.clientX) / 2) - rect.left;
        state.lastPinchMY = ((t0.clientY + t1.clientY) / 2) - rect.top;

        zoomAt(state, state.lastPinchMX, state.lastPinchMY, state.zoomFactor * ratio * 2.0);
        draw();
      }
    },
    { passive: false }
  );

  canvas.addEventListener('touchend', () => {
    state.lastPinchDist = null;
  });
}

export function attachResizeEvent(draw) {
  window.addEventListener('resize', () => {
    draw();
  });
}

function requestDraw(draw) {
  if (state.rafPending) return;
  state.rafPending = true;
  requestAnimationFrame(() => {
    state.rafPending = false;
    draw();
  });
}

export { requestDraw };
