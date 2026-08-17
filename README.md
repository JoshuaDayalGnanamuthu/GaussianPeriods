# Gaussian Periods Visualizer

Gaussian Periods Visualizer is a small static web project for exploring Gaussian periods in the complex plane.

It includes:

- a landing page that introduces the math in a more visual, approachable way
- an interactive visualizer for plotting and inspecting points
- a gallery of example parameter sets you can jump into directly

The goal is simple: make a fairly abstract number-theory object feel concrete, explorable, and a little beautiful.

## What You Can Do

- Plot Gaussian periods from your own `n`, `omega`, and `colors` values
- Pan, zoom, box-zoom, and reset the view
- Hover over points to inspect coordinates
- Track a specific `k` with both an input box and a slider
- Animate the plot point-by-point with adjustable speed
- Filter the view by color groups using the preview strip
- Download the current plot as a PNG
- Download the computed data as a CSV
- Share a state through URL parameters

For larger computations, the visualizer now shows a loading placeholder instead of leaving the canvas blank, so it feels clearer when work is in progress.

## Project Layout

- `index.html`  
  The landing page with the math overview, animated demos, and gallery.

- `visualizer.html`  
  The main interactive plotting interface.

- `landing.js` / `landing-styles.css`  
  Logic and styling for the homepage experience.

- `script-refactored.js` / `styles.css`  
  Logic and styling for the visualizer.

- `worker.js`  
  Runs the Gaussian period computation off the main thread.

- `modules/`  
  Smaller focused modules for rendering, state, events, math helpers, viewport logic, and URL state.

- `images/`  
  Gallery images, favicon/title image, and UI assets.

## Quick Start

This project does not need a build step.

1. Open `index.html` to browse the landing page, or open `visualizer.html` directly.
2. Enter values for:
   - `n`
   - `omega`
   - `colors`
3. Click `Plot`.

If you want the browser to behave more consistently with modules and local assets, it is still a good idea to serve the folder through a simple local server.

## Input Notes

- `n` should be an integer with `n >= 2`
- `omega` should be an integer with `omega >= 1`
- `omega` must be coprime to `n`
- `colors` must be a positive proper divisor of `n`

If an input is invalid, the visualizer explains the issue in the summary panel.

## Interaction Cheatsheet

- Drag: pan
- Scroll or pinch: zoom
- Double-click: reset view
- Right-click: zoom out
- Hover: inspect a nearby point
- Enter: plot current values
- Left/right arrows: move through selected color groups

## A Few Nice Touches

- The homepage gallery now has page dots and arrow controls for easier browsing
- Gallery cards are square for a cleaner grid
- The favicon/title image is now circular with real transparency
- The status area in the visualizer has been restyled to fit the rest of the app better

## Why It’s Organized This Way

The visualizer started as a single script and has been split into smaller modules so the rendering logic, event handling, computation, and state management are easier to reason about independently.

That makes it easier to keep experimenting with the interface without turning the math code into a mess.

## Deployment

The site is static and works well with GitHub Pages.

If a Pages deployment fails even though the build succeeds, it may be a GitHub-side deployment issue rather than a problem in the site itself. In that case, re-running the deployment is often enough.
