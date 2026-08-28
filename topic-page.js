class CosmicBackground {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.resize();
    this.initParticles();
    this.animate();

    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < 18; i += 1) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        radius: Math.random() * 1.2 + 0.4,
        opacity: Math.random() * 0.12 + 0.04,
        pulseSpeed: Math.random() * 0.03 + 0.01
      });
    }
  }

  drawParticles() {
    this.particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > this.canvas.width) {
        particle.vx *= -1;
      }
      if (particle.y < 0 || particle.y > this.canvas.height) {
        particle.vy *= -1;
      }

      particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
      particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));

      const pulse = Math.sin(Date.now() * particle.pulseSpeed * 0.001) * 0.3 + 0.7;
      this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity * pulse})`;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius * pulse, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawParticles();
    requestAnimationFrame(() => this.animate());
  }
}

function createSectionHeader(eyebrow, title, description) {
  return `
    <header class="topic-section-header">
      <p class="topic-section-eyebrow">${eyebrow}</p>
      <h2>${title}</h2>
      <p>${description}</p>
    </header>
  `;
}

function createCardGrid(cards) {
  return cards
    .map(
      (card, index) => `
        <article class="topic-summary-card">
          <span class="topic-card-number">0${index + 1}</span>
          <h3>${card.title}</h3>
          <p>${card.body}</p>
        </article>
      `
    )
    .join("");
}

function createDetailGrid(cards) {
  return cards
    .map((card, index) => {
      const paragraphs = card.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("");
      const equationBlock = card.equation
        ? `
          <div class="topic-equation-panel">
            <div class="equation">${card.equation}</div>
            <p class="topic-equation-caption">${card.caption || ""}</p>
          </div>
        `
        : "";

      return `
        <article class="topic-detail-card">
          <header class="topic-detail-heading">
            <span class="topic-card-number">0${index + 1}</span>
            <h3>${card.title}</h3>
          </header>
          <div class="topic-detail-content">
            <div class="topic-rich-text">
              ${paragraphs}
              ${equationBlock}
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function createReferenceGrid(references) {
  return references
    .map(
      (reference, index) => `
        <a class="reference-card" href="${reference.url}" target="_blank" rel="noopener noreferrer" aria-label="Open source: ${reference.title}">
          <span class="reference-index">Source 0${index + 1}</span>
          <h3>${reference.title}</h3>
          <p>${reference.note}</p>
          <span class="topic-card-action">Open source -&gt;</span>
        </a>
      `
    )
    .join("");
}

function createRelatedGrid(topicKey) {
  const relatedTopics = Object.entries(window.TOPIC_PAGE_CONTENT)
    .filter(([key]) => key !== topicKey)
    .map(([key, topic]) => {
      const fileName = `${key}.html`;
      return `
        <a class="topic-link-card" href="${fileName}">
          <span class="topic-card-kicker">Foundation</span>
          <h3>${topic.title}</h3>
          <p>${topic.description}</p>
          <span class="topic-card-action">Read topic -&gt;</span>
        </a>
      `;
    })
    .join("");

  return `
    <div class="topic-link-grid">
      ${relatedTopics}
      <a class="topic-link-card" href="visualizer.html">
        <span class="topic-card-kicker">Interactive</span>
        <h3>Open the Visualizer</h3>
        <p>See how these ideas become actual plotted Gaussian-period sums in the complex plane.</p>
        <span class="topic-card-action">Launch tool -&gt;</span>
      </a>
    </div>
  `;
}

function renderTopicPage(topicKey) {
  const topic = window.TOPIC_PAGE_CONTENT[topicKey];
  const mountPoint = document.getElementById("topicPage");

  if (!topic || !mountPoint) {
    return;
  }

  document.title = `${topic.title} - Gaussian Periods`;

  const exampleParagraphs = topic.example.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("");
  const exampleBullets = topic.example.bullets
    .map((bullet) => `<li>${bullet}</li>`)
    .join("");

  mountPoint.innerHTML = `
    <section class="topic-hero" aria-labelledby="topic-title">
      <div class="container">
        <div class="topic-hero-grid">
          <div class="topic-hero-copy">
            <a href="index.html#math" class="topic-eyebrow">
              <span aria-hidden="true">&larr;</span>
              ${topic.eyebrow}
            </a>
            <h1 class="topic-title" id="topic-title">${topic.title}</h1>
            <p class="topic-lead">${topic.lead}</p>
          </div>
          <div class="equation-block topic-hero-equation">
            <div class="equation">${topic.heroEquation}</div>
            <p class="equation-desc">${topic.heroCaption}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section topic-section">
      <div class="container">
        ${createSectionHeader(
          "At a glance",
          "Key Ideas",
          "The three ideas to keep in view before moving into the formal details."
        )}
        <div class="topic-summary-grid">
          ${createCardGrid(topic.summaryCards)}
        </div>
      </div>
    </section>

    <section class="section section-alt topic-section">
      <div class="container">
        ${createSectionHeader(
          "Step by step",
          "Detailed Explanation",
          "Each layer builds on the previous one, from the core definition to its role in Gaussian periods."
        )}
        <div class="topic-detail-grid">
          ${createDetailGrid(topic.detailCards)}
        </div>
      </div>
    </section>

    <section class="section topic-section topic-interpretation-section">
      <div class="container">
        <div class="topic-callout">
          <p class="topic-section-eyebrow">Interpretation</p>
          <div>
            <h2>${topic.callout.title}</h2>
            <p>${topic.callout.body}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section section-alt topic-section">
      <div class="container">
        ${createSectionHeader(
          "Worked example",
          topic.example.title,
          "A concrete case that connects the notation to an exact calculation."
        )}
        <div class="topic-example-grid">
          <article class="topic-example-card">
            ${exampleParagraphs}
            <div class="topic-equation-panel">
              <div class="equation">${topic.example.equation}</div>
            </div>
          </article>
          <article class="topic-example-card">
            <h3>What to notice</h3>
            <ul class="topic-list">
              ${exampleBullets}
            </ul>
          </article>
        </div>
      </div>
    </section>

    <section class="section topic-section">
      <div class="container">
        ${createSectionHeader(
          "Further reading",
          "References",
          "Primary and university-level sources supporting the definitions and results on this page."
        )}
        <div class="reference-grid">
          ${createReferenceGrid(topic.references)}
        </div>
      </div>
    </section>

    <section class="cta-footer">
      <div class="container">
        ${createSectionHeader(
          "Next steps",
          "Continue Exploring",
          "Move between the foundation topics or put the mathematics into motion."
        )}
        ${createRelatedGrid(topicKey)}
      </div>
    </section>
  `;

  if (typeof renderMathInElement === "function") {
    renderMathInElement(mountPoint, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false }
      ],
      throwOnError: false
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("bgCanvas");
  if (canvas) {
    new CosmicBackground(canvas);
  }

  const topicKey = document.body.dataset.topic;
  renderTopicPage(topicKey);
});
