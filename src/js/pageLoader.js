/**
 * Page Loader — Dynamically loads HTML partials into the DOM
 */

const COMPONENTS = [
  { path: '/partials/components/nav.html', target: 'body', position: 'afterbegin', after: '#page-wipe' },
  { path: '/partials/components/voice-assistant.html', target: 'body', position: 'beforeend' },
];

const PAGES = [
  'home', 'work', 'services', 'process', 'studio', 'careers',
  'industries', 'start', 'book',
  'proj-rockhard', 'proj-aithr', 'proj-news930', 'proj-northbay',
  'proj-metegrity', 'proj-akogare', 'proj-spirit-halloween',
  'proj-china-southern', 'proj-weexchange', 'proj-three-streams',
  'proj-pansawan', 'proj-penta', 'proj-rocket-runner', 'proj-dhd-surfing',
  'proj-adam-trent', 'proj-operam', 'proj-visions', 'proj-wodna-wieza',
  'proj-karavan-kiev', 'proj-truckridge', 'proj-litter-robot',
  'proj-jerry-sargeant', 'proj-shoe-guru', 'proj-art-of-magic', 'proj-milk-shirts',
];

async function fetchHTML(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.text();
}

export async function loadAllPages() {
  const container = document.getElementById('page-container');

  // Load all pages in parallel
  const pagePromises = PAGES.map(async (name) => {
    const html = await fetchHTML(`/partials/pages/${name}.html`);
    return { name, html };
  });

  // Load components in parallel
  const componentPromises = COMPONENTS.map(async (comp) => {
    const html = await fetchHTML(comp.path);
    return { ...comp, html };
  });

  const [pages, components] = await Promise.all([
    Promise.all(pagePromises),
    Promise.all(componentPromises),
  ]);

  // Insert nav (before page-container)
  const navComp = components.find(c => c.path.includes('nav.html'));
  if (navComp) {
    const wipe = document.getElementById('page-wipe');
    wipe.insertAdjacentHTML('afterend', navComp.html);
  }

  // Insert pages into container
  for (const { html } of pages) {
    container.insertAdjacentHTML('beforeend', html);
  }

  // Insert voice assistant at end of body
  const vaComp = components.find(c => c.path.includes('voice-assistant'));
  if (vaComp) {
    document.body.insertAdjacentHTML('beforeend', vaComp.html);
  }

  // Activate scripts that were inserted via innerHTML (they don't execute automatically)
  activateScripts(container);
}

function activateScripts(container) {
  // Find all script tags and re-create them so they execute
  container.querySelectorAll('script').forEach((oldScript) => {
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

  // Also activate <link> stylesheets that were inserted
  container.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    const newLink = document.createElement('link');
    newLink.rel = 'stylesheet';
    newLink.href = link.href;
    document.head.appendChild(newLink);
    link.remove();
  });
}
