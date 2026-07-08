# Gaussian Periods Visualizer

Interactive visualization of Gaussian periods in the complex plane. Renders points based on parametric equations involving modular arithmetic, with zoom, pan, and color filtering capabilities.

## Features

- **Computation**: Computes Gaussian period values using worker threads for non-blocking calculation
- **Visualization**: Renders complex plane with points colored by residue class modulo a chosen color count
- **Interaction**: 
  - Drag to pan, scroll/pinch to zoom
  - Double-click to reset, right-click to zoom out
  - Hover to inspect individual points
- **Export**: Download visualizations as PNG or computed data as CSV
- **History**: Navigate between previous computations with undo/redo buttons
- **URL State**: Shareable links with full application state encoded in URL parameters

## Project Structure

The codebase is modularized into focused modules:

- **`script-refactored.js`** - Entry point; orchestrates modules and event flow
- **`modules/math-utils.js`** - GCD, modular inverse, distinct point counting
- **`modules/color-utils.js`** - HSV-RGB conversion, palette generation, color mapping
- **`modules/canvas-renderer.js`** - Canvas rendering, point projection, hover grid queries
- **`modules/viewport.js`** - Zoom/pan transformations, coordinate math
- **`modules/event-handlers.js`** - Mouse, wheel, touch, resize event attachments
- **`modules/computation.js`** - Input validation, computation orchestration
- **`modules/worker-manager.js`** - Worker lifecycle management
- **`modules/url-state.js`** - URL sync, history management, status generation
- **`modules/state.js`** - Centralized mutable application state
- **`modules/hover-system.js`** - Spatial hash grid for O(1) nearest-neighbor queries

## Usage

Include in HTML:
```html
<script type="module" src="script-refactored.js"></script>
```

Parameters (in input fields or URL):
- **n** - Size of the Gaussian period (≥ 2)
- **w** - Primitive root modulo n (coprime with n)
- **colors** - Number of color classes to visualize (divides n, < n)

## Building

No build step required—uses ES modules and `mathjs` from CDN. Worker computation runs in `worker.js`.
