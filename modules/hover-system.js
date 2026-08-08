// Spatial hash grid for O(1) approximate nearest-neighbor queries
// Points are bucketed by screen coordinates divided into 10x10 cells
const HOVER_CELL = 10;
let hoverGrid = new Map();

export function clearHoverGrid() {
  hoverGrid = new Map();
}

export function addHoverPoint(sx, sy, point, colorClass) {
  const key = `${(sx / HOVER_CELL) | 0},${(sy / HOVER_CELL) | 0}`;
  let bucket = hoverGrid.get(key);

  if (!bucket) {
    bucket = [];
    hoverGrid.set(key, bucket);
  }

  bucket.push({
    sx,
    sy,
    k: point.k,
    color: colorClass,
    real: point.real,
    imag: point.imag
  });
}

// Find nearest point within fixed radius; search expands to adjacent cells only
export function findNearestHoverPoint(mouseX, mouseY, pointCount) {
  const cx = (mouseX / HOVER_CELL) | 0;
  const cy = (mouseY / HOVER_CELL) | 0;
  let best = null, bestDist = Infinity;

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const bucket = hoverGrid.get(`${cx + dx},${cy + dy}`);
      if (!bucket) continue;
      for (const p of bucket) {
        const d = Math.hypot(mouseX - p.sx, mouseY - p.sy);
        if (d < bestDist) {
          bestDist = d;
          best = p;
        }
      }
    }
  }

  // Adaptive radius: smaller for dense point clouds to prevent crowding
  const radius = pointCount > 8000 ? 5 : 10;
  return bestDist <= radius ? best : null;
}
