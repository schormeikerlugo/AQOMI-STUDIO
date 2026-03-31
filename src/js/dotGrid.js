/**
 * Animated dot grid canvas for the process page
 */
export function initDotGrid() {
  const canvas = document.getElementById('proc-canvas');
  if (!canvas) return;

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
    // Only run when process page is visible
    const processPage = document.getElementById('page-process');
    if (!processPage || !processPage.classList.contains('active')) {
      requestAnimationFrame(draw);
      return;
    }

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

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
}
