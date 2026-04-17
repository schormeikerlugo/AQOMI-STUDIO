/**
 * Pre-rendering script — generates static HTML for each page
 * Run after `vite build` to create SEO-friendly pages
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const PARTIALS = resolve(ROOT, 'public/partials/pages');
const COMPONENTS = resolve(ROOT, 'public/partials/components');

// Load page metadata
const pageMeta = JSON.parse(readFileSync(resolve(__dirname, 'page-meta.json'), 'utf-8'));

// Read the built index.html to extract asset references
const builtIndex = readFileSync(resolve(DIST, 'index.html'), 'utf-8');

// Extract CSS and JS asset paths from built index
const cssMatch = builtIndex.match(/<link rel="stylesheet"[^>]*href="([^"]+)"/);
const jsMatch = builtIndex.match(/<script type="module"[^>]*src="([^"]+)"/);
const cssPath = cssMatch ? cssMatch[1] : '/assets/index.css';
const jsPath = jsMatch ? jsMatch[1] : '/assets/index.js';

// Read nav component
const navHtml = readFileSync(resolve(COMPONENTS, 'nav.html'), 'utf-8');

// Build route map: pageId -> slug
const ROUTE_MAP = {};
for (const [id, meta] of Object.entries(pageMeta)) {
  ROUTE_MAP[id] = meta.slug;
}

function generateHTML(pageId, pageContent, meta) {
  const isHome = pageId === 'home';

  // Mark this page as active in the content
  const activeContent = pageContent.replace(
    /class="page"/,
    'class="page active"'
  ).replace(
    /class="page /,
    'class="page active '
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<link rel="icon" type="image/png" href="/favicon.png">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${meta.title}</title>
<meta name="description" content="${meta.description}">
<meta property="og:title" content="${meta.title}">
<meta property="og:description" content="${meta.description}">
<meta property="og:url" content="https://aqomi.xyz/${meta.slug}">
<meta property="og:type" content="website">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://aqomi.xyz/${meta.slug}">
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-PYX7EYZZWZ"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-PYX7EYZZWZ');
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Instrument+Sans:ital,wght@0,400;0,500;0,700;1,400&family=DM+Mono:wght@300;400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${cssPath}">
</head>
<body>
<div id="cur" style="display:none;"></div>
<div id="cur-r" style="display:none;"></div>
<div id="page-wipe"></div>

${navHtml}

<div id="page-container">
${activeContent}
</div>

<script type="module" src="${jsPath}"></script>
</body>
</html>`;
}

// Generate pre-rendered pages
let count = 0;

for (const [pageId, meta] of Object.entries(pageMeta)) {
  const partialFile = resolve(PARTIALS, `${pageId}.html`);
  if (!existsSync(partialFile)) {
    console.warn(`  SKIP: ${pageId} (file not found)`);
    continue;
  }

  const pageContent = readFileSync(partialFile, 'utf-8');
  const html = generateHTML(pageId, pageContent, meta);

  // Determine output path
  let outDir, outFile;
  if (pageId === 'home') {
    outDir = DIST;
    outFile = resolve(DIST, 'index.html');
  } else {
    outDir = resolve(DIST, meta.slug);
    outFile = resolve(outDir, 'index.html');
  }

  mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, html, 'utf-8');
  count++;

  const slug = meta.slug || '/';
  console.log(`  ✓ /${slug}`);
}

console.log(`\n  Pre-rendered ${count} pages.`);
