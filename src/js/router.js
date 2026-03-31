/**
 * SPA Router — page wipe transitions, nav updates, scroll reveal
 */
import { triggerReveals, animBar } from './reveals.js';

const wipe = document.getElementById('page-wipe');

export function showPage(id) {
  if (!wipe) return;

  wipe.style.transition = 'transform .32s cubic-bezier(.86,0,.07,1)';
  wipe.style.transformOrigin = 'left';
  wipe.style.transform = 'scaleX(1)';

  setTimeout(() => {
    document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));

    const pg = document.getElementById('page-' + id);
    if (pg) {
      pg.classList.add('active');
      window.scrollTo({ top: 0 });
    }

    updateNav(id);

    setTimeout(() => {
      triggerReveals();
      if (id === 'home') animBar();
    }, 80);

    wipe.style.transformOrigin = 'right';
    wipe.style.transform = 'scaleX(0)';
  }, 330);
}

function updateNav(id) {
  document.querySelectorAll('.nav-link:not(.nav-cta)').forEach((l) => {
    l.classList.remove('active-page');
  });

  const map = {
    work: 'Work',
    industries: 'Industries',
    services: 'Services',
    process: 'Process',
    studio: 'Studio',
    careers: 'Careers',
  };

  if (map[id]) {
    document.querySelectorAll('.nav-link').forEach((l) => {
      if (l.textContent.trim() === map[id]) {
        l.classList.add('active-page');
      }
    });
  }
}

/**
 * Nav background on scroll — transparent on hero, blur on other pages
 */
export function initNavScroll() {
  window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (!nav) return;

    const onHero = document.getElementById('page-home')?.classList.contains('active');

    if (!onHero) {
      nav.style.background = window.scrollY > 20 ? 'rgba(255,255,255,0.96)' : 'transparent';
      nav.style.backdropFilter = window.scrollY > 20 ? 'blur(12px)' : 'none';
      nav.style.borderBottom = window.scrollY > 20 ? '1px solid rgba(0,0,0,0.08)' : 'none';
    } else {
      nav.style.background = 'transparent';
      nav.style.backdropFilter = 'none';
      nav.style.borderBottom = 'none';
    }
  });
}

/**
 * Prevent default for all # links
 */
export function initLinkPrevention() {
  document.querySelectorAll('a[href="#"]').forEach((a) => {
    a.addEventListener('click', (e) => e.preventDefault());
  });
}
