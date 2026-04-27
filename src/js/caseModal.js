/**
 * Case study video modal
 *
 * Click on any element with data-case-video="<key>" (we attach this
 * to .case-block__media in initCaseModal) opens a full-screen modal
 * playing the video at native resolution with controls.
 *
 * Closes on: backdrop click, X button, ESC key.
 * Pauses the card video while modal is open; resumes on close.
 */

import { MANIFEST } from './videoBackground.js';

let modalEl = null;
let modalVideo = null;
let lastTrigger = null;

function buildModal() {
  if (modalEl) return modalEl;

  modalEl = document.createElement('div');
  modalEl.className = 'case-modal';
  modalEl.setAttribute('aria-hidden', 'true');
  modalEl.setAttribute('role', 'dialog');
  modalEl.setAttribute('aria-modal', 'true');
  modalEl.innerHTML = `
    <button class="case-modal__close" aria-label="Close video">&times;</button>
    <div class="case-modal__inner">
      <video class="case-modal__video" controls playsinline preload="metadata"></video>
    </div>
  `;
  document.body.appendChild(modalEl);

  modalVideo = modalEl.querySelector('.case-modal__video');

  modalEl.querySelector('.case-modal__close').addEventListener('click', closeModal);
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalEl.classList.contains('is-open')) closeModal();
  });

  return modalEl;
}

function openModal(key, triggerEl) {
  const cfg = MANIFEST[key];
  if (!cfg) return;

  buildModal();
  lastTrigger = triggerEl;

  // Pause the card-level video so it doesn't compete
  const cardVideo = triggerEl?.querySelector('video');
  if (cardVideo) cardVideo.pause();

  // Reset and load fresh sources (so re-opens always restart)
  modalVideo.innerHTML = '';
  if (cfg.webm) {
    const s = document.createElement('source');
    s.src = cfg.webm;
    s.type = 'video/webm';
    modalVideo.appendChild(s);
  }
  if (cfg.mp4) {
    const s = document.createElement('source');
    s.src = cfg.mp4;
    s.type = 'video/mp4';
    modalVideo.appendChild(s);
  }
  if (cfg.poster) modalVideo.poster = cfg.poster;
  modalVideo.load();
  modalVideo.muted = false;
  modalVideo.currentTime = 0;
  modalVideo.play().catch(() => {/* user can press play */});

  modalEl.classList.add('is-open');
  modalEl.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (!modalEl) return;
  modalVideo.pause();
  modalEl.classList.remove('is-open');
  modalEl.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  // Resume the card video if still in viewport
  if (lastTrigger) {
    const cardVideo = lastTrigger.querySelector('video');
    if (cardVideo) {
      const rect = lastTrigger.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        cardVideo.play().catch(() => {});
      }
    }
    lastTrigger = null;
  }
}

export function initCaseModal() {
  const targets = document.querySelectorAll('.case-block__media[data-video]');
  targets.forEach((el) => {
    if (el.dataset.modalBound === '1') return;
    el.dataset.modalBound = '1';
    el.classList.add('is-clickable');
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', 'Play case study video');

    el.addEventListener('click', () => {
      openModal(el.dataset.video, el);
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(el.dataset.video, el);
      }
    });
  });
}
