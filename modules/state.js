// Centralized mutable state: computation results, viewport transforms, interaction state
export const state = {
  points: [],
  history: [],
  currentHistoryIndex: -1,
  colorCount: 3,

  // Viewport: complex plane to canvas transformation
  zoomFactor: 1,
  panX: 0,
  panY: 0,
  pointSizeMultiplier: 1,

  // Canvas: dimensions and DPI for proper rendering
  canvasW: 0,
  canvasH: 0,
  dpr: 1,

  // Drag interaction state
  rafPending: false,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  dragPanX: 0,
  dragPanY: 0,

  // Touch pinch gesture state
  lastPinchDist: null,
  lastPinchMX: 0,
  lastPinchMY: 0,

  // Mouse wheel zoom state (debounced via RAF)
  pendingWheelMX: 0,
  pendingWheelMY: 0,
  pendingWheelDelta: 0,
  wheelRafPending: false,

  recolorTimer: null
};
