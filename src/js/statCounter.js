/**
 * Stat counter — animates numbers from 0 to data-target when the element
 * scrolls into view. Supports optional prefix/suffix.
 *
 * Markup:
 *   <span class="stat-count" data-target="93000" data-prefix="$" data-suffix="">$0</span>
 *   <span class="stat-count" data-target="30" data-suffix="+">0+</span>
 *   <span class="stat-count" data-target="5" data-suffix="×">0×</span>
 *
 * The element's text content is replaced as it counts.
 */

const DURATION = 1400;            // ms
const EASING = (t) => 1 - Math.pow(1 - t, 3);   // easeOutCubic

function format(n, decimals) {
  if (decimals > 0) return n.toFixed(decimals);
  if (n >= 1000) return Math.round(n).toLocaleString('en-US');
  return Math.round(n).toString();
}

function animate(el) {
  if (el.dataset.counted === '1') return;
  el.dataset.counted = '1';

  const target   = parseFloat(el.dataset.target || '0');
  const prefix   = el.dataset.prefix || '';
  const suffix   = el.dataset.suffix || '';
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  const start    = performance.now();

  function tick(now) {
    const t = Math.min(1, (now - start) / DURATION);
    const v = target * EASING(t);
    el.textContent = `${prefix}${format(v, decimals)}${suffix}`;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

let _io = null;
function ensureObserver() {
  if (_io) return _io;
  _io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        animate(entry.target);
        _io.unobserve(entry.target);
      }
    }
  }, { threshold: 0.4 });
  return _io;
}

function finalText(el) {
  const t = parseFloat(el.dataset.target || '0');
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  return `${prefix}${format(t, decimals)}${suffix}`;
}

/**
 * Reserve the width of the FINAL value before the count-up starts so the
 * surrounding layout (grid columns, neighboring text) doesn't shift as
 * digits get added.
 *
 * Two strategies:
 *   - If the .stat-count span has siblings (e.g. <em>%</em> next to it),
 *     reserve min-width on the PARENT — otherwise the span goes inline-block
 *     and pushes the sibling onto a new line.
 *   - Otherwise the span itself holds the reserve.
 */
function reserveWidth(el) {
  if (el.dataset.statReserved === '1') return;
  const initialText = el.textContent;
  el.style.fontVariantNumeric = 'tabular-nums';
  el.textContent = finalText(el);

  const parent = el.parentElement;
  const hasSiblings = parent && parent.children.length > 1;

  if (hasSiblings) {
    // Reserve on parent — keeps siblings inline alongside the span
    const parentW = parent.getBoundingClientRect().width;
    parent.style.minWidth = parentW + 'px';
  } else {
    // Span owns the reserve directly
    el.style.display = 'inline-block';
    el.style.textAlign = 'left';
    const w = el.getBoundingClientRect().width;
    el.style.minWidth = w + 'px';
  }

  el.textContent = initialText;
  el.dataset.statReserved = '1';
}

export function initStatCounter() {
  // Idempotent — safe to re-run after lazy pages load or on page activation
  const targets = document.querySelectorAll('.stat-count:not([data-stat-bound])');
  if (!targets.length) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    targets.forEach((el) => {
      el.dataset.statBound = '1';
      el.textContent = finalText(el);
    });
    return;
  }

  const io = ensureObserver();
  targets.forEach((el) => {
    el.dataset.statBound = '1';
    reserveWidth(el);
    io.observe(el);
  });
}
