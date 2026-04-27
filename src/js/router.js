/**
 * SPA Router — history API, page wipe transitions, nav updates, scroll reveal
 */
import { triggerReveals, animBar } from './reveals.js';
import { ensurePageLoaded } from './pageLoader.js';

const wipe = document.getElementById('page-wipe');

// Disable browser's automatic scroll restoration so we control it ourselves.
// Without this, navigating back/forward (or even some same-page navigations)
// can land the user mid-page after we've reset to top.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

function scrollToTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

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
  'ai-leadgen': 'ai-lead-generation',
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

  // 1. Lock scroll while the wipe covers the screen so the user
  //    never sees the new page render at the previous offset.
  document.documentElement.classList.add('is-page-transitioning');

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
      // 2. Reset scroll BEFORE the wipe lifts. Multiple targets cover all
      //    browsers + edge cases (overflow on body vs html).
      scrollToTop();
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

    // 3. Run scrollToTop again on the next frame — covers any layout shift
    //    or late style application that could push the page.
    requestAnimationFrame(() => {
      scrollToTop();
      // Unlock scroll once the new page is in place
      document.documentElement.classList.remove('is-page-transitioning');
    });

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

  // On full page load (refresh, direct URL hit), force scroll to top
  // so the user always lands at the hero — never mid-page.
  window.addEventListener('pageshow', () => {
    scrollToTop();
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
/**
 * Nav scroll behavior:
 *   .is-scrolled  → scrollY > 20 (CSS turns on blur background + border)
 *   .is-hidden    → scrolling DOWN past 80px (auto-hide)
 *                   removed when scrolling UP or returning near top
 */
const SCROLL_HIDE_THRESHOLD = 80;
const SCROLL_DELTA          = 6;
const SCROLL_TOP_GUARD      = 20;

let lastScrollY = 0;
let scrollTicking = false;

function applyNavScroll() {
  const nav = document.querySelector('nav');
  if (!nav) { scrollTicking = false; return; }

  const announce = document.querySelector('.lg-announce');
  const y = Math.max(0, window.scrollY);
  const delta = y - lastScrollY;

  if (y > SCROLL_TOP_GUARD) nav.classList.add('is-scrolled');
  else nav.classList.remove('is-scrolled');

  if (y > SCROLL_HIDE_THRESHOLD && delta > SCROLL_DELTA) {
    nav.classList.add('is-hidden');
  } else if (delta < -SCROLL_DELTA || y <= SCROLL_TOP_GUARD) {
    nav.classList.remove('is-hidden');
  }

  // Announce bar (only on AI Lead Gen page) follows the nav
  if (announce) {
    announce.classList.toggle('is-hidden', nav.classList.contains('is-hidden'));
  }

  lastScrollY = y;
  scrollTicking = false;
}

function onScroll() {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(applyNavScroll);
}

export function initNavScroll() {
  lastScrollY = window.scrollY;
  window.addEventListener('scroll', onScroll, { passive: true });
  onPageActivate(() => {
    const nav = document.querySelector('nav');
    const announce = document.querySelector('.lg-announce');
    if (nav) nav.classList.remove('is-hidden');
    if (announce) announce.classList.remove('is-hidden');
    lastScrollY = window.scrollY;
    applyNavScroll();
  });
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
