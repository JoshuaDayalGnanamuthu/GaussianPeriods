// Initialize KaTeX equations
function initEquations() {
  // Definition equation
  const eqDef = `\\eta_{a} = \\sum_{j \\in C_a} \\zeta^j`;
  katex.render(eqDef, document.getElementById('eq-definition'));

  // Roots of unity
  const eqRoots = `\\zeta_n = e^{2\\pi i / n}, \\quad \\zeta_n^n = 1`;
  katex.render(eqRoots, document.getElementById('eq-roots'));

  // Character-based grouping
  const eqChar = `\\eta_a = \\sum_{j=0}^{n-1} \\chi(j) = a \\cdot \\zeta_n^j`;
  katex.render(eqChar, document.getElementById('eq-character'));

  // Minimal polynomial
  const eqMinimal = `\\text{min}_\\mathbb{Q}(\\eta_a) = \\prod_{\\sigma \\in G} (x - \\sigma(\\eta_a))`;
  katex.render(eqMinimal, document.getElementById('eq-minimal'));

  // Examples
  const ex1 = `\\eta_1 = \\zeta_5 + \\zeta_5^4, \\quad \\eta_2 = \\zeta_5^2 + \\zeta_5^3`;
  katex.render(ex1, document.getElementById('ex1'));

  const ex2 = `\\eta_1 + \\eta_2 = -1, \\quad \\eta_1 \\eta_2 = -2`;
  katex.render(ex2, document.getElementById('ex2'));

  const ex3 = `\\eta_1 = \\sum_{t=0}^{6} \\zeta_{13}^{2t}`;
  katex.render(ex3, document.getElementById('ex3'));

  // Coloring/Period equation
  const eqColoring = `\\eta_k = \\sum_{j \\in C_k} \\zeta_n^j = \\sum_{j \\in C_k} e^{2\\pi ij/n} \\in \\mathbb{Z}[\\zeta_n]`;
  katex.render(eqColoring, document.getElementById('eq-coloring'));
}

// Minimal animated background
class CosmicBackground {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.resize();
    this.initParticles();
    this.animate();

    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 1 + 0.5,
        opacity: Math.random() * 0.15 + 0.05,
        pulseSpeed: Math.random() * 0.03 + 0.01
      });
    }
  }

  drawParticles() {
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

      p.x = Math.max(0, Math.min(this.canvas.width, p.x));
      p.y = Math.max(0, Math.min(this.canvas.height, p.y));

      const pulse = Math.sin(Date.now() * p.pulseSpeed * 0.001) * 0.3 + 0.7;
      const radius = p.radius * pulse;

      this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * pulse})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawParticles();
    requestAnimationFrame(() => this.animate());
  }
}

// Visualization: Unit circle with roots of unity
class UnitCircleViz {
  constructor(canvas, n = 12) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.n = n;
    this.time = 0;
    this.animate();
  }

  animate() {
    this.time += 0.01;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    // Clear
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, width, height);

    // Draw circle
    this.ctx.strokeStyle = '#555';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.stroke();

    // Draw axes
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 0.8;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - radius - 20, centerY);
    this.ctx.lineTo(centerX + radius + 20, centerY);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY - radius - 20);
    this.ctx.lineTo(centerX, centerY + radius + 20);
    this.ctx.stroke();

    // Draw roots of unity
    for (let i = 0; i < this.n; i++) {
      const angle = (2 * Math.PI * i) / this.n + this.time * 0.2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      // Point
      this.ctx.fillStyle = '#fff';
      this.ctx.beginPath();
      this.ctx.arc(x, y, 4, 0, Math.PI * 2);
      this.ctx.fill();

      // Label
      this.ctx.fillStyle = '#888';
      this.ctx.font = '10px Georgia';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(`ζ${i}`, x + 18, y + 18);
    }

    // Draw center point
    this.ctx.fillStyle = '#666';
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 2.5, 0, Math.PI * 2);
    this.ctx.fill();

    requestAnimationFrame(() => this.animate());
  }
}

// Visualization: Grouped roots with Gaussian periods
class GaussianPeriodsViz {
  constructor(canvas, n = 12, omega = 2) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.n = n;
    this.omega = omega;
    this.time = 0;
    this.animate();
  }

  getGroupColor(groupIdx, totalGroups) {
    const brightness = 200 - (groupIdx / totalGroups) * 100;
    return `rgb(${brightness}, ${brightness}, ${brightness})`;
  }

  animate() {
    this.time += 0.01;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    // Clear
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, width, height);

    // Draw circle
    this.ctx.strokeStyle = '#555';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.stroke();

    // Calculate groups
    const groups = new Map();
    for (let j = 0; j < this.n; j++) {
      const groupKey = (this.omega * j) % this.n;
      if (!groups.has(groupKey)) groups.set(groupKey, []);
      groups.get(groupKey).push(j);
    }

    const groupArray = Array.from(groups.values());
    const groupColors = groupArray.map((_, i) => this.getGroupColor(i, groupArray.length));

    // Draw roots grouped
    groupArray.forEach((group, groupIdx) => {
      const color = groupColors[groupIdx];

      // Draw connections between grouped points
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const angle1 = (2 * Math.PI * group[i]) / this.n + this.time * 0.2;
          const angle2 = (2 * Math.PI * group[j]) / this.n + this.time * 0.2;
          const x1 = centerX + radius * Math.cos(angle1);
          const y1 = centerY + radius * Math.sin(angle1);
          const x2 = centerX + radius * Math.cos(angle2);
          const y2 = centerY + radius * Math.sin(angle2);

          this.ctx.strokeStyle = color;
          this.ctx.globalAlpha = 0.3;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(x1, y1);
          this.ctx.lineTo(x2, y2);
          this.ctx.stroke();
          this.ctx.globalAlpha = 1;
        }
      }

      // Draw points in group
      group.forEach(j => {
        const angle = (2 * Math.PI * j) / this.n + this.time * 0.2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = 0.2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 10, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;

        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 4, 0, Math.PI * 2);
        this.ctx.fill();
      });
    });

    requestAnimationFrame(() => this.animate());
  }
}

// HSV to RGB conversion (matching app logic)
function hsvToRgb(h, s, v) {
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

  return `rgb(${(r + m) * 255 | 0},${(g + m) * 255 | 0},${(b + m) * 255 | 0})`;
}

// Animated Coloring Visualization
class ColoringVisualization {
  constructor(canvas, n = 12, omega = 7, colorCount = 3) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.n = n;
    this.omega = omega;
    this.colorCount = colorCount;
    this.frameCount = 0;
    this.pointDelay = 60; // frames between each point appearing
    this.buildPalette();
    this.computeResidues();
    this.computePoints();
    this.animate();
  }

  buildPalette() {
    this.palette = [];
    for (let i = 0; i < this.colorCount; i++) {
      this.palette.push(hsvToRgb((360 * i) / this.colorCount, 0.9, 1.0));
    }
  }

  computeResidues() {
    // Compute the multiplicative orbit of 1 under omega mod n
    this.residues = [];
    let res = 1;
    do {
      this.residues.push(res);
      res = (res * this.omega) % this.n;
    } while (res !== 1);
  }

  computePoints() {
    if (!this.residues) {
      this.computeResidues();
    }

    this.points = [];

    // Precompute cos and sin for all angles
    const cosA = new Array(this.n);
    const sinA = new Array(this.n);
    for (let i = 0; i < this.n; i++) {
      const angle = 2 * Math.PI * i / this.n;
      cosA[i] = Math.cos(angle);
      sinA[i] = Math.sin(angle);
    }

    // For each k from 0 to n-1, compute point[k] = sum of roots
    for (let k = 0; k < this.n; k++) {
      let real = 0;
      let imag = 0;

      for (const r of this.residues) {
        const idx = (k * r) % this.n;
        real += cosA[idx];
        imag += sinA[idx];
      }

      const colorIdx = k % this.colorCount;

      this.points.push({
        index: k,
        real: real,
        imag: imag,
        colorIdx: colorIdx,
        color: this.palette[colorIdx]
      });
    }
  }

  animate() {
    // Ensure canvas has dimensions
    if (this.canvas.width === 0 || this.canvas.height === 0) {
      this.canvas.width = this.canvas.offsetWidth;
      this.canvas.height = this.canvas.offsetHeight;
    }

    // Compute points once
    if (!this.points) {
      this.computePoints();
    }

    const width = this.canvas.width;
    const height = this.canvas.height;

    if (width === 0 || height === 0) {
      this.frameCount++;
      requestAnimationFrame(() => this.animate());
      return;
    }
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, width, height);

    // Draw crosshairs
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, centerY);
    this.ctx.lineTo(width, centerY);
    this.ctx.moveTo(centerX, 0);
    this.ctx.lineTo(centerX, height);
    this.ctx.stroke();

    // Calculate scale - max distance from origin
    let maxAbs = 0;
    for (const p of this.points) {
      const a = Math.hypot(p.real, p.imag);
      if (a > maxAbs) maxAbs = a;
    }
    if (maxAbs === 0) maxAbs = 1;

    const scale = 0.35 * Math.min(width, height) / maxAbs;
    const pointRadius = 6;

    // Determine which points should be visible
    const totalFrames = this.n * this.pointDelay + 60;
    const cycleFrame = this.frameCount % totalFrames;

    // Draw all points that should be visible by this frame
    for (let k = 0; k < this.n; k++) {
      const pt = this.points[k];
      const appearFrame = k * this.pointDelay;

      if (cycleFrame >= appearFrame) {
        const x = centerX + pt.real * scale;
        const y = centerY - pt.imag * scale;
        const color = pt.color;

        // Fade in when this point appears
        const timeSinceAppear = cycleFrame - appearFrame;
        const fadeProgress = Math.min(timeSinceAppear / 10, 1);

        // Draw glow
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = fadeProgress * 0.3;
        this.ctx.beginPath();
        this.ctx.arc(x, y, pointRadius * 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw point
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = fadeProgress;
        this.ctx.beginPath();
        this.ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw label (k = 0, k = 1, etc.) - visible for entire pointDelay duration
        const fadeOutStart = this.pointDelay - 10; // start fading 10 frames before next point
        let labelAlpha = 0.8;

        if (timeSinceAppear >= fadeOutStart) {
          const fadeFrames = this.pointDelay - fadeOutStart;
          const fadeProgress = (timeSinceAppear - fadeOutStart) / fadeFrames;
          labelAlpha = 0.8 * (1 - fadeProgress);
        }

        if (labelAlpha > 0) {
          this.ctx.fillStyle = color;
          this.ctx.globalAlpha = labelAlpha;
          this.ctx.font = 'bold 12px Georgia';
          this.ctx.textAlign = 'left';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText(`k = ${k}`, x + 12, y - 10);
        }

        this.ctx.globalAlpha = 1;
      }
    }

    this.frameCount++;
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  // Initialize equations
  initEquations();

  // Initialize background
  const bgCanvas = document.getElementById('bgCanvas');
  new CosmicBackground(bgCanvas);

  // Initialize visualizations
  const vizCanvas1 = document.getElementById('vizCanvas1');
  const vizCanvas2 = document.getElementById('vizCanvas2');
  const coloringCanvas = document.getElementById('coloringCanvas');

  if (vizCanvas1) new UnitCircleViz(vizCanvas1, 12);
  if (vizCanvas2) new GaussianPeriodsViz(vizCanvas2, 12, 2);
  if (coloringCanvas) new ColoringVisualization(coloringCanvas, 12, 7);

  // Smooth scroll behavior for navigation
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});

// Handle canvas resizing for visualizations
window.addEventListener('resize', () => {
  const vizCanvas1 = document.getElementById('vizCanvas1');
  const vizCanvas2 = document.getElementById('vizCanvas2');
  const coloringCanvas = document.getElementById('coloringCanvas');

  if (vizCanvas1) {
    vizCanvas1.width = vizCanvas1.offsetWidth;
    vizCanvas1.height = vizCanvas1.offsetHeight;
  }
  if (vizCanvas2) {
    vizCanvas2.width = vizCanvas2.offsetWidth;
    vizCanvas2.height = vizCanvas2.offsetHeight;
  }
  if (coloringCanvas) {
    coloringCanvas.width = coloringCanvas.offsetWidth;
    coloringCanvas.height = coloringCanvas.offsetHeight;
  }
});

// Initialize canvas sizes on load
window.addEventListener('load', () => {
  const vizCanvas1 = document.getElementById('vizCanvas1');
  const vizCanvas2 = document.getElementById('vizCanvas2');
  const coloringCanvas = document.getElementById('coloringCanvas');

  if (vizCanvas1) {
    vizCanvas1.width = vizCanvas1.offsetWidth;
    vizCanvas1.height = vizCanvas1.offsetHeight;
  }
  if (vizCanvas2) {
    vizCanvas2.width = vizCanvas2.offsetWidth;
    vizCanvas2.height = vizCanvas2.offsetHeight;
  }
  if (coloringCanvas) {
    coloringCanvas.width = coloringCanvas.offsetWidth;
    coloringCanvas.height = coloringCanvas.offsetHeight;
  }
});
