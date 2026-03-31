/**
 * AQOMI Studios — Main Entry Point
 * All CSS and JS modules imported here; Vite bundles everything.
 */

// ── CSS Imports ──────────────────────────────────
import '../css/tokens.css';
import '../css/cursor.css';
import '../css/layout.css';
import '../css/hero.css';
import '../css/components.css';
import '../css/pages.css';
import '../css/flowchart.css';
import '../css/jobs.css';
import '../css/voice-assistant.css';
import '../css/animations.css';

// ── JS Module Imports ────────────────────────────
import { initCursor } from './cursor.js';
import { showPage, initNavScroll, initLinkPrevention } from './router.js';
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

// ── Expose showPage globally (used by onclick handlers in HTML) ──
window.showPage = showPage;

// ── Initialize everything on DOM ready ───────────
document.addEventListener('DOMContentLoaded', () => {
  // Fade in body
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity .6s';
  requestAnimationFrame(() => (document.body.style.opacity = '1'));

  // Core
  initCursor();
  initNavScroll();
  initLinkPrevention();
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

  // Process page
  initFlowchart();
  initDotGrid();
  initRoadmap();

  // Voice Assistant
  initVoiceAssistant();

  // Trigger initial reveals after a brief delay
  setTimeout(triggerReveals, 400);
});
