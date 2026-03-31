/**
 * Custom cursor — dot + ring that follow the pointer
 */
export function initCursor() {
  const cur  = document.getElementById('cur');
  const ring = document.getElementById('cur-r');
  if (!cur || !ring) return;

  // Only show on non-touch devices
  if ('ontouchstart' in window) {
    cur.style.display = 'none';
    ring.style.display = 'none';
    return;
  }

  cur.style.display = 'block';
  ring.style.display = 'block';

  let mx = 0;
  let my = 0;
  let rx = 0;
  let ry = 0;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    cur.style.left = mx + 'px';
    cur.style.top  = my + 'px';
  });

  function animateRing() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  }

  animateRing();
}
