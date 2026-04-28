/**
 * Video Background module
 *
 * Mounts a looping video inside any element with [data-video="<key>"].
 * Lazy-mounts via IntersectionObserver, pauses when offscreen, and
 * falls back to a poster image when the user prefers reduced motion
 * or is on a save-data / 2g connection.
 *
 * Manifest below maps `data-video` keys → asset paths in /public/videos.
 */

export const MANIFEST = {
  hero: {
    mp4:    '/videos/hero.mp4',
    webm:   '/videos/hero.webm',
    poster: '/videos/hero-poster.jpg',
    pingpong: true,
  },

  // Home video bands (500px full-width) — placeholders until you generate:
  band01: {
    mp4:    '/videos/band01.mp4',
    webm:   '/videos/band01.webm',
    poster: '/videos/band01-poster.jpg',
  },
  band02: {
    mp4:    '/videos/band02.mp4',
    webm:   '/videos/band02.webm',
    poster: '/videos/band02-poster.jpg',
  },

  // Featured case study videos (one per project)
  caseTcs: {
    mp4:    '/videos/case-tcs.mp4',
    webm:   '/videos/case-tcs.webm',
    poster: '/videos/case-tcs-poster.jpg',
  },
  caseTaraxa: {
    mp4:    '/videos/case-taraxa.mp4',
    webm:   '/videos/case-taraxa.webm',
    poster: '/videos/case-taraxa-poster.jpg',
  },
  caseXyvon: {
    mp4:    '/videos/case-xyvon.mp4',
    webm:   '/videos/case-xyvon.webm',
    poster: '/videos/case-xyvon-poster.jpg',
  },
  caseGraff: {
    mp4:    '/videos/case-graff.mp4',
    webm:   '/videos/case-graff.webm',
    poster: '/videos/case-graff-poster.jpg',
  },
  caseSabean: {
    mp4:    '/videos/case-sabean.mp4',
    webm:   '/videos/case-sabean.webm',
    poster: '/videos/case-sabean-poster.jpg',
  },

  // AI Lead Generation page
  heroAi: {
    mp4:    '/videos/hero2.mp4',
    webm:   '/videos/hero2.webm',
    poster: '/videos/hero2-poster.jpg',
    pingpong: true,
  },
  // Landing Pages page
  heroLandingPages: {
    mp4:    '/videos/hero3.mp4',
    webm:   '/videos/hero3.webm',
    poster: '/videos/hero3-poster.jpg',
    pingpong: true,
  },
  // Showcase videos for landing pages page (placeholders):
  showcaseReel: {
    mp4:    '/videos/showcase-reel.mp4',
    webm:   '/videos/showcase-reel.webm',
    poster: '/videos/showcase-reel-poster.jpg',
  },
  showcaseCraft: {
    mp4:    '/videos/showcase-craft.mp4',
    webm:   '/videos/showcase-craft.webm',
    poster: '/videos/showcase-craft-poster.jpg',
  },
  // Showcase videos for the lead gen page (placeholders — generate later):
  leadgenDashboard: {
    mp4:    '/videos/leadgen-dashboard.mp4',
    webm:   '/videos/leadgen-dashboard.webm',
    poster: '/videos/leadgen-dashboard-poster.jpg',
  },
  leadgenCalendar: {
    mp4:    '/videos/leadgen-calendar.mp4',
    webm:   '/videos/leadgen-calendar.webm',
    poster: '/videos/leadgen-calendar-poster.jpg',
  },

  // Page-specific atmosphere (add as videos arrive):
  // services:   { mp4: '/videos/services-ink.mp4',     webm: '/videos/services-ink.webm',     poster: '/videos/services-ink.jpg' },
  // industries: { mp4: '/videos/industries-orbit.mp4', webm: '/videos/industries-orbit.webm', poster: '/videos/industries-orbit.jpg' },
  // why01:      { mp4: '/videos/why-lava.mp4',         webm: '/videos/why-lava.webm',         poster: '/videos/why-lava.jpg' },
  // why03:      { mp4: '/videos/why-sound.mp4',        webm: '/videos/why-sound.webm',        poster: '/videos/why-sound.jpg' },
  // careers:    { mp4: '/videos/careers-silk.mp4',     webm: '/videos/careers-silk.webm',     poster: '/videos/careers-silk.jpg' },
  // studioQuote:{ mp4: '/videos/studio-mercury.mp4',   webm: '/videos/studio-mercury.webm',   poster: '/videos/studio-mercury.jpg' },
  // outro:      { mp4: '/videos/outro-particles.mp4',  webm: '/videos/outro-particles.webm',  poster: '/videos/outro-particles.jpg' },
};

const REDUCED_MOTION = matchMedia('(prefers-reduced-motion: reduce)').matches;
const SAVE_DATA = (() => {
  const c = navigator.connection;
  if (!c) return false;
  if (c.saveData) return true;
  if (c.effectiveType === '2g' || c.effectiveType === 'slow-2g') return true;
  return false;
})();

const POSTER_ONLY = REDUCED_MOTION || SAVE_DATA;

function build(host, key) {
  const cfg = MANIFEST[key];
  if (!cfg) {
    console.warn(`[videoBackground] no manifest entry for "${key}"`);
    return null;
  }

  // Wrapper
  const wrap = document.createElement('div');
  wrap.className = 'video-bg' + (host.dataset.videoTint === 'accent' ? ' tint-accent' : '');

  // Poster (always present)
  const poster = document.createElement('div');
  poster.className = 'video-bg__poster';
  if (cfg.poster) poster.style.backgroundImage = `url(${cfg.poster})`;
  wrap.appendChild(poster);

  // Video (only if not poster-only mode)
  let video = null;
  if (!POSTER_ONLY) {
    video = document.createElement('video');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.preload = 'metadata';
    video.disablePictureInPicture = true;

    if (cfg.webm) {
      const s = document.createElement('source');
      s.src = cfg.webm;
      s.type = 'video/webm';
      video.appendChild(s);
    }
    if (cfg.mp4) {
      const s = document.createElement('source');
      s.src = cfg.mp4;
      s.type = 'video/mp4';
      video.appendChild(s);
    }

    video.addEventListener('canplay', () => {
      video.classList.add('is-ready');
      wrap.classList.add('is-playing');
    }, { once: true });

    wrap.appendChild(video);
  }

  // Overlay layers — order matters
  const scrim = document.createElement('div');
  scrim.className = 'video-bg__scrim';
  wrap.appendChild(scrim);

  const vignette = document.createElement('div');
  vignette.className = 'video-bg__vignette';
  wrap.appendChild(vignette);

  // Mount as first child so content stays above
  host.style.position = host.style.position || 'relative';
  host.insertBefore(wrap, host.firstChild);

  return { wrap, video };
}

// True only on devices with a precise pointer that supports real hover.
// Touch screens fall through to the viewport-trigger fallback so videos still play.
const SUPPORTS_HOVER = matchMedia('(hover: hover) and (pointer: fine)').matches;

function watch(host, video) {
  if (!video) return;

  const trigger = host.dataset.videoTrigger || 'viewport';

  // Hover-triggered playback (e.g. case study tiles in lead-gen pages).
  // Saves bandwidth / CPU — videos only play when the user hovers each tile.
  if (trigger === 'hover' && SUPPORTS_HOVER) {
    host.addEventListener('mouseenter', () => {
      video.play().catch(() => {});
    });
    host.addEventListener('mouseleave', () => {
      video.pause();
      // Reset to start so the next hover begins from frame 0
      try { video.currentTime = 0; } catch (_) {}
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) video.pause();
    });
    return;
  }

  // Default: viewport-triggered autoplay (heroes, video bands, mobile/touch fallback)
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        video.play().catch(() => {/* autoplay blocked, poster stays */});
      } else {
        video.pause();
      }
    }
  }, { threshold: 0.05 });
  io.observe(host);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
    else if (host.getBoundingClientRect().top < window.innerHeight) {
      video.play().catch(() => {});
    }
  });
}

export function initVideoBackgrounds(root = document) {
  const hosts = root.querySelectorAll('[data-video]');
  hosts.forEach((host) => {
    if (host.dataset.videoMounted === '1') return;
    const built = build(host, host.dataset.video);
    if (built) {
      host.dataset.videoMounted = '1';
      watch(host, built.video);
    }
  });
}
