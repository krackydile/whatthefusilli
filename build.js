// Generates the site.
//   node build.js
//
// Output:
//   index.html                  the picker
//   browse/index.html           -> /browse
//   shapes/<id>/index.html      -> /shapes/bucatini   (one per shape)
//   404.html                    themed not-found page
//   dist/index.html             whole site as one self-contained file
//   browse.html, shape.html     redirect stubs for the old .html URLs
//
// Page shells live here; all content comes from js/data.js at runtime, so
// adding a pasta only needs a rebuild to mint its new URL.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = __dirname;
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const write = (p, s) => {
  const full = path.join(root, p);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, s);
};

const css = read('css/style.css');
const dataSrc = read('js/data.js');
const iconsSrc = read('js/icons.js');
const appSrc = read('js/app.js');

// Load the pasta list so we know which pages to mint.
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(dataSrc + '\nthis.PASTA = PASTA;', sandbox);
const { PASTA } = sandbox;

const FAVICON = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍝</text></svg>";
const MARK = `<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="var(--accent)" stroke-width="9" stroke-linecap="round"><path d="M22 12v76M50 12v76M78 12v76"/></g></svg>`;

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function page({ title, description, nav, main, script, footer }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<link rel="stylesheet" href="/css/style.css">
<link rel="icon" href="${FAVICON}">
</head>
<body>

<header class="site">
  <div class="wrap">
    <a class="brand" href="/">${MARK} What The Fusilli</a>
    <nav class="site">
      <a href="/"${nav === 'decide' ? ' class="active"' : ''}>Decide</a>
      <a href="/browse/"${nav === 'browse' ? ' class="active"' : ''}>Browse</a>
    </nav>
  </div>
</header>

${main}

<footer class="site">
  <div class="wrap">${footer}</div>
</footer>

<script src="/js/data.js"></script>
<script src="/js/icons.js"></script>
<script src="/js/app.js"></script>
<script>${script}</script>
</body>
</html>
`;
}

/* ---------- the picker ---------- */

const DECIDE_MAIN = `<main class="wrap">
  <section class="hero">
    <p class="eyebrow">Pasta of the day</p>
    <h1>Today, you're making this.</h1>
  </section>

  <article class="result" id="result"></article>

  <div class="reroll">
    <button class="big-btn" id="spin">
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg>
      Not feeling it? Show me another
    </button>
    <p class="spinner-note" id="note"></p>
  </div>

  <section class="mood">
    <p class="mood-label">Or go looking — what are you in the mood for?</p>
    <div class="filters" id="sauceFilters"></div>
  </section>
</main>`;

write('index.html', page({
  title: 'What The Fusilli',
  description: `One pasta shape a day, chosen for you from ${PASTA.length} of them, with what to serve it with and how it's made.`,
  nav: 'decide',
  main: DECIDE_MAIN,
  script: 'initDecider();',
  footer: `Shapes, regions and die notes for ${PASTA.length} pastas. Cook times are for dried unless noted.`
}));

/* ---------- browse ---------- */

const BROWSE_MAIN = `<main class="wrap">
  <div class="browse-head">
    <p class="eyebrow">The catalogue</p>
    <h1>Every shape</h1>
    <p class="lede">Grouped by family. Click any shape for its name, region, sauce pairings and how it's actually made.</p>
  </div>

  <div class="toolbar">
    <label class="sr-only" for="search">Search shapes</label>
    <input class="search" id="search" type="search" placeholder="Search a name, region or sauce…" autocomplete="off">
    <div class="filters" id="catFilters" style="margin:0;justify-content:flex-start"></div>
  </div>

  <div id="results"></div>
</main>`;

write('browse/index.html', page({
  title: 'Every Pasta Shape',
  description: `All ${PASTA.length} pasta shapes grouped by family, with the region, sauce pairings and production method for each.`,
  nav: 'browse',
  main: BROWSE_MAIN,
  script: 'initBrowse();',
  footer: `${PASTA.length} shapes catalogued.`
}));

/* ---------- one page per shape ---------- */

for (const p of PASTA) {
  write(`shapes/${p.id}/index.html`, page({
    title: `${p.name} — What The Fusilli`,
    description: `${p.name} (${p.pron}): ${p.meaning} From ${p.region}. ${p.die}`,
    nav: 'browse',
    main: `<main class="wrap" id="detail"></main>`,
    script: `initDetail(${JSON.stringify(p.id)});`,
    footer: `<a href="/browse/">← Back to all shapes</a>`
  }));
}

/* ---------- 404 ---------- */

write('404.html', page({
  title: 'Not on the Menu',
  description: 'That page does not exist.',
  nav: '',
  main: `<main class="wrap">
  <section class="hero">
    <p class="eyebrow">404</p>
    <h1>That shape isn't on the menu.</h1>
    <p class="lede" style="margin:14px auto 0">The page you asked for doesn't exist. The pasta still does.</p>
  </section>
  <div class="reroll" style="margin-top:26px">
    <a class="big-btn" href="/browse/" style="text-decoration:none">Browse every shape</a>
  </div>
</main>`,
  script: '',
  footer: `<a href="/">Pick a pasta instead →</a>`
}));

/* ---------- redirect stubs for the old .html URLs ---------- */

const redirect = (to, mapQuery) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<link rel="canonical" href="${to}">
<meta http-equiv="refresh" content="0; url=${to}">
<title>Redirecting…</title>
</head>
<body>
<p>This page moved to <a href="${to}">${to}</a>.</p>
${mapQuery ? `<script>
  var id = new URLSearchParams(location.search).get('id');
  location.replace(id ? '/shapes/' + encodeURIComponent(id) + '/' : '/browse/');
</script>` : ''}
</body>
</html>
`;

write('browse.html', redirect('/browse/', false));
write('shape.html', redirect('/browse/', true));

/* ---------- single-file bundle ---------- */

const bundleApp = appSrc
  .replace("const shapeHref = id => '/shapes/' + id + '/';", "const shapeHref = id => '#shape/' + id;")
  .replace("const browseHref = '/browse/';", "const browseHref = '#browse';");

if (bundleApp === appSrc) {
  throw new Error('bundle: link helpers not found in js/app.js — check the exact source lines');
}

const VIEWS = {
  decide: DECIDE_MAIN.replace(/^<main class="wrap">|<\/main>$/g, ''),
  browse: BROWSE_MAIN.replace(/^<main class="wrap">|<\/main>$/g, ''),
  shape: '<div id="detail"></div>'
};

const bundle = `<meta charset="utf-8">
<title>What The Fusilli</title>
<style>
${css}
</style>

<header class="site">
  <div class="wrap">
    <a class="brand" href="#decide">${MARK} What The Fusilli</a>
    <nav class="site">
      <a href="#decide" data-route="decide">Decide</a>
      <a href="#browse" data-route="browse">Browse</a>
    </nav>
  </div>
</header>

<main class="wrap" id="app"></main>

<footer class="site">
  <div class="wrap" id="foot"></div>
</footer>

<script>
${dataSrc}
${iconsSrc}
${bundleApp}

const VIEWS = ${JSON.stringify(VIEWS)};
const appEl = document.getElementById('app');
const footEl = document.getElementById('foot');

function router() {
  const hash = location.hash.slice(1);
  const isShape = hash.startsWith('shape/');
  const view = isShape ? 'shape' : (hash === 'browse' ? 'browse' : 'decide');

  appEl.innerHTML = VIEWS[view];
  document.title = 'What The Fusilli';

  if (view === 'shape') { initDetail(decodeURIComponent(hash.split('/')[1] || '')); }
  else if (view === 'browse') { initBrowse(); }
  else { initDecider(); }

  footEl.innerHTML = view === 'shape'
    ? '<a href="#browse">← Back to all shapes</a>'
    : (view === 'browse'
        ? PASTA.length + ' shapes catalogued.'
        : 'Shapes, regions and die notes for ' + PASTA.length +
          ' pastas. Cook times are for dried unless noted.');

  document.querySelectorAll('nav.site a').forEach(a => {
    a.classList.toggle('active', a.dataset.route === (isShape ? 'browse' : view));
  });

  window.scrollTo(0, 0);
}

addEventListener('hashchange', router);
router();
</script>
`;

write('dist/index.html', bundle);

console.log(`built: index.html, browse/, ${PASTA.length} shape pages, 404.html, dist/index.html`);
