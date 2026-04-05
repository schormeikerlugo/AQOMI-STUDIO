/**
 * SPA Router — page wipe transitions, nav updates, scroll reveal
 */
import { triggerReveals, animBar } from './reveals.js';
import { ensurePageLoaded } from './pageLoader.js';

const wipe = document.getElementById('page-wipe');

// ── Lifecycle: cleanup callbacks run before each page change ──
const _cleanups = [];
export function registerCleanup(fn) { _cleanups.push(fn); }

// ── Page activation callbacks run after page becomes visible ──
const _activations = [];
export function onPageActivate(fn) { _activations.push(fn); }

export async function showPage(id) {
  if (!wipe) return;

  wipe.style.transition = 'transform .32s cubic-bezier(.86,0,.07,1)';
  wipe.style.transformOrigin = 'left';
  wipe.style.transform = 'scaleX(1)';

  // Ensure the page HTML is loaded before transitioning
  await ensurePageLoaded(id);

  setTimeout(() => {
    // Run all cleanup callbacks before switching
    _cleanups.forEach((fn) => fn(id));

    document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));

    const pg = document.getElementById('page-' + id);
    if (pg) {
      pg.classList.add('active');
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }

    updateNav(id);

    // Run activation callbacks
    _activations.forEach((fn) => fn(id));

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
    studio: 'Studio',
    why: 'The Why',
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
// Dark pages where nav should be white text
const DARK_PAGES = ['work'];

function applyNavTheme() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  const onHome = document.getElementById('page-home')?.classList.contains('active');
  const onDark = DARK_PAGES.some((p) => document.getElementById('page-' + p)?.classList.contains('active'));

  if (onHome) {
    nav.style.background = 'transparent';
    nav.style.backdropFilter = 'none';
    nav.style.borderBottom = 'none';
    nav.classList.remove('nav-dark');
  } else if (onDark) {
    nav.classList.add('nav-dark');
    nav.style.background = window.scrollY > 20 ? 'rgba(0,0,0,0.92)' : 'transparent';
    nav.style.backdropFilter = window.scrollY > 20 ? 'blur(12px)' : 'none';
    nav.style.borderBottom = window.scrollY > 20 ? '1px solid rgba(255,255,255,0.08)' : 'none';
  } else {
    nav.classList.remove('nav-dark');
    nav.style.background = window.scrollY > 20 ? 'rgba(255,255,255,0.96)' : 'transparent';
    nav.style.backdropFilter = window.scrollY > 20 ? 'blur(12px)' : 'none';
    nav.style.borderBottom = window.scrollY > 20 ? '1px solid rgba(0,0,0,0.08)' : 'none';
  }
}

export function initNavScroll() {
  window.addEventListener('scroll', applyNavTheme, { passive: true });
  // Apply immediately on page change + slightly after scroll resets
  onPageActivate(() => { applyNavTheme(); setTimeout(applyNavTheme, 50); });
}

/**
 * Prevent default for all # links
 */
export function initLinkPrevention() {
  document.querySelectorAll('a[href="#"]').forEach((a) => {
    a.addEventListener('click', (e) => e.preventDefault());
  });
}

/**
 * Mobile nav toggle
 */
export function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    links.classList.toggle('open');
  });

  links.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      toggle.classList.remove('open');
      links.classList.remove('open');
    });
  });
}
