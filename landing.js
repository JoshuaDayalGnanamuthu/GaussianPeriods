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

  if (vizCanvas1) new UnitCircleViz(vizCanvas1, 12);
  if (vizCanvas2) new GaussianPeriodsViz(vizCanvas2, 12, 2);

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

  if (vizCanvas1) {
    vizCanvas1.width = vizCanvas1.offsetWidth;
    vizCanvas1.height = vizCanvas1.offsetHeight;
  }
  if (vizCanvas2) {
    vizCanvas2.width = vizCanvas2.offsetWidth;
    vizCanvas2.height = vizCanvas2.offsetHeight;
  }
});

// Initialize canvas sizes on load
window.addEventListener('load', () => {
  const vizCanvas1 = document.getElementById('vizCanvas1');
  const vizCanvas2 = document.getElementById('vizCanvas2');

  if (vizCanvas1) {
    vizCanvas1.width = vizCanvas1.offsetWidth;
    vizCanvas1.height = vizCanvas1.offsetHeight;
  }
  if (vizCanvas2) {
    vizCanvas2.width = vizCanvas2.offsetWidth;
    vizCanvas2.height = vizCanvas2.offsetHeight;
  }
});
