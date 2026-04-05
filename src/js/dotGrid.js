/**
 * Animated dot grid canvas for the process page
 * Only runs RAF when the process page is active
 * Resilient to lazy loading
 */
import { onPageActivate } from './router.js';

let gridInitialized = false;
let rafId = null;
let running = false;

function setupGrid() {
  if (gridInitialized) return;

  const canvas = document.getElementById('proc-canvas');
  if (!canvas) return;

  gridInitialized = true;

  const ctx = canvas.getContext('2d');
  let dots = [];
  let t = 0;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    buildGrid();
  }

  function buildGrid() {
    dots = [];
    const spacing = 36;
    const cols = Math.ceil(canvas.width / spacing) + 1;
    const rows = Math.ceil(canvas.height / spacing) + 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({
          x: c * spacing,
          y: r * spacing,
          baseR: Math.random() * 0.8 + 0.3,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.4 + 0.2,
        });
      }
    }
  }

  function draw() {
    if (!running) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    t += 0.008;

    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      const pulse = Math.sin(t * d.speed + d.phase) * 0.5 + 0.5;
      const r = d.baseR + pulse * 0.7;
      const alpha = 0.08 + pulse * 0.18;

      ctx.beginPath();
      ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,' + alpha + ')';
      ctx.fill();
    }

    rafId = requestAnimationFrame(draw);
  }

  window.startDotGrid = function() {
    if (running) return;
    running = true;
    rafId = requestAnimationFrame(draw);
  };

  window.stopDotGrid = function() {
    running = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  };

  resize();
  window.addEventListener('resize', resize);

  // Start if process page is already active
  const processPage = document.getElementById('page-why');
  if (processPage && processPage.classList.contains('active')) {
    window.startDotGrid();
  }
}

export function initDotGrid() {
  // Try immediately
  setupGrid();

  // On page change
  onPageActivate((pageId) => {
    if (pageId === 'why') {
      setupGrid(); // ensure initialized
      if (window.startDotGrid) window.startDotGrid();
    } else {
      if (window.stopDotGrid) window.stopDotGrid();
    }
  });

  // Pause when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (window.stopDotGrid) window.stopDotGrid();
    } else {
      const pp = document.getElementById('page-why');
      if (pp && pp.classList.contains('active') && window.startDotGrid) {
        window.startDotGrid();
      }
    }
  });
}
