/**
 * Scroll-triggered reveal animations
 */
export function triggerReveals() {
  const els = document.querySelectorAll(
    '.page.active .reveal:not(.in), .page.active .reveal-l:not(.in)'
  );

  els.forEach((el) => {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
      el.classList.add('in');
    }
  });

  const bar = document.getElementById('about-bar-fill');
  if (bar && !bar._done) {
    const r = bar.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.85) {
      bar.style.width = '72%';
      bar._done = true;
    }
  }
}

export function animBar() {
  const bar = document.getElementById('about-bar-fill');
  if (bar) {
    bar._done = false;
    bar.style.width = '0';
    setTimeout(() => {
      bar.style.width = '72%';
      bar._done = true;
    }, 600);
  }
}

export function initReveals() {
  triggerReveals();
  window.addEventListener('scroll', triggerReveals, { passive: true });
}
