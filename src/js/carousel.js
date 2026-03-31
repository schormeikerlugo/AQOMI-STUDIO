/**
 * Infinite auto-scrolling carousel — reusable for home + process pages
 *
 * @param {Object} config
 * @param {string} config.trackId      - ID of the track element
 * @param {string} config.progressId   - ID of the progress bar fill
 * @param {string} config.counterId    - ID of the counter text
 * @param {string} config.prevBtnId    - ID of the prev button
 * @param {string} config.nextBtnId    - ID of the next button
 * @param {string} config.sectionId    - ID of wrapping section (for hover pause)
 * @param {number} [config.speed=1.1]  - Pixels per frame
 */
export function initCarousel(config) {
  const track   = document.getElementById(config.trackId);
  const progEl  = document.getElementById(config.progressId);
  const cntEl   = document.getElementById(config.counterId);
  const btnPrev = document.getElementById(config.prevBtnId);
  const btnNext = document.getElementById(config.nextBtnId);

  if (!track) return;

  const speed = config.speed || 1.1;

  // Clone cards for seamless loop
  const cards = Array.from(track.querySelectorAll('.car-card'));
  const total = cards.length;
  cards.forEach((c) => track.appendChild(c.cloneNode(true)));

  let offset = 0;
  let paused = false;
  let isDragging = false;
  let startX = 0;
  let dragStart = 0;

  function totalW() {
    let w = 0;
    const allCards = track.querySelectorAll('.car-card');
    for (let i = 0; i < total; i++) {
      w += allCards[i].getBoundingClientRect().width + 28;
    }
    return w;
  }

  function applyOffset(snap) {
    track.style.transition = snap ? 'none' : '';
    track.style.transform = 'translateX(-' + offset + 'px)';

    const tw = totalW();
    if (tw > 0) {
      const pct = ((offset % tw) / tw) * 100;
      if (progEl) progEl.style.width = pct + '%';
      const cardIdx = Math.round((offset % tw) / (tw / total));
      if (cntEl) {
        cntEl.textContent =
          ('0' + (Math.max(0, cardIdx % total) + 1)).slice(-2) +
          ' / ' +
          ('0' + total).slice(-2);
      }
    }
  }

  function loop() {
    if (!paused) {
      offset += speed;
      const tw = totalW();
      if (tw > 0 && offset >= tw) {
        offset -= tw;
        applyOffset(true);
        requestAnimationFrame(() => {
          track.style.transition = '';
        });
      } else {
        applyOffset(false);
      }
    }
    requestAnimationFrame(loop);
  }

  // Pause on section hover
  if (config.sectionId) {
    const sec = document.getElementById(config.sectionId);
    if (sec) {
      sec.addEventListener('mouseenter', () => { paused = true; });
      sec.addEventListener('mouseleave', () => { if (!isDragging) paused = false; });
    }
  }

  // Arrow buttons
  function jumpBy(dir) {
    const tw = totalW();
    const cardAvg = tw / total;
    offset = Math.max(0, offset + dir * cardAvg);
    applyOffset(false);
  }

  if (btnPrev) btnPrev.addEventListener('click', () => jumpBy(-1));
  if (btnNext) btnNext.addEventListener('click', () => jumpBy(1));

  // Drag to scrub
  track.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    dragStart = offset;
    paused = true;
    track.style.transition = 'none';
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    offset = Math.max(0, dragStart - (e.clientX - startX));
    applyOffset(true);
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    paused = false;
  });

  // Touch
  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    dragStart = offset;
    paused = true;
    track.style.transition = 'none';
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    offset = Math.max(0, dragStart - (e.touches[0].clientX - startX));
    applyOffset(true);
  }, { passive: true });

  track.addEventListener('touchend', () => {
    paused = false;
  });

  // Start
  applyOffset(true);
  loop();
}
