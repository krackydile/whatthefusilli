const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Link builders. build.js swaps these two for hash routes in the single-file bundle.
const shapeHref = id => '/shapes/' + id + '/';
const browseHref = '/browse/';

function metaRow(p) {
  return `<dl class="meta">
    <div><dt>Family</dt><dd>${CATEGORIES[p.cat].label}</dd></div>
    <div><dt>Cook time</dt><dd>${esc(p.cook)}</dd></div>
    <div><dt>Home region</dt><dd>${esc(p.region)}</dd></div>
    <div><dt>How it's made</dt><dd>${METHODS[p.method]}</dd></div>
  </dl>`;
}

/* ---------------- decider ---------------- */

function gcd(a, b) { while (b) { const t = b; b = a % b; a = t; } return a; }

/* The pasta of the day. Everyone gets the same shape on the same date, and it
   holds all day no matter how often you reload.

   Stepping through the list by a number coprime with its length visits every
   shape exactly once before any repeat — so the site works through all 49 over
   49 days rather than showing the same one twice in a week, which is what a
   plain hash-the-date would do. */
function pastaOfTheDay(list, when) {
  const d = when || new Date();
  const day = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  const n = list.length;
  const step = [23, 17, 13, 11, 29, 31, 37, 41, 43, 47, 1].find(k => gcd(k, n) === 1);
  return list[((day * step) % n + n) % n];
}

function initDecider() {
  const wrap = document.getElementById('sauceFilters');
  const note = document.getElementById('note');
  const result = document.getElementById('result');
  const chosen = new Set();
  const todays = pastaOfTheDay(PASTA);
  let showing = null;

  wrap.innerHTML = Object.entries(SAUCE_TAGS)
    .map(([k, v]) => `<button class="chip" data-tag="${k}" aria-pressed="false">${esc(v)}</button>`)
    .join('');

  wrap.addEventListener('click', e => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    const tag = btn.dataset.tag;
    if (chosen.has(tag)) { chosen.delete(tag); btn.setAttribute('aria-pressed', 'false'); }
    else { chosen.add(tag); btn.setAttribute('aria-pressed', 'true'); }
    updateNote();
    show(randomFrom(pool()), false, false);
  });

  function pool() {
    if (!chosen.size) return PASTA;
    return PASTA.filter(p => [...chosen].some(t => p.sauces.includes(t)));
  }

  function updateNote() {
    const n = pool().length;
    note.textContent = chosen.size
      ? `${n} shape${n === 1 ? '' : 's'} match what you're after.`
      : '';
  }

  function randomFrom(list) {
    let candidates = list;
    if (list.length > 1 && showing) {
      const without = list.filter(p => p.id !== showing.id);
      if (without.length) candidates = without;
    }
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  function backToToday() {
    chosen.clear();
    wrap.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', 'false'));
    updateNote();
    show(todays, true, false);
  }

  function show(p, isToday, scroll) {
    if (!p) { result.innerHTML = ''; result.classList.remove('show'); return; }
    showing = p;

    const dateLabel = new Date().toLocaleDateString(undefined,
      { weekday: 'long', day: 'numeric', month: 'long' });

    result.classList.remove('show');
    result.innerHTML = `
      <div class="result-top">
        <div class="art">${pastaSVG(p.icon)}</div>
        <div>
          <p class="eyebrow">${isToday ? esc(dateLabel) : 'Just browsing'}</p>
          <h2>${esc(p.name)}</h2>
          <p class="pron">${esc(p.pron)} · ${esc(p.meaning)}</p>
        </div>
      </div>
      <div class="result-body">
        ${metaRow(p)}
        <p><strong>Serve it with:</strong> ${esc(p.best)}</p>
        <p style="margin-top:18px">
          <a href="${shapeHref(p.id)}">Read how ${esc(p.name.split(' /')[0])} is made →</a>
        </p>
        ${isToday ? '' : `<p style="margin-top:10px">
          <a href="#" id="back-to-today">← Back to today's pasta</a>
        </p>`}
      </div>`;
    void result.offsetWidth;
    result.classList.add('show');

    const back = document.getElementById('back-to-today');
    if (back) back.addEventListener('click', e => { e.preventDefault(); backToToday(); });

    if (scroll) result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  document.getElementById('spin').addEventListener('click', () => show(randomFrom(pool()), false, true));
  show(todays, true, false);
}

/* ---------------- browse ---------------- */

function initBrowse() {
  const filters = document.getElementById('catFilters');
  const out = document.getElementById('results');
  const search = document.getElementById('search');
  let cat = 'all';

  filters.innerHTML = `<button class="chip" data-cat="all" aria-pressed="true">All</button>` +
    Object.entries(CATEGORIES).map(([k, v]) =>
      `<button class="chip" data-cat="${k}" aria-pressed="false">${esc(v.label)}</button>`).join('');

  filters.addEventListener('click', e => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    cat = btn.dataset.cat;
    filters.querySelectorAll('.chip').forEach(c =>
      c.setAttribute('aria-pressed', String(c === btn)));
    render();
  });

  search.addEventListener('input', render);

  function card(p) {
    return `<a class="card" href="${shapeHref(p.id)}">
      <div class="art">${pastaSVG(p.icon)}</div>
      <h3>${esc(p.name)}</h3>
      <p class="sub">${esc(p.pron)}</p>
    </a>`;
  }

  function render() {
    const q = search.value.trim().toLowerCase();
    let list = PASTA;
    if (cat !== 'all') list = list.filter(p => p.cat === cat);
    if (q) {
      list = list.filter(p =>
        [p.name, p.pron, p.region, p.meaning, p.best, p.made, p.die,
          CATEGORIES[p.cat].label, METHODS[p.method],
          ...p.sauces.map(s => SAUCE_TAGS[s])
        ].join(' ').toLowerCase().includes(q));
    }

    if (!list.length) {
      out.innerHTML = `<p class="empty">No shapes match that. Try “tube”, “Sicily”, or “pesto”.</p>`;
      return;
    }

    const groups = Object.keys(CATEGORIES)
      .map(k => [k, list.filter(p => p.cat === k)])
      .filter(([, items]) => items.length);

    out.innerHTML = groups.map(([k, items]) => `
      <section class="cat-block">
        <header>
          <h2>${esc(CATEGORIES[k].label)}</h2>
          <p>${esc(CATEGORIES[k].blurb)}</p>
        </header>
        <div class="grid">${items.map(card).join('')}</div>
      </section>`).join('');
  }

  render();
}

/* ---------------- detail ---------------- */

function extruderDiagram() {
  return `<svg class="extrude-fig" viewBox="0 0 340 130" role="img" aria-label="Diagram of a pasta extruder">
    <rect x="10" y="34" width="200" height="62" rx="10" fill="var(--bg-alt)" stroke="var(--line)" stroke-width="2"/>
    <path d="M30 46 q14 19 0 38 M56 46 q14 19 0 38 M82 46 q14 19 0 38 M108 46 q14 19 0 38 M134 46 q14 19 0 38 M160 46 q14 19 0 38"
          fill="none" stroke="var(--pasta-line)" stroke-width="3" opacity=".55"/>
    <line x1="20" y1="65" x2="190" y2="65" stroke="var(--pasta-line)" stroke-width="4" opacity=".8"/>
    <rect x="210" y="24" width="16" height="82" rx="4" fill="var(--accent)" opacity=".85"/>
    <g fill="var(--pasta-fill)" stroke="var(--pasta-line)" stroke-width="1.5">
      <rect x="226" y="44" width="104" height="7" rx="3.5"/>
      <rect x="226" y="61" width="104" height="7" rx="3.5"/>
      <rect x="226" y="78" width="104" height="7" rx="3.5"/>
    </g>
    <text x="105" y="118" text-anchor="middle" font-size="11" fill="var(--ink-soft)" font-family="sans-serif">auger under pressure</text>
    <text x="218" y="18" text-anchor="middle" font-size="11" fill="var(--accent)" font-family="sans-serif">die</text>
    <text x="278" y="118" text-anchor="middle" font-size="11" fill="var(--ink-soft)" font-family="sans-serif">cut &amp; dried</text>
  </svg>`;
}

const EXTRUSION_101 = `A pasta factory is essentially one long screw. Semolina and water are mixed
  into a dough far drier than bread dough — crumbly, not smooth — and an auger drives it forward under
  roughly 100 bar of pressure into a bronze or Teflon plate called a <em>trafila</em>, the die. The shape
  of the holes in that plate is the shape of the pasta. A blade spinning against the face of the die cuts
  the emerging dough to length. Bronze dies drag on the dough and leave a chalky, porous surface that
  grips sauce; Teflon dies are slicker, faster and cheaper, and give the glossy pasta that sauce slides off.
  Everything after that is drying — slowly at low heat for good pasta, fast and hot for cheap pasta.`;

function initDetail(pastaId) {
  const id = pastaId || new URLSearchParams(location.search).get('id');
  const p = PASTA.find(x => x.id === id);
  const root = document.getElementById('detail');

  if (!p) {
    root.innerHTML = `<p class="empty">That shape isn't in the catalogue. <a href="${browseHref}">Browse them all →</a></p>`;
    return;
  }

  document.title = p.name + ' — What The Fusilli';

  const related = PASTA.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4);

  root.innerHTML = `
    <div class="detail-head">
      <div class="art">${pastaSVG(p.icon)}</div>
      <div class="titles">
        <p class="eyebrow">${esc(CATEGORIES[p.cat].label)}</p>
        <h1>${esc(p.name)}</h1>
        <p class="pron">${esc(p.pron)}</p>
        <p class="tagline">${esc(p.meaning)}</p>
        <div class="badges">
          <span class="badge">${METHODS[p.method]}</span>
          ${p.sauces.map(s => `<span class="badge plain">${esc(SAUCE_TAGS[s])}</span>`).join('')}
        </div>
      </div>
    </div>

    <div class="cols">
      <div>
        <div class="panel">
          <h2>How it's made</h2>
          <p>${p.made}</p>
          <p class="diefact"><strong>The die:</strong> ${esc(p.die)}</p>
        </div>

        ${p.method === 'extruded' ? `
        <div class="panel">
          <h2>Extrusion, in short</h2>
          <p>${EXTRUSION_101}</p>
          ${extruderDiagram()}
        </div>` : `
        <div class="panel">
          <h2>Why this one isn't extruded</h2>
          <p>Most dried pasta is pushed through a die under pressure. ${esc(p.name.split(' /')[0])} isn't —
          the shape can't be produced by forcing dough through a hole, so it's ${p.method === 'rolled'
            ? 'laminated into a sheet and cut'
            : p.method === 'stamped'
              ? 'built from sheets, filled and sealed'
              : 'formed piece by piece by hand'}. That means softer egg or water dough, a shorter
          cook time, and a texture no extruder can reproduce.</p>
          ${extruderDiagram()}
        </div>`}

        <div class="fact">${p.fact}</div>
      </div>

      <aside>
        <div class="panel">
          <h2>At a glance</h2>
          ${metaRow(p)}
        </div>
        <div class="panel">
          <h2>Serve it with</h2>
          <p>${esc(p.best)}</p>
        </div>
        ${related.length ? `
        <div class="panel">
          <h2>Also in this family</h2>
          ${related.map(r => `<p style="margin:0 0 8px"><a href="${shapeHref(r.id)}">${esc(r.name)}</a></p>`).join('')}
        </div>` : ''}
        <a class="backlink" href="${browseHref}">← All shapes</a>
      </aside>
    </div>`;
}
