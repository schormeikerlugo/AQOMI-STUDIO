/**
 * AQOMI outro animation
 *
 * Adds .is-drawn to .outro-aqomi when it scrolls into view.
 * CSS handles the draw-on stroke + glow pulse animations.
 * Once drawn, the observer disconnects — no further work.
 */

let _io = null;

function ensureObserver() {
  if (_io) return _io;
  _io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-drawn');
        _io.unobserve(entry.target);
      }
    }
  }, {
    threshold: 0.25,
    rootMargin: '0px 0px -10% 0px',
  });
  return _io;
}

export function initAqomiOutro() {
  // Catches both the original .outro-aqomi and the generalized .monument-svg variants.
  // Idempotent — pages loaded lazily can call this on activation.
  const targets = document.querySelectorAll(
    '.outro-aqomi:not([data-aqomi-bound]), .monument-svg:not([data-aqomi-bound])'
  );
  if (!targets.length) return;

  const io = ensureObserver();
  targets.forEach((el) => {
    el.dataset.aqomiBound = '1';
    io.observe(el);
  });
}
