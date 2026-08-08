const colorCache = new Map();

// HSV to RGB conversion with cache (avoids repeated color calculations)
export function hsvToRgb(h, s, v) {
  const key = `${h},${s},${v}`;
  if (colorCache.has(key)) return colorCache.get(key);

  const c = v * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const rgb = `rgb(${(r + m) * 255 | 0},${(g + m) * 255 | 0},${(b + m) * 255 | 0})`;
  colorCache.set(key, rgb);
  return rgb;
}

// Generate evenly-spaced hue palette with given color count
export function buildPalette(colorCount) {
  const palette = [];
  for (let i = 0; i < colorCount; i++) {
    palette.push(hsvToRgb((360 * i) / colorCount, 0.9, 1.0));
  }
  return palette;
}

// Map point index to color class via modular arithmetic
export function getColorClass(point, colorModulus) {
  return ((point.k % colorModulus) + colorModulus) % colorModulus;
}
