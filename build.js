// Bundles the multi-page site into one self-contained HTML file for sharing.
//   node build.js   ->   dist/index.html
// Page links become hash routes so the whole site works from a single file.

const fs = require('fs');
const path = require('path');

const root = __dirname;
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

const css = read('css/style.css');
const data = read('js/data.js');
const icons = read('js/icons.js');

const app = read('js/app.js')
  .replace(/shape\.html\?id=/g, '#shape/')
  .replace(/href="browse\.html"/g, 'href="#browse"')
  .replace(
    "new URLSearchParams(location.search).get('id')",
    "decodeURIComponent(location.hash.split('/')[1] || '')"
  );

const MARK = `<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="var(--accent)" stroke-width="9" stroke-linecap="round"><path d="M22 12v76M50 12v76M78 12v76"/></g></svg>`;

const VIEWS = {
  decide: `
    <section class="hero">
      <p class="eyebrow">Today's answer</p>
      <h1>Here's your pasta.</h1>
    </section>

    <article class="result" id="result"></article>

    <div class="reroll">
      <button class="big-btn" id="spin">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg>
        Not feeling this shape? Try another
      </button>
      <p class="spinner-note" id="note"></p>
    </div>

    <section class="mood">
      <p class="mood-label">Or steer it — what are you in the mood for?</p>
      <div class="filters" id="sauceFilters"></div>
    </section>`,

  browse: `
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

    <div id="results"></div>`,

  shape: `<div id="detail"></div>`
};

const html = `<meta charset="utf-8">
<title>What The Fusilli</title>
<style>
${css}
.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
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
${data}
${icons}
${app}

const VIEWS = ${JSON.stringify(VIEWS)};
const appEl = document.getElementById('app');
const footEl = document.getElementById('foot');

function router() {
  const hash = location.hash.slice(1);
  const isShape = hash.startsWith('shape/');
  const view = isShape ? 'shape' : (hash === 'browse' ? 'browse' : 'decide');

  appEl.innerHTML = VIEWS[view];
  document.title = 'What The Fusilli';

  if (view === 'shape') { initDetail(); }
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

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/index.html'), html);
console.log('dist/index.html —', (html.length / 1024).toFixed(0) + 'kb,', PASTA_COUNT(), 'shapes');

function PASTA_COUNT() {
  return (data.match(/^\s{4}id: '/gm) || []).length;
}
