/**
 * Process page roadmap — staggered card reveal with SVG connecting path
 */
export function initRoadmap() {
  const procPage = document.getElementById('page-process');
  if (!procPage) return;

  let done = false;

  function init() {
    if (done) return;
    done = true;

    const grid   = document.getElementById('rm-grid');
    const svg    = document.getElementById('rm-svg');
    const pathEl = document.getElementById('rm-path');
    if (!grid || !svg || !pathEl) return;

    const steps = grid.querySelectorAll('.rm-step');

    function build() {
      const gr = grid.getBoundingClientRect();
      if (gr.width === 0) {
        setTimeout(build, 100);
        return;
      }

      // Collect card centers
      const c = [];
      steps.forEach((s) => {
        const r = s.getBoundingClientRect();
        c.push({
          x: r.left - gr.left + r.width * 0.5,
          y: r.top - gr.top + r.height * 0.5,
        });
      });

      // Build snake path
      const gap = c[1].x - c[0].x;
      const ex = c[2].x + gap * 0.38;
      const sx = c[3].x - gap * 0.38;
      const midY = (c[2].y + c[3].y) / 2;

      const d =
        'M' + c[0].x + ' ' + c[0].y +
        ' L' + c[1].x + ' ' + c[1].y +
        ' L' + c[2].x + ' ' + c[2].y +
        ' C' + ex + ' ' + c[2].y + ' ' + ex + ' ' + midY + ' ' + (ex + sx) / 2 + ' ' + midY +
        ' C' + sx + ' ' + midY + ' ' + sx + ' ' + c[3].y + ' ' + c[3].x + ' ' + c[3].y +
        ' L' + c[4].x + ' ' + c[4].y +
        ' L' + c[5].x + ' ' + c[5].y;

      pathEl.setAttribute('d', d);
      svg.setAttribute('width', gr.width);
      svg.setAttribute('height', gr.height);

      const len = pathEl.getTotalLength();
      pathEl.style.strokeDasharray = len;
      pathEl.style.strokeDashoffset = len;

      const obs = new IntersectionObserver(
        (entries) => {
          if (!entries[0].isIntersecting) return;
          obs.disconnect();

          steps.forEach((s, i) => {
            setTimeout(() => s.classList.add('rm-vis'), i * 180);
          });

          setTimeout(() => {
            pathEl.style.transition = 'stroke-dashoffset 2s cubic-bezier(.4,0,.2,1)';
            pathEl.style.strokeDashoffset = '0';
          }, 200);
        },
        { threshold: 0.15 }
      );

      obs.observe(grid);
    }

    build();
  }

  // Trigger when process page becomes active
  if (procPage.classList.contains('active')) {
    setTimeout(init, 80);
  } else {
    new MutationObserver(() => {
      if (procPage.classList.contains('active')) init();
    }).observe(procPage, { attributes: true, attributeFilter: ['class'] });
  }
}
