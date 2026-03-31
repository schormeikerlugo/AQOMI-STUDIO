/**
 * Generate floating ember particles in the hero
 */
export function initEmbers() {
  const wrap = document.getElementById('embers');
  if (!wrap) return;

  for (let i = 0; i < 22; i++) {
    const e = document.createElement('div');
    e.className = 'ember';
    const size = Math.random() * 3 + 1;
    e.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;--dur:${Math.random() * 12 + 6}s;--del:${Math.random() * 10}s;--op:${Math.random() * 0.35 + 0.05};--dx:${(Math.random() - 0.5) * 80}px;`;
    wrap.appendChild(e);
  }
}
