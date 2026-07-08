const MIN_ZOOM = 0.05;
const MAX_ZOOM = 200;

export function zoomAt(state, mouseX, mouseY, newZoom) {
  newZoom = Math.max(MIN_ZOOM, Math.min(newZoom, MAX_ZOOM));
  const worldX = (mouseX - state.panX) / state.zoomFactor;
  const worldY = (mouseY - state.panY) / state.zoomFactor;
  state.zoomFactor = newZoom;
  state.panX = mouseX - worldX * newZoom;
  state.panY = mouseY - worldY * newZoom;
}

export function resetViewport(state) {
  state.zoomFactor = 1;
  state.panX = 0;
  state.panY = 0;
}
