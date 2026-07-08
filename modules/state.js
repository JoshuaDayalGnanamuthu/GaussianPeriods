export const state = {
  points: [],
  history: [],
  currentHistoryIndex: -1,
  colorCount: 3,

  zoomFactor: 1,
  panX: 0,
  panY: 0,

  canvasW: 0,
  canvasH: 0,
  dpr: 1,

  rafPending: false,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  dragPanX: 0,
  dragPanY: 0,

  lastPinchDist: null,
  lastPinchMX: 0,
  lastPinchMY: 0,

  pendingWheelMX: 0,
  pendingWheelMY: 0,
  pendingWheelDelta: 0,
  wheelRafPending: false,

  recolorTimer: null
};
