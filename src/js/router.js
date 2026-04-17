/**
 * SPA Router — history API, page wipe transitions, nav updates, scroll reveal
 */
import { triggerReveals, animBar } from './reveals.js';
import { ensurePageLoaded } from './pageLoader.js';

const wipe = document.getElementById('page-wipe');

// ── Route mapping: pageId <-> URL slug ──
const ROUTE_MAP = {
  home: '',
  why: 'the-why',
  work: 'work',
  services: 'services',
  industries: 'industries',
  studio: 'studio',
  careers: 'careers',
  book: 'book',
  start: 'start',
};

// Project pages: proj-shoe-guru -> work/shoe-guru
function pageIdToSlug(id) {
  if (ROUTE_MAP[id] !== undefined) return ROUTE_MAP[id];
  if (id.startsWith('proj-')) return 'work/' + id.replace('proj-', '');
  return id;
}

function slugToPageId(slug) {
  // Remove leading/trailing slashes
  slug = slug.replace(/^\/|\/$/g, '');
  if (!slug) return 'home';

  // Check main pages
  for (const [id, s] of Object.entries(ROUTE_MAP)) {
    if (s === slug) return id;
  }

  // Check project pages: work/shoe-guru -> proj-shoe-guru
  if (slug.startsWith('work/')) {
    return 'proj-' + slug.replace('work/', '');
  }

  return 'home';
}

// ── Lifecycle: cleanup callbacks run before each page change ──
const _cleanups = [];
export function registerCleanup(fn) { _cleanups.push(fn); }

// ── Page activation callbacks run after page becomes visible ──
const _activations = [];
export function onPageActivate(fn) { _activations.push(fn); }

let currentPageId = null;

export async function showPage(id, pushHistory = true) {
  if (!wipe) return;
  if (id === currentPageId) return;

  wipe.style.transition = 'transform .32s cubic-bezier(.86,0,.07,1)';
  wipe.style.transformOrigin = 'left';
  wipe.style.transform = 'scaleX(1)';

  await ensurePageLoaded(id);

  setTimeout(() => {
    _cleanups.forEach((fn) => fn(id));

    document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));

    const pg = document.getElementById('page-' + id);
    if (pg) {
      pg.classList.add('active');
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }

    currentPageId = id;

    // Update URL
    if (pushHistory) {
      const slug = pageIdToSlug(id);
      const url = '/' + slug + (slug ? '/' : '');
      history.pushState({ pageId: id }, '', url);
    }

    // Update document title
    updateDocTitle(id);
    updateNav(id);

    _activations.forEach((fn) => fn(id));

    setTimeout(() => {
      triggerReveals();
      if (id === 'home') animBar();
    }, 80);

    wipe.style.transformOrigin = 'right';
    wipe.style.transform = 'scaleX(0)';
  }, 330);
}

function updateDocTitle(id) {
  const titles = {
    home: 'AQOMI Studios | Elite Branding & Design Agency',
    why: 'The Why | AQOMI Studios',
    work: 'Work | AQOMI Studios',
    services: 'Services & Pricing | AQOMI Studios',
    industries: 'Industries | AQOMI Studios',
    studio: 'Studio | AQOMI Studios',
    careers: 'Careers | AQOMI Studios',
    book: 'Book a Call | AQOMI Studios',
  };
  document.title = titles[id] || 'AQOMI Studios';
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
 * Handle browser back/forward buttons
 */
export function initPopState() {
  window.addEventListener('popstate', (e) => {
    const id = e.state?.pageId || slugToPageId(location.pathname);
    showPage(id, false);
  });
}

/**
 * Detect current URL on initial load and show the correct page
 */
export function getInitialPageId() {
  return slugToPageId(location.pathname);
}

/**
 * Nav background on scroll — transparent on hero, blur on other pages
 */
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
  onPageActivate(() => { applyNavTheme(); setTimeout(applyNavTheme, 50); });
}

export function initLinkPrevention() {
  document.querySelectorAll('a[href="#"]').forEach((a) => {
    a.addEventListener('click', (e) => e.preventDefault());
  });
}

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
