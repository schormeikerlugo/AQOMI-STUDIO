/**
 * AQOMI Studios — Main Entry Point
 * All CSS and JS modules imported here; Vite bundles everything.
 */

// ── CSS Imports ──────────────────────────────────
import '../css/tokens.css';
import '../css/cursor.css';
import '../css/layout.css';
import '../css/backgrounds.css';
import '../css/video-bg.css';
import '../css/hero.css';
import '../css/components.css';
import '../css/pages.css';
import '../css/flowchart.css';
import '../css/jobs.css';
import '../css/voice-assistant.css';
import '../css/animations.css';
import '../css/responsive.css';
import '../css/lead-gen.css';

// ── JS Module Imports ────────────────────────────
import { loadAllPages } from './pageLoader.js';
import { initCursor } from './cursor.js';
import { showPage, initNavScroll, initLinkPrevention, initMobileNav, initPopState, getInitialPageId, onPageActivate } from './router.js';
import { initReveals, triggerReveals } from './reveals.js';
import { initEmbers } from './embers.js';
import { initCarousel } from './carousel.js';
import { initTestimonials } from './testimonials.js';
import { initFilters, initFormSubmit } from './filters.js';
import { initMeshGradients } from './meshGradient.js';
import { initFlowchart } from './flowchart.js';
import { initDotGrid } from './dotGrid.js';
import { initRoadmap } from './roadmap.js';
import { initVoiceAssistant } from './voiceAssistant.js';
import { initVideoBackgrounds } from './videoBackground.js';
import { initAqomiOutro } from './aqomiOutro.js';
import { initCaseModal } from './caseModal.js';
import { initStatCounter } from './statCounter.js';

// ── Expose showPage globally (used by onclick handlers in HTML) ──
window.showPage = showPage;

// FAQ accordion (used by onclick="toggleFaq(this)" in services.html)
window.toggleFaq = function (btn) {
  const item = btn.closest('.faq-item');
  if (item) item.classList.toggle('open');
};

// ── Initialize everything on DOM ready ───────────
document.addEventListener('DOMContentLoaded', async () => {
  // Detect which page to show from the URL
  const initialPage = getInitialPageId();

  // Load all HTML partials before initializing
  await loadAllPages();

  // Show the correct page based on URL (if not home, which is already active)
  if (initialPage !== 'home') {
    document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));
    const pg = document.getElementById('page-' + initialPage);
    if (pg) pg.classList.add('active');
  }

  // Replace initial history state
  history.replaceState({ pageId: initialPage }, '');

  // Fade in body
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity .6s';
  requestAnimationFrame(() => (document.body.style.opacity = '1'));

  // Core
  initCursor();
  initNavScroll();
  initLinkPrevention();
  initMobileNav();
  initReveals();
  initEmbers();

  // Carousels
  initCarousel({
    trackId:    'car-track',
    progressId: 'car-progress',
    counterId:  'car-counter',
    prevBtnId:  'car-prev',
    nextBtnId:  'car-next',
    sectionId:  'section-carousel',
  });

  initCarousel({
    trackId:    'pcar-track',
    progressId: 'pcar-progress',
    counterId:  'pcar-counter',
    prevBtnId:  'pcar-prev',
    nextBtnId:  'pcar-next',
  });

  // Testimonials
  initTestimonials({
    trackId:    't-track',
    dotsId:     't-dots',
    progressId: 't-progress',
    counterId:  't-counter',
    sectionSel: '.testi-section',
    prevFn:     'tPrev',
    nextFn:     'tNext',
  });

  initTestimonials({
    trackId:    'pt-track',
    dotsId:     'pt-dots',
    progressId: 'pt-progress',
    counterId:  'pt-counter',
    sectionSel: '#page-process .testi-section',
    prevFn:     'ptPrev',
    nextFn:     'ptNext',
  });

  // Filters & Forms
  initFilters();
  initFormSubmit();

  // WebGL
  initMeshGradients();

  // Video backgrounds (lazy mount via IntersectionObserver)
  initVideoBackgrounds();

  // AQOMI outro draw-on + glow
  initAqomiOutro();

  // Case study video modal
  initCaseModal();

  // Stat counter (count-up on viewport)
  initStatCounter();

  // Process page
  initFlowchart();
  initDotGrid();
  initRoadmap();

  // Voice Assistant
  initVoiceAssistant();

  // History API — back/forward buttons
  initPopState();

  // Trigger initial reveals after a brief delay
  setTimeout(triggerReveals, 400);

  // Re-bind viewport-dependent modules to anything mounted by lazy pages
  // (LAZY_PAGES are inserted ~2s after init in pageLoader.js).
  // All these inits are idempotent — they skip elements already bound.
  function rebindLazyModules() {
    initVideoBackgrounds();
    initAqomiOutro();
    initCaseModal();
    initStatCounter();
  }
  setTimeout(rebindLazyModules, 2500);

  // And again whenever the user navigates to a page (covers manual nav clicks)
  onPageActivate(rebindLazyModules);
});
