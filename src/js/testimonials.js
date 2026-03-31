/**
 * Testimonial slider — auto-advancing with dots, progress bar, and arrows
 *
 * @param {Object} config
 * @param {string} config.trackId     - ID of the track element
 * @param {string} config.dotsId      - ID of the dots container
 * @param {string} config.progressId  - ID of the progress bar fill
 * @param {string} config.counterId   - ID of the counter text
 * @param {string} config.sectionSel  - CSS selector for the wrapping section
 * @param {string} config.prevFn      - Global function name for prev
 * @param {string} config.nextFn      - Global function name for next
 */
export function initTestimonials(config) {
  const track   = document.getElementById(config.trackId);
  const dotsEl  = document.getElementById(config.dotsId);
  const prog    = document.getElementById(config.progressId);
  const counter = document.getElementById(config.counterId);

  if (!track) return;

  const cards = track.querySelectorAll('.t-card');
  const n = cards.length;
  let cur = 0;
  let timer;
  let val = 0;
  const DELAY = 6000;
  const TICK = 50;

  // Build dots
  for (let i = 0; i < n; i++) {
    const d = document.createElement('div');
    d.style.cssText =
      'width:6px;height:6px;border-radius:50%;background:rgba(0,0,0,0.17);transition:all .35s;cursor:pointer;';
    d.addEventListener('click', () => go(i));
    dotsEl.appendChild(d);
  }

  function upd() {
    Array.from(dotsEl.children).forEach((d, i) => {
      d.style.width      = i === cur ? '22px' : '6px';
      d.style.borderRadius = i === cur ? '3px' : '50%';
      d.style.background  = i === cur ? 'var(--forge)' : 'rgba(0,0,0,0.17)';
    });
    counter.textContent = (cur + 1) + ' / ' + n;
  }

  function go(i) {
    cur = ((i % n) + n) % n;
    track.style.transform = 'translateX(-' + (cur * 100) + '%)';
    upd();
    reset();
  }

  function reset() {
    val = 0;
    prog.style.width = '0%';
    clearInterval(timer);
    timer = setInterval(() => {
      val += (TICK / DELAY) * 100;
      prog.style.width = Math.min(val, 100) + '%';
      if (val >= 100) goNext();
    }, TICK);
  }

  function goNext() { go(cur + 1); }
  function goPrev() { go(cur - 1); }

  // Expose globally for inline onclick handlers
  if (config.nextFn) window[config.nextFn] = goNext;
  if (config.prevFn) window[config.prevFn] = goPrev;

  // Pause on hover
  const sec = document.querySelector(config.sectionSel);
  if (sec) {
    sec.addEventListener('mouseenter', () => clearInterval(timer));
    sec.addEventListener('mouseleave', () => reset());
  }

  upd();
  reset();
}
