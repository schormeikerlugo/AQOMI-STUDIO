/**
 * Page Loader — Loads essential pages on init, others on-demand
 */

const COMPONENTS = [
  { path: '/partials/components/nav.html', target: 'body', position: 'afterbegin', after: '#page-wipe' },
  { path: '/partials/components/voice-assistant.html', target: 'body', position: 'beforeend' },
];

// Pages loaded immediately (essential for first view)
const EAGER_PAGES = ['home'];

// All other pages — loaded on demand
const LAZY_PAGES = [
  'work', 'services', 'process', 'studio', 'careers',
  'industries', 'start', 'book', 'why',
  'proj-rockhard', 'proj-aithr', 'proj-news930', 'proj-northbay',
  'proj-metegrity', 'proj-akogare', 'proj-spirit-halloween',
  'proj-china-southern', 'proj-weexchange', 'proj-three-streams',
  'proj-pansawan', 'proj-penta', 'proj-rocket-runner', 'proj-dhd-surfing',
  'proj-adam-trent', 'proj-operam', 'proj-visions', 'proj-wodna-wieza',
  'proj-karavan-kiev', 'proj-truckridge', 'proj-litter-robot',
  'proj-jerry-sargeant', 'proj-shoe-guru', 'proj-art-of-magic', 'proj-milk-shirts',
];

const loadedPages = new Set();

async function fetchHTML(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.text();
}

function activateScripts(el) {
  el.querySelectorAll('script').forEach((oldScript) => {
    const newScript = document.createElement('script');
    if (oldScript.src) {
      newScript.src = oldScript.src;
      newScript.async = oldScript.async;
    } else {
      newScript.textContent = oldScript.textContent;
    }
    if (oldScript.type) newScript.type = oldScript.type;
    oldScript.parentNode.replaceChild(newScript, oldScript);
  });

  el.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    const newLink = document.createElement('link');
    newLink.rel = 'stylesheet';
    newLink.href = link.href;
    document.head.appendChild(newLink);
    link.remove();
  });
}

async function insertPage(container, name) {
  if (loadedPages.has(name)) return;
  loadedPages.add(name);
  const html = await fetchHTML(`/partials/pages/${name}.html`);
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  // Insert into container
  while (wrapper.firstChild) {
    container.appendChild(wrapper.firstChild);
  }
  activateScripts(container);
}

export async function loadAllPages() {
  const container = document.getElementById('page-container');

  // Load components in parallel
  const componentPromises = COMPONENTS.map(async (comp) => {
    const html = await fetchHTML(comp.path);
    return { ...comp, html };
  });

  // Load eager pages in parallel
  const eagerPromises = EAGER_PAGES.map(async (name) => {
    const html = await fetchHTML(`/partials/pages/${name}.html`);
    return { name, html };
  });

  const [components, eagerPages] = await Promise.all([
    Promise.all(componentPromises),
    Promise.all(eagerPromises),
  ]);

  // Insert nav
  const navComp = components.find(c => c.path.includes('nav.html'));
  if (navComp) {
    const wipe = document.getElementById('page-wipe');
    wipe.insertAdjacentHTML('afterend', navComp.html);
  }

  // Insert eager pages
  for (const { name, html } of eagerPages) {
    loadedPages.add(name);
    container.insertAdjacentHTML('beforeend', html);
  }

  // Insert voice assistant
  const vaComp = components.find(c => c.path.includes('voice-assistant'));
  if (vaComp) {
    document.body.insertAdjacentHTML('beforeend', vaComp.html);
  }

  activateScripts(container);

  // Preload remaining pages after a delay (low priority, non-blocking)
  setTimeout(() => {
    LAZY_PAGES.forEach((name) => insertPage(container, name));
  }, 2000);
}

/**
 * Ensure a page is loaded before showing it.
 * Called by router before page transition.
 */
export async function ensurePageLoaded(pageId) {
  if (loadedPages.has(pageId)) return;
  const container = document.getElementById('page-container');
  await insertPage(container, pageId);
}
