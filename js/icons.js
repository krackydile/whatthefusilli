// SVG illustrations for each pasta shape. viewBox is always 0 0 100 100.
// Colours come from CSS vars so they adapt to light/dark.

const F = 'var(--pasta-fill)';
const L = 'var(--pasta-line)';

function helix(cx, top, bottom, w, turns) {
  const step = (bottom - top) / turns;
  let d = '';
  for (let i = 0; i < turns; i++) {
    const y = top + i * step;
    d += `M${cx - w} ${y} C${cx - w} ${y + step * 0.55} ${cx + w} ${y + step * 0.45} ${cx + w} ${y + step} `;
  }
  return d;
}

// A filled ribbon built from two wave edges.
function band(y, h, amp) {
  let top = `M0 ${y} `;
  for (let x = 0; x < 100; x += 50) {
    top += `Q${x + 12.5} ${y - amp} ${x + 25} ${y} Q${x + 37.5} ${y + amp} ${x + 50} ${y} `;
  }
  let bot = '';
  for (let x = 100; x > 0; x -= 50) {
    bot += `Q${x - 12.5} ${y + h + amp} ${x - 25} ${y + h} Q${x - 37.5} ${y + h - amp} ${x - 50} ${y + h} `;
  }
  return `<path d="${top} L100 ${y + h} ${bot} Z" fill="${F}" stroke="${L}" stroke-width="1.6" stroke-linejoin="round"/>`;
}

function tube(x, y, w, h, ridges, tilt) {
  const rx = w / 2;
  const ry = w * 0.22;
  let g = `<g transform="rotate(${tilt || 0} ${x + rx} ${y + h / 2})">`;
  g += `<path d="M${x} ${y} L${x} ${y + h} A${rx} ${ry} 0 0 0 ${x + w} ${y + h} L${x + w} ${y} Z" fill="${F}" stroke="${L}" stroke-width="1.6"/>`;
  if (ridges) {
    for (let i = 1; i < 4; i++) {
      const px = x + (w / 4) * i;
      g += `<line x1="${px}" y1="${y + 3}" x2="${px}" y2="${y + h - 2}" stroke="${L}" stroke-width="1" opacity=".55"/>`;
    }
  }
  g += `<ellipse cx="${x + rx}" cy="${y}" rx="${rx}" ry="${ry}" fill="var(--pasta-hole)" stroke="${L}" stroke-width="1.6"/>`;
  g += `</g>`;
  return g;
}

function rod(x, w, top, bottom, hollow) {
  let s = `<rect x="${x}" y="${top}" width="${w}" height="${bottom - top}" rx="${Math.min(w / 2, 3)}" fill="${F}" stroke="${L}" stroke-width="1.3"/>`;
  if (hollow) {
    s += `<rect x="${x + w * 0.32}" y="${top}" width="${w * 0.36}" height="${bottom - top}" fill="var(--pasta-hole)" stroke="${L}" stroke-width=".9"/>`;
    s += `<ellipse cx="${x + w / 2}" cy="${top + 2}" rx="${w / 2}" ry="${w * 0.32}" fill="${F}" stroke="${L}" stroke-width="1.2"/>`;
    s += `<ellipse cx="${x + w / 2}" cy="${top + 2}" rx="${w * 0.18}" ry="${w * 0.12}" fill="var(--pasta-hole)" stroke="${L}" stroke-width=".9"/>`;
  }
  return s;
}

// A quill: cylinder with a mouth cut on the bias.
function quill(ridged) {
  const ridges = ridged
    ? [1, 2, 3, 4].map(i => {
        const x = 28 + 8.8 * i;
        const top = 22 + ((x - 28) / 44) * 16;
        return `<line x1="${x}" y1="${top + 4}" x2="${x}" y2="${80 - Math.abs(i - 2.5) * 1.2}" stroke="${L}" stroke-width="1" opacity=".45"/>`;
      }).join('')
    : '';
  return `<g transform="rotate(-22 50 52)">
    <path d="M28 22 L28 78 A22 7 0 0 0 72 78 L72 38 Z" fill="${F}" stroke="${L}" stroke-width="1.7"/>
    ${ridges}
    <ellipse cx="50" cy="30" rx="23.4" ry="7" transform="rotate(20 50 30)" fill="var(--pasta-hole)" stroke="${L}" stroke-width="1.7"/>
  </g>`;
}

// A ribbon with scalloped edges down both long sides.
function frilledBand(y, h) {
  let d = `M4 ${y} `;
  for (let x = 4; x < 96; x += 8) d += `A4 4 0 0 1 ${x + 8} ${y} `;
  d += `L96 ${y + h} `;
  for (let x = 96; x > 4; x -= 8) d += `A4 4 0 0 1 ${x - 8} ${y + h} `;
  return `<path d="${d} Z" fill="${F}" stroke="${L}" stroke-width="1.5"/>`;
}

const ICONS = {
  strand: () => [24, 47, 70].map(x => rod(x, 6, 8, 92)).join(''),
  'strand-fine': () => [22, 34, 46, 58, 70].map(x => rod(x, 2.5, 8, 92)).join(''),
  'strand-thin': () => [24, 40, 56, 72].map(x => rod(x, 4, 8, 92)).join(''),
  'strand-hollow': () => [20, 45, 70].map(x => rod(x, 11, 10, 92, true)).join(''),
  'strand-flat': () => [18, 42, 66].map(x => rod(x, 11, 8, 92)).join(''),
  'strand-thick': () => [26, 56].map(x => rod(x, 17, 8, 92)).join(''),

  // square-section strands: chitarra, tonnarelli, troccoli
  'strand-square': () => [22, 45, 68].map(x =>
    `<rect x="${x}" y="8" width="10" height="84" fill="${F}" stroke="${L}" stroke-width="1.4"/>` +
    `<line x1="${x + 3}" y1="10" x2="${x + 3}" y2="90" stroke="${L}" stroke-width=".8" opacity=".4"/>`).join(''),

  // long tubes: ziti lunghi, candele, zitoni
  'tube-long': () => [24, 44, 64].map(x =>
    `<rect x="${x}" y="10" width="14" height="82" rx="2" fill="${F}" stroke="${L}" stroke-width="1.4"/>` +
    `<ellipse cx="${x + 7}" cy="12" rx="7" ry="2.6" fill="var(--pasta-hole)" stroke="${L}" stroke-width="1.1"/>`).join(''),

  // a helix running the whole length: fusilli lunghi
  'helix-long': () => `<path d="${helix(50, 8, 92, 17, 7)}" fill="none" stroke="${F}" stroke-width="10" stroke-linecap="round"/>
    <path d="${helix(50, 8, 92, 17, 7)}" fill="none" stroke="${L}" stroke-width="1.2" opacity=".65"/>`,

  'ribbon-fine': () => band(20, 7, 6) + band(46, 7, 6) + band(72, 7, 6),

  ribbon: () => band(24, 12, 7) + band(58, 12, 7),
  'ribbon-wide': () => band(16, 24, 9) + band(58, 24, 9),
  'ribbon-ruffle': () => frilledBand(24, 18) + frilledBand(62, 18),

  // plain squares of sheet: fazzoletti, mandilli
  'sheet-square': () => [[28, 30, 30], [62, 56, 32]].map(([x, y, w], i) =>
    `<g transform="rotate(${i ? 12 : -9} ${x + w / 2} ${y + w / 2})">
      <path d="M${x} ${y} L${x + w} ${y - 3} L${x + w + 3} ${y + w} L${x + 2} ${y + w + 3} Z"
        fill="${F}" stroke="${L}" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M${x + 6} ${y + w / 2} Q${x + w / 2} ${y + w / 2 - 6} ${x + w - 4} ${y + w / 2}"
        fill="none" stroke="${L}" stroke-width=".9" opacity=".4"/>
    </g>`).join(''),

  // offcuts: rough diamonds and triangles
  maltagliati: () => `
    <path d="M16 26 L44 18 L38 44 L14 46 Z" fill="${F}" stroke="${L}" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M54 22 L84 32 L62 50 Z" fill="${F}" stroke="${L}" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M20 58 L48 56 L44 84 L24 80 Z" fill="${F}" stroke="${L}" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M58 60 L86 58 L78 86 L56 80 Z" fill="${F}" stroke="${L}" stroke-width="1.4" stroke-linejoin="round"/>`,

  // rectangles with every edge fluted
  sagnarelli: () => [[24, 26], [58, 52]].map(([x, y]) => {
    const w = 36, h = 26;
    let d = `M${x} ${y} `;
    for (let i = x; i < x + w; i += 9) d += `A4.5 4.5 0 0 1 ${i + 9} ${y} `;
    d += `L${x + w} ${y + h} `;
    for (let i = x + w; i > x; i -= 9) d += `A4.5 4.5 0 0 1 ${i - 9} ${y + h} `;
    return `<path d="${d} Z" fill="${F}" stroke="${L}" stroke-width="1.4"/>`;
  }).join(''),

  squares: () => [[22, 24], [58, 34], [30, 62], [64, 70]].map(([x, y], i) =>
    `<rect x="${x}" y="${y}" width="26" height="24" rx="2" transform="rotate(${i * 7 - 10} ${x + 13} ${y + 12})" fill="${F}" stroke="${L}" stroke-width="1.4"/>`).join(''),

  'squares-small': () => {
    const out = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const x = 18 + c * 18 + (r % 2 ? 4 : 0), y = 18 + r * 18;
      out.push(`<rect x="${x}" y="${y}" width="12" height="12" rx="1.5" transform="rotate(${(r + c) * 5 - 10} ${x + 6} ${y + 6})" fill="${F}" stroke="${L}" stroke-width="1.1"/>`);
    }
    return out.join('');
  },

  heart: () => [[32, 34, 18], [66, 52, 16], [38, 74, 14]].map(([x, y, r]) =>
    `<path d="M${x} ${y + r * 0.8} C${x - r * 1.4} ${y - r * 0.2} ${x - r * 0.5} ${y - r} ${x} ${y - r * 0.35}
        C${x + r * 0.5} ${y - r} ${x + r * 1.4} ${y - r * 0.2} ${x} ${y + r * 0.8} Z"
        fill="${F}" stroke="${L}" stroke-width="1.4" stroke-linejoin="round"/>`).join(''),

  flower: () => [[32, 34, 16], [66, 54, 14], [36, 74, 13]].map(([x, y, r]) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (i * 60) * Math.PI / 180;
      return `<circle cx="${x + r * 0.62 * Math.cos(a)}" cy="${y + r * 0.62 * Math.sin(a)}" r="${r * 0.42}" fill="${F}" stroke="${L}" stroke-width="1.2"/>`;
    }).join('') + `<circle cx="${x}" cy="${y}" r="${r * 0.3}" fill="var(--pasta-hole)" stroke="${L}" stroke-width="1.1"/>`).join(''),

  bow: () => [[34, 36], [66, 68]].map(([x, y]) =>
    `<path d="M${x - 24} ${y - 14} Q${x - 6} ${y - 6} ${x} ${y} Q${x - 6} ${y + 6} ${x - 24} ${y + 14} Q${x - 18} ${y} ${x - 24} ${y - 14} Z"
        fill="${F}" stroke="${L}" stroke-width="1.4" stroke-linejoin="round"/>
     <path d="M${x + 24} ${y - 14} Q${x + 6} ${y - 6} ${x} ${y} Q${x + 6} ${y + 6} ${x + 24} ${y + 14} Q${x + 18} ${y} ${x + 24} ${y - 14} Z"
        fill="${F}" stroke="${L}" stroke-width="1.4" stroke-linejoin="round"/>
     <circle cx="${x}" cy="${y}" r="4" fill="${F}" stroke="${L}" stroke-width="1.3"/>`).join(''),

  'bow-small': () => [[26, 28], [60, 40], [34, 64], [68, 76]].map(([x, y]) =>
    `<path d="M${x - 12} ${y - 7} Q${x - 3} ${y - 3} ${x} ${y} Q${x - 3} ${y + 3} ${x - 12} ${y + 7} Q${x - 9} ${y} ${x - 12} ${y - 7} Z
        M${x + 12} ${y - 7} Q${x + 3} ${y - 3} ${x} ${y} Q${x + 3} ${y + 3} ${x + 12} ${y + 7} Q${x + 9} ${y} ${x + 12} ${y - 7} Z"
        fill="${F}" stroke="${L}" stroke-width="1.1" stroke-linejoin="round"/>`).join(''),

  crumbs: () => [[26, 28, 9, 6], [52, 22, 7, 9], [72, 36, 8, 6], [34, 50, 6, 8],
                 [60, 54, 9, 7], [24, 70, 8, 6], [50, 76, 6, 7], [74, 68, 7, 8]]
    .map(([x, y, w, h], i) =>
      `<path d="M${x - w} ${y} L${x - w / 3} ${y - h} L${x + w} ${y - h / 3} L${x + w / 2} ${y + h} L${x - w / 2} ${y + h * 0.7} Z"
          transform="rotate(${i * 23} ${x} ${y})" fill="${F}" stroke="${L}" stroke-width="1.1" stroke-linejoin="round"/>`).join(''),

  filini: () => [22, 34, 46, 58, 70].map((x, i) =>
    `<rect x="${x}" y="${20 + (i % 2) * 10}" width="3" height="26" rx="1.5" fill="${F}" stroke="${L}" stroke-width="1"/>
     <rect x="${x - 2}" y="${58 + (i % 2) * 8}" width="3" height="24" rx="1.5" fill="${F}" stroke="${L}" stroke-width="1"/>`).join(''),

  letters: () => {
    const glyphs = [['A', 24, 34], ['B', 52, 26], ['C', 78, 40], ['E', 30, 62],
                    ['O', 58, 58], ['S', 80, 74], ['M', 26, 88], ['T', 56, 90]];
    return glyphs.map(([ch, x, y], i) =>
      `<text x="${x}" y="${y}" font-family="ui-sans-serif, sans-serif" font-size="30" font-weight="700"
         transform="rotate(${(i % 3) * 9 - 9} ${x} ${y})"
         fill="${F}" stroke="${L}" stroke-width="1.4" text-anchor="middle">${ch}</text>`).join('');
  },

  sheet: () => `<path d="M14 12 Q22 20 14 28 Q22 36 14 44 Q22 52 14 60 Q22 68 14 76 Q22 84 14 88
      L86 88 Q78 80 86 72 Q78 64 86 56 Q78 48 86 40 Q78 32 86 24 Q78 16 86 12 Z"
      fill="${F}" stroke="${L}" stroke-width="1.8" stroke-linejoin="round"/>`,

  penne: () => quill(true),
  'penne-smooth': () => quill(false),

  rigatoni: () => tube(28, 20, 44, 60, true, -8),

  // ridges that spiral round the barrel: tortiglioni, elicoidali
  tortiglioni: () => `<g transform="rotate(-8 50 50)">
    <path d="M28 20 L28 80 A22 7 0 0 0 72 80 L72 20 Z" fill="${F}" stroke="${L}" stroke-width="1.6"/>
    ${[0, 1, 2, 3, 4, 5].map(i => `<path d="M28 ${26 + i * 10} Q50 ${32 + i * 10} 72 ${24 + i * 10}" fill="none" stroke="${L}" stroke-width="1" opacity=".5"/>`).join('')}
    <ellipse cx="50" cy="20" rx="22" ry="7" fill="var(--pasta-hole)" stroke="${L}" stroke-width="1.6"/>
  </g>`,

  // many fine grooves rather than a few deep ones
  millerighe: () => `<g transform="rotate(-6 50 50)">
    <path d="M26 22 L26 78 A24 7 0 0 0 74 78 L74 22 Z" fill="${F}" stroke="${L}" stroke-width="1.6"/>
    ${Array.from({ length: 11 }, (_, i) => `<line x1="${28 + i * 4.4}" y1="26" x2="${28 + i * 4.4}" y2="79" stroke="${L}" stroke-width=".7" opacity=".45"/>`).join('')}
    <ellipse cx="50" cy="22" rx="24" ry="7" fill="var(--pasta-hole)" stroke="${L}" stroke-width="1.6"/>
  </g>`,

  // a narrow ridged tube with a gentle bend: sedani, sedanini
  sedani: () => `<path d="M30 84 Q22 50 44 16" fill="none" stroke="${F}" stroke-width="20" stroke-linecap="round"/>
    <path d="M30 84 Q22 50 44 16" fill="none" stroke="${L}" stroke-width="1.3" opacity=".45"/>
    ${[-6, 0, 6].map(o => `<path d="M${30 + o} 82 Q${22 + o} 50 ${44 + o} 18" fill="none" stroke="${L}" stroke-width=".9" opacity=".4"/>`).join('')}
    <ellipse cx="44" cy="16" rx="10" ry="4" transform="rotate(28 44 16)" fill="var(--pasta-hole)" stroke="${L}" stroke-width="1.4"/>`,

  // wide rings cut short, meant to pass for squid
  calamarata: () => [[32, 34, 20], [68, 52, 18], [38, 74, 16]].map(([x, y, r]) =>
    `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.42}" fill="${F}" stroke="${L}" stroke-width="1.6"/>
     <ellipse cx="${x}" cy="${y}" rx="${r * 0.6}" ry="${r * 0.24}" fill="var(--pasta-hole)" stroke="${L}" stroke-width="1.3"/>`).join(''),

  // a three-sided quill
  trenne: () => `<g transform="rotate(-20 50 52)">
    <path d="M30 24 L30 76 L50 88 L70 76 L70 32 L50 20 Z" fill="${F}" stroke="${L}" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M30 24 L50 36 L70 32" fill="none" stroke="${L}" stroke-width="1.3"/>
    <line x1="50" y1="36" x2="50" y2="88" stroke="${L}" stroke-width="1" opacity=".5"/>
    <path d="M30 24 L50 12 L70 20 L70 32 L50 20 Z" fill="var(--pasta-hole)" stroke="${L}" stroke-width="1.5" stroke-linejoin="round"/>
  </g>`,
  ziti: () => tube(34, 10, 32, 80, false, 6),
  paccheri: () => tube(16, 30, 68, 42, false, -4),
  cannelloni: () => tube(24, 12, 52, 76, false, 0),
  ditalini: () => tube(14, 34, 22, 22, true, -10) + tube(42, 46, 22, 22, true, 8) + tube(68, 28, 22, 22, true, -4),
  'mezze-maniche': () => tube(28, 30, 44, 40, true, 0),

  garganelli: () => `<g transform="rotate(-30 50 50)">
      <path d="M34 24 L34 76 A16 6 0 0 0 66 76 L66 24 Z" fill="${F}" stroke="${L}" stroke-width="1.7"/>
      ${[0, 1, 2, 3].map(i => `<line x1="${34}" y1="${34 + i * 13}" x2="${66}" y2="${26 + i * 13}" stroke="${L}" stroke-width="1" opacity=".5"/>`).join('')}
      <ellipse cx="50" cy="24" rx="16" ry="6" fill="var(--pasta-hole)" stroke="${L}" stroke-width="1.6"/>
    </g>`,

  elbow: () => `<path d="M26 82 A34 34 0 1 1 78 62" fill="none" stroke="${F}" stroke-width="22" stroke-linecap="round"/>
    <path d="M26 82 A34 34 0 1 1 78 62" fill="none" stroke="${L}" stroke-width="24" stroke-linecap="round" opacity=".18"/>
    <path d="M26 82 A34 34 0 1 1 78 62" fill="none" stroke="${F}" stroke-width="19" stroke-linecap="round"/>
    <ellipse cx="26" cy="82" rx="10" ry="7" transform="rotate(-14 26 82)" fill="var(--pasta-hole)" stroke="${L}" stroke-width="1.6"/>`,

  lumache: () => `<path d="M50 84 A30 30 0 1 1 74 72" fill="none" stroke="${F}" stroke-width="26" stroke-linecap="round"/>
    ${[0, 1, 2, 3, 4].map(i => `<line x1="${50 + 26 * Math.cos((i * 50 + 130) * Math.PI / 180)}" y1="${50 + 26 * Math.sin((i * 50 + 130) * Math.PI / 180)}" x2="${50 + 38 * Math.cos((i * 50 + 130) * Math.PI / 180)}" y2="${50 + 38 * Math.sin((i * 50 + 130) * Math.PI / 180)}" stroke="${L}" stroke-width="1.2" opacity=".5"/>`).join('')}
    <ellipse cx="50" cy="84" rx="12" ry="8" fill="var(--pasta-hole)" stroke="${L}" stroke-width="1.6"/>`,

  fusilli: () => `<path d="${helix(50, 12, 88, 20, 4)}" fill="none" stroke="${F}" stroke-width="13" stroke-linecap="round"/>
    <path d="${helix(50, 12, 88, 20, 4)}" fill="none" stroke="${L}" stroke-width="1.4" opacity=".7"/>`,
  rotini: () => `<path d="${helix(50, 10, 90, 22, 6)}" fill="none" stroke="${F}" stroke-width="11" stroke-linecap="round"/>
    <path d="${helix(50, 10, 90, 22, 6)}" fill="none" stroke="${L}" stroke-width="1.3" opacity=".7"/>`,
  twist: () => `<path d="${helix(50, 14, 86, 13, 4)}" fill="none" stroke="${F}" stroke-width="15" stroke-linecap="round"/>
    <path d="${helix(50, 14, 86, 13, 4)}" fill="none" stroke="${L}" stroke-width="1.3" opacity=".6"/>`,

  cavatappi: () => `<path d="${helix(50, 14, 86, 24, 3)}" fill="none" stroke="${F}" stroke-width="17" stroke-linecap="round"/>
    <path d="${helix(50, 14, 86, 24, 3)}" fill="none" stroke="var(--pasta-hole)" stroke-width="6" stroke-linecap="round" opacity=".8"/>
    <path d="${helix(50, 14, 86, 24, 3)}" fill="none" stroke="${L}" stroke-width="1.2" opacity=".5"/>`,

  casarecce: () => `<path d="M38 12 C14 34 84 44 62 62 C46 76 34 78 34 90" fill="none" stroke="${F}" stroke-width="16" stroke-linecap="round"/>
    <path d="M38 12 C14 34 84 44 62 62 C46 76 34 78 34 90" fill="none" stroke="${L}" stroke-width="1.3" opacity=".6"/>`,

  farfalle: () => `<path d="M8 20 Q30 26 44 44 Q30 62 8 80 Q16 50 8 20 Z" fill="${F}" stroke="${L}" stroke-width="1.7" stroke-linejoin="round"/>
    <path d="M92 20 Q70 26 56 44 Q70 62 92 80 Q84 50 92 20 Z" fill="${F}" stroke="${L}" stroke-width="1.7" stroke-linejoin="round"/>
    <path d="M44 44 Q50 50 56 44 L56 56 Q50 50 44 56 Z" fill="${F}" stroke="${L}" stroke-width="1.7" stroke-linejoin="round"/>
    ${[0, 1, 2].map(i => `<line x1="46" y1="${44 + i * 4}" x2="54" y2="${44 + i * 4}" stroke="${L}" stroke-width="1" opacity=".5"/>`).join('')}`,

  // smaller, tighter shells for soup — a fan, like conchiglie shrunk
  'shell-small': () => [[30, 32, 16], [66, 48, 14], [36, 74, 15]].map(([x, y, r]) => {
    let top = `M${x - r} ${y - r * 0.35} `;
    for (let i = 0; i < 4; i++) top += `A${r / 4} ${r / 4} 0 0 1 ${x - r + (r / 2) * (i + 1)} ${y - r * 0.35} `;
    return `<path d="${top} C${x + r} ${y + r * 0.5} ${x + r * 0.5} ${y + r} ${x} ${y + r}
        C${x - r * 0.5} ${y + r} ${x - r} ${y + r * 0.5} ${x - r} ${y - r * 0.35} Z"
        fill="${F}" stroke="${L}" stroke-width="1.3" stroke-linejoin="round"/>
      ${[-0.55, 0, 0.55].map(k => `<path d="M${x} ${y + r * 0.9} Q${x + k * r * 0.6} ${y + r * 0.1} ${x + k * r} ${y - r * 0.3}" fill="none" stroke="${L}" stroke-width=".9" opacity=".45"/>`).join('')}`;
  }).join(''),

  // a deep snail curl with a wide mouth
  lumaconi: () => `<path d="M50 86 A32 32 0 1 1 78 66" fill="none" stroke="${F}" stroke-width="30" stroke-linecap="round"/>
    ${[0, 1, 2, 3, 4, 5].map(i => `<line x1="${50 + 24 * Math.cos((i * 45 + 120) * Math.PI / 180)}" y1="${50 + 24 * Math.sin((i * 45 + 120) * Math.PI / 180)}" x2="${50 + 40 * Math.cos((i * 45 + 120) * Math.PI / 180)}" y2="${50 + 40 * Math.sin((i * 45 + 120) * Math.PI / 180)}" stroke="${L}" stroke-width="1.2" opacity=".45"/>`).join('')}
    <ellipse cx="50" cy="86" rx="15" ry="9" fill="var(--pasta-hole)" stroke="${L}" stroke-width="1.6"/>`,

  // flat dragged petals
  cencioni: () => [[30, 30], [66, 48], [36, 72]].map(([x, y], i) =>
    `<g transform="rotate(${i * 28 - 18} ${x} ${y})">
      <path d="M${x - 22} ${y} Q${x - 8} ${y - 16} ${x + 10} ${y - 8} Q${x + 24} ${y - 2} ${x + 18} ${y + 8}
          Q${x + 4} ${y + 16} ${x - 12} ${y + 10} Z" fill="${F}" stroke="${L}" stroke-width="1.5"/>
      ${[-8, 0, 8].map(o => `<path d="M${x + o - 6} ${y - 4} Q${x + o} ${y + 2} ${x + o + 5} ${y + 6}" fill="none" stroke="${L}" stroke-width=".9" opacity=".45"/>`).join('')}
    </g>`).join(''),

  // a curved tube wearing a frilled crest
  creste: () => `<path d="M26 78 Q22 34 58 26" fill="none" stroke="${F}" stroke-width="22" stroke-linecap="round"/>
    <path d="M18 66 Q20 44 30 30 Q34 40 42 30 Q46 40 54 28 Q58 36 66 26"
      fill="none" stroke="${F}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M18 66 Q20 44 30 30 Q34 40 42 30 Q46 40 54 28 Q58 36 66 26"
      fill="none" stroke="${L}" stroke-width="1.3"/>
    <path d="M26 78 Q22 34 58 26" fill="none" stroke="${L}" stroke-width="1.3" opacity=".5"/>
    <ellipse cx="26" cy="78" rx="11" ry="6" fill="var(--pasta-hole)" stroke="${L}" stroke-width="1.5"/>`,

  // a bowl with a stub of stem
  pipe: () => `<path d="M40 30 A26 26 0 1 0 66 62" fill="none" stroke="${F}" stroke-width="24" stroke-linecap="round"/>
    <path d="M40 30 A26 26 0 1 0 66 62" fill="none" stroke="${L}" stroke-width="1.3" opacity=".5"/>
    ${[0, 1, 2, 3].map(i => `<line x1="${50 + 20 * Math.cos((i * 40 + 190) * Math.PI / 180)}" y1="${50 + 20 * Math.sin((i * 40 + 190) * Math.PI / 180)}" x2="${50 + 34 * Math.cos((i * 40 + 190) * Math.PI / 180)}" y2="${50 + 34 * Math.sin((i * 40 + 190) * Math.PI / 180)}" stroke="${L}" stroke-width="1.1" opacity=".45"/>`).join('')}
    <ellipse cx="40" cy="30" rx="12" ry="8" transform="rotate(-30 40 30)" fill="var(--pasta-hole)" stroke="${L}" stroke-width="1.5"/>`,

  // stamped discs with a carved relief
  corzetti: () => [[32, 34, 19], [68, 52, 17], [38, 74, 15]].map(([x, y, r]) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${F}" stroke="${L}" stroke-width="1.5"/>
     <circle cx="${x}" cy="${y}" r="${r * 0.62}" fill="none" stroke="${L}" stroke-width="1" opacity=".6"/>
     ${Array.from({ length: 6 }, (_, i) => {
        const a = (i * 60) * Math.PI / 180;
        return `<line x1="${x + r * 0.2 * Math.cos(a)}" y1="${y + r * 0.2 * Math.sin(a)}" x2="${x + r * 0.55 * Math.cos(a)}" y2="${y + r * 0.55 * Math.sin(a)}" stroke="${L}" stroke-width="1" opacity=".55"/>`;
      }).join('')}`).join(''),

  // a curled ruffled ribbon
  riccioli: () => `<path d="M30 74 Q18 46 40 30 Q60 16 70 36 Q76 50 62 58"
      fill="none" stroke="${F}" stroke-width="17" stroke-linecap="round"/>
    <path d="M30 74 Q18 46 40 30 Q60 16 70 36 Q76 50 62 58"
      fill="none" stroke="${L}" stroke-width="1.3" opacity=".55"/>
    ${[0, 1, 2, 3, 4].map(i => `<line x1="${26 + i * 10}" y1="${72 - i * 9}" x2="${34 + i * 10}" y2="${66 - i * 9}" stroke="${L}" stroke-width=".9" opacity=".4"/>`).join('')}`,

  // a tapered spiral, ridged like the mountain
  vesuvio: () => `<path d="${helix(50, 20, 84, 8, 3)}" fill="none" stroke="${F}" stroke-width="12" stroke-linecap="round"/>
    <path d="M34 86 Q50 78 66 86" fill="none" stroke="${F}" stroke-width="14" stroke-linecap="round"/>
    <path d="${helix(50, 20, 84, 8, 3)}" fill="none" stroke="${L}" stroke-width="1.2" opacity=".55"/>
    <path d="M30 88 Q50 76 70 88" fill="none" stroke="${L}" stroke-width="1.3" opacity=".5"/>`,

  // a ridged shell rolled at one edge
  castellane: () => `<path d="M22 62 Q30 26 62 24 Q82 24 78 44 Q74 62 54 62 Q36 62 34 78 Q32 88 44 88"
      fill="none" stroke="${F}" stroke-width="16" stroke-linecap="round"/>
    <path d="M22 62 Q30 26 62 24 Q82 24 78 44 Q74 62 54 62 Q36 62 34 78 Q32 88 44 88"
      fill="none" stroke="${L}" stroke-width="1.3" opacity=".55"/>
    ${[0, 1, 2, 3].map(i => `<line x1="${30 + i * 13}" y1="${34 + i * 3}" x2="${34 + i * 13}" y2="${46 + i * 3}" stroke="${L}" stroke-width=".9" opacity=".4"/>`).join('')}`,

  shell: () => {
    // Scallop: hinge at the bottom, frilled fan opening upward.
    let top = 'M14 42 ';
    for (let x = 14; x < 86; x += 12) top += `A6 6 0 0 1 ${x + 12} 42 `;
    return `<path d="${top} C88 66 74 84 50 88 C26 84 12 66 14 42 Z"
        fill="${F}" stroke="${L}" stroke-width="1.7" stroke-linejoin="round"/>
      ${[-30, -18, -6, 6, 18, 30].map(k =>
        `<path d="M50 86 Q${50 + k * 0.7} 62 ${50 + k} 44" fill="none" stroke="${L}" stroke-width="1.2" opacity=".5"/>`).join('')}
      <ellipse cx="50" cy="84" rx="11" ry="6" fill="var(--pasta-hole)" stroke="${L}" stroke-width="1.4"/>`;
  },

  ear: () => `<circle cx="50" cy="50" r="34" fill="${F}" stroke="${L}" stroke-width="1.8"/>
    <circle cx="50" cy="50" r="23" fill="var(--pasta-hole)" stroke="${L}" stroke-width="1.4" opacity=".9"/>
    ${[0, 1, 2, 3, 4, 5].map(i => `<line x1="${50 + 24 * Math.cos(i * 1.05)}" y1="${50 + 24 * Math.sin(i * 1.05)}" x2="${50 + 33 * Math.cos(i * 1.05)}" y2="${50 + 33 * Math.sin(i * 1.05)}" stroke="${L}" stroke-width="1.1" opacity=".45"/>`).join('')}`,

  // an open pod pressed with three fingers
  capunti: () => [[30, 30], [64, 50], [36, 74]].map(([x, y], i) =>
    `<g transform="rotate(${i * 26 - 16} ${x} ${y})">
      <path d="M${x - 24} ${y} Q${x} ${y - 14} ${x + 24} ${y} Q${x} ${y + 14} ${x - 24} ${y} Z" fill="${F}" stroke="${L}" stroke-width="1.5"/>
      ${[-11, 0, 11].map(o => `<ellipse cx="${x + o}" cy="${y}" rx="5" ry="4" fill="var(--pasta-hole)" stroke="${L}" stroke-width="1"/>`).join('')}
    </g>`).join(''),

  // two strands twisted into a closed ring
  lorighittas: () => [[34, 36, 20], [66, 68, 17]].map(([x, y, r]) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${F}" stroke-width="9"/>
     <circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${L}" stroke-width="1.2" opacity=".5"/>
     ${Array.from({ length: 14 }, (_, i) => {
        const a = (i * 360 / 14) * Math.PI / 180;
        return `<line x1="${x + (r - 5) * Math.cos(a)}" y1="${y + (r - 5) * Math.sin(a)}" x2="${x + (r + 5) * Math.cos(a + 0.22)}" y2="${y + (r + 5) * Math.sin(a + 0.22)}" stroke="${L}" stroke-width="1" opacity=".55"/>`;
      }).join('')}`).join(''),

  // threads laid in overlapping layers on a frame
  filindeu: () => `<circle cx="50" cy="50" r="38" fill="${F}" stroke="${L}" stroke-width="1.6" opacity=".55"/>
    ${Array.from({ length: 9 }, (_, i) => `<line x1="14" y1="${20 + i * 7.5}" x2="86" y2="${20 + i * 7.5}" stroke="${L}" stroke-width="1.1" opacity=".7"/>`).join('')}
    ${Array.from({ length: 9 }, (_, i) => `<line x1="${20 + i * 7.5}" y1="14" x2="${20 + i * 7.5}" y2="86" stroke="${L}" stroke-width="1.1" opacity=".45"/>`).join('')}
    <circle cx="50" cy="50" r="38" fill="none" stroke="${L}" stroke-width="2"/>`,

  // short buckwheat ribbons
  pizzoccheri: () => [22, 40, 58, 76].map((y, i) =>
    `<rect x="${14 + (i % 2) * 6}" y="${y}" width="${64 - (i % 2) * 8}" height="12" rx="2"
       transform="rotate(${i % 2 ? 3 : -3} 50 ${y + 6})" fill="${F}" stroke="${L}" stroke-width="1.4"/>`).join(''),

  // pressed through a perforated iron: thick, short, rough
  passatelli: () => [[24, 22], [52, 16], [70, 40], [30, 52], [58, 62], [26, 80], [62, 84]]
    .map(([x, y], i) =>
      `<rect x="${x}" y="${y}" width="26" height="9" rx="4.5" transform="rotate(${i * 27 - 20} ${x + 13} ${y + 4})" fill="${F}" stroke="${L}" stroke-width="1.3"/>`).join(''),

  // dragged flat across a ridged board
  strascinati: () => [[30, 30], [66, 50], [34, 74]].map(([x, y], i) =>
    `<g transform="rotate(${i * 22 - 14} ${x} ${y})">
      <path d="M${x - 20} ${y - 12} L${x + 20} ${y - 14} L${x + 22} ${y + 12} L${x - 18} ${y + 13} Z" fill="${F}" stroke="${L}" stroke-width="1.4" stroke-linejoin="round"/>
      ${[-12, -4, 4, 12].map(o => `<line x1="${x + o}" y1="${y - 11}" x2="${x + o}" y2="${y + 11}" stroke="${L}" stroke-width=".9" opacity=".45"/>`).join('')}
    </g>`).join(''),

  // rough buckwheat triangles
  blecs: () => `
    <path d="M18 24 L46 20 L30 48 Z" fill="${F}" stroke="${L}" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M56 22 L84 34 L58 50 Z" fill="${F}" stroke="${L}" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M20 58 L50 60 L30 86 Z" fill="${F}" stroke="${L}" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M58 60 L86 62 L70 88 Z" fill="${F}" stroke="${L}" stroke-width="1.4" stroke-linejoin="round"/>`,

  // a pancake cut into diamonds. The cuts are chords so none run past the edge.
  testaroli: () => {
    const R = 38, cx = 50, cy = 50;
    const chord = (offset, angleDeg) => {
      const a = angleDeg * Math.PI / 180;
      const half = Math.sqrt(Math.max(R * R - offset * offset, 0));
      const nx = Math.cos(a), ny = Math.sin(a);      // direction along the cut
      const px = -ny * offset, py = nx * offset;      // perpendicular offset
      return `<line x1="${cx + px - nx * half}" y1="${cy + py - ny * half}"
                    x2="${cx + px + nx * half}" y2="${cy + py + ny * half}"
                    stroke="${L}" stroke-width="1.2" opacity=".6"/>`;
    };
    return `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${F}" stroke="${L}" stroke-width="1.7"/>
      ${[-24, -8, 8, 24].map(o => chord(o, 45)).join('')}
      ${[-24, -8, 8, 24].map(o => chord(o, -45)).join('')}
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${L}" stroke-width="1.7"/>`;
  },

  // a filled parcel closed with a pleated seam
  culurgiones: () => `<ellipse cx="50" cy="54" rx="30" ry="26" fill="${F}" stroke="${L}" stroke-width="1.7"/>
    ${Array.from({ length: 9 }, (_, i) => {
      const x = 24 + i * 6.5;
      return `<path d="M${x} 34 Q${x + 3} 26 ${x + 6} 34" fill="none" stroke="${L}" stroke-width="1.3"/>`;
    }).join('')}
    <path d="M22 36 Q50 24 78 36" fill="none" stroke="${L}" stroke-width="1.4" opacity=".7"/>`,

  cavatelli: () => [[26, 26], [62, 40], [30, 68]].map(([x, y], i) =>
    `<g transform="rotate(${i * 30 - 20} ${x} ${y})">
      <path d="M${x - 20} ${y} Q${x} ${y - 16} ${x + 20} ${y} Q${x} ${y + 16} ${x - 20} ${y} Z" fill="${F}" stroke="${L}" stroke-width="1.6"/>
      <path d="M${x - 13} ${y - 1} Q${x} ${y - 9} ${x + 13} ${y - 1} Q${x} ${y + 7} ${x - 13} ${y - 1} Z" fill="var(--pasta-hole)" stroke="${L}" stroke-width="1.1"/>
    </g>`).join(''),

  malloreddus: () => [[30, 30], [66, 46], [34, 72]].map(([x, y], i) =>
    `<g transform="rotate(${i * 25 - 15} ${x} ${y})">
      <ellipse cx="${x}" cy="${y}" rx="21" ry="11" fill="${F}" stroke="${L}" stroke-width="1.6"/>
      ${[-12, -6, 0, 6, 12].map(o => `<line x1="${x + o}" y1="${y - 8}" x2="${x + o}" y2="${y + 8}" stroke="${L}" stroke-width="1" opacity=".5"/>`).join('')}
    </g>`).join(''),

  gnocchi: () => [[30, 32], [68, 44], [38, 72]].map(([x, y], i) =>
    `<g transform="rotate(${i * 20 - 10} ${x} ${y})">
      <ellipse cx="${x}" cy="${y}" rx="19" ry="13" fill="${F}" stroke="${L}" stroke-width="1.6"/>
      ${[-9, -3, 3, 9].map(o => `<path d="M${x + o} ${y - 9} Q${x + o + 2} ${y} ${x + o} ${y + 9}" fill="none" stroke="${L}" stroke-width="1" opacity=".5"/>`).join('')}
    </g>`).join(''),

  radiator: () => `<rect x="30" y="20" width="40" height="60" rx="8" fill="${F}" stroke="${L}" stroke-width="1.7"/>
    ${[0, 1, 2, 3, 4].map(i => {
      const y = 26 + i * 12;
      return `<path d="M30 ${y} L14 ${y - 5} L14 ${y + 5} Z" fill="${F}" stroke="${L}" stroke-width="1.4"/>
              <path d="M70 ${y} L86 ${y - 5} L86 ${y + 5} Z" fill="${F}" stroke="${L}" stroke-width="1.4"/>`;
    }).join('')}
    <ellipse cx="50" cy="20" rx="20" ry="6" fill="var(--pasta-hole)" stroke="${L}" stroke-width="1.5"/>`,

  wheel: () => `<circle cx="50" cy="50" r="36" fill="${F}" stroke="${L}" stroke-width="1.8"/>
    <circle cx="50" cy="50" r="26" fill="var(--pasta-hole)" stroke="${L}" stroke-width="1.5"/>
    <circle cx="50" cy="50" r="9" fill="${F}" stroke="${L}" stroke-width="1.5"/>
    ${Array.from({ length: 8 }, (_, i) => {
      const a = (i * 45 * Math.PI) / 180;
      return `<line x1="${50 + 9 * Math.cos(a)}" y1="${50 + 9 * Math.sin(a)}" x2="${50 + 26 * Math.cos(a)}" y2="${50 + 26 * Math.sin(a)}" stroke="${L}" stroke-width="4" stroke-linecap="round"/>`;
    }).join('')}`,

  campanelle: () => `<path d="M34 52 Q30 74 38 86 Q50 92 62 86 Q70 74 66 52 Z" fill="${F}" stroke="${L}" stroke-width="1.7"/>
    <path d="M14 40 Q22 22 31 38 Q40 20 50 36 Q60 20 69 38 Q78 22 86 40 Q70 60 50 60 Q30 60 14 40 Z"
      fill="${F}" stroke="${L}" stroke-width="1.7" stroke-linejoin="round"/>
    <ellipse cx="50" cy="46" rx="16" ry="7" fill="var(--pasta-hole)" stroke="${L}" stroke-width="1.5"/>`,

  grain: () => [[26, 28, -25], [66, 36, 20], [34, 62, 10], [70, 74, -15]].map(([x, y, r]) =>
    `<ellipse cx="${x}" cy="${y}" rx="17" ry="7" transform="rotate(${r} ${x} ${y})" fill="${F}" stroke="${L}" stroke-width="1.5"/>`).join(''),

  star: () => [[32, 32, 20], [68, 42, 22], [44, 72, 18]].map(([cx, cy, r]) => {
    let pts = '';
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 ? r * 0.45 : r;
      const a = (i * 36 - 90) * Math.PI / 180;
      pts += `${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)} `;
    }
    return `<polygon points="${pts}" fill="${F}" stroke="${L}" stroke-width="1.5" stroke-linejoin="round"/>
            <circle cx="${cx}" cy="${cy}" r="${r * 0.18}" fill="var(--pasta-hole)" stroke="${L}" stroke-width="1"/>`;
  }).join(''),

  dots: () => [[28, 30, 9], [58, 24, 7], [76, 44, 8], [40, 52, 8], [66, 68, 9], [30, 74, 7], [50, 84, 6]]
    .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${F}" stroke="${L}" stroke-width="1.4"/>`).join(''),

  ring: () => [[32, 34, 18], [68, 48, 16], [40, 72, 15]].map(([x, y, r]) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${F}" stroke="${L}" stroke-width="1.6"/>
     <circle cx="${x}" cy="${y}" r="${r * 0.5}" fill="var(--pasta-hole)" stroke="${L}" stroke-width="1.4"/>`).join(''),

  'ravioli-small': () => [[30, 30], [66, 40], [36, 68], [70, 74]].map(([x, y]) => {
    const w = 22;
    return `<rect x="${x - w / 2}" y="${y - w / 2}" width="${w}" height="${w}" rx="2" fill="${F}" stroke="${L}" stroke-width="1.3"/>
      <ellipse cx="${x}" cy="${y}" rx="6" ry="5" fill="var(--pasta-hole)" opacity=".75"/>`;
  }).join(''),

  // a wrapped sweet with twisted tails
  caramelle: () => [[34, 36], [64, 68]].map(([x, y], i) =>
    `<g transform="rotate(${i ? 18 : -14} ${x} ${y})">
      <rect x="${x - 16}" y="${y - 13}" width="32" height="26" rx="9" fill="${F}" stroke="${L}" stroke-width="1.5"/>
      <path d="M${x - 16} ${y - 6} L${x - 28} ${y - 13} L${x - 25} ${y} L${x - 28} ${y + 13} L${x - 16} ${y + 6} Z" fill="${F}" stroke="${L}" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M${x + 16} ${y - 6} L${x + 28} ${y - 13} L${x + 25} ${y} L${x + 28} ${y + 13} L${x + 16} ${y + 6} Z" fill="${F}" stroke="${L}" stroke-width="1.3" stroke-linejoin="round"/>
    </g>`).join(''),

  // gathered bundles
  purse: () => [[34, 40, 20], [66, 70, 17]].map(([x, y, r]) =>
    `<path d="M${x - r} ${y} Q${x - r} ${y + r * 1.3} ${x} ${y + r * 1.3} Q${x + r} ${y + r * 1.3} ${x + r} ${y} Z" fill="${F}" stroke="${L}" stroke-width="1.5"/>
     <path d="M${x - r} ${y} Q${x - r * 0.5} ${y - r * 0.5} ${x - r * 0.7} ${y - r}
        M${x - r * 0.3} ${y - r * 0.1} L${x - r * 0.2} ${y - r * 1.1}
        M${x + r * 0.3} ${y - r * 0.1} L${x + r * 0.4} ${y - r * 1.05}
        M${x + r} ${y} Q${x + r * 0.6} ${y - r * 0.5} ${x + r * 0.8} ${y - r}"
        fill="none" stroke="${L}" stroke-width="1.4" stroke-linecap="round"/>
     <ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.24}" fill="${F}" stroke="${L}" stroke-width="1.4"/>`).join(''),

  'triangle-filled': () => [[32, 32, 22], [66, 54, 19], [36, 76, 17]].map(([x, y, r]) =>
    `<path d="M${x} ${y - r} L${x + r} ${y + r * 0.7} L${x - r} ${y + r * 0.7} Z" fill="${F}" stroke="${L}" stroke-width="1.5" stroke-linejoin="round"/>
     <ellipse cx="${x}" cy="${y + r * 0.15}" rx="${r * 0.4}" ry="${r * 0.3}" fill="var(--pasta-hole)" opacity=".7"/>`).join(''),

  pansoti: () => [[34, 34, 24], [66, 68, 20]].map(([x, y, r]) =>
    `<path d="M${x - r} ${y - r * 0.6} L${x + r} ${y - r * 0.6} L${x} ${y + r * 0.8} Z" fill="${F}" stroke="${L}" stroke-width="1.5" stroke-linejoin="round"/>
     ${Array.from({ length: 7 }, (_, i) => `<circle cx="${x - r + i * (r / 3)}" cy="${y - r * 0.6}" r="2.4" fill="${F}" stroke="${L}" stroke-width="1"/>`).join('')}
     <circle cx="${x}" cy="${y - r * 0.05}" r="${r * 0.28}" fill="var(--pasta-hole)" opacity=".7"/>`).join(''),

  // a folded case pinched at both ends
  casoncelli: () => [[32, 34], [66, 66]].map(([x, y], i) =>
    `<g transform="rotate(${i ? 14 : -12} ${x} ${y})">
      <path d="M${x - 26} ${y} Q${x - 14} ${y - 18} ${x} ${y - 14} Q${x + 14} ${y - 18} ${x + 26} ${y}
              Q${x + 14} ${y + 18} ${x} ${y + 14} Q${x - 14} ${y + 18} ${x - 26} ${y} Z"
        fill="${F}" stroke="${L}" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M${x} ${y - 14} L${x} ${y + 14}" stroke="${L}" stroke-width="1.2" opacity=".5"/>
    </g>`).join(''),

  anolini: () => [[30, 32, 17], [66, 46, 15], [38, 72, 16]].map(([x, y, r]) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${F}" stroke="${L}" stroke-width="1.4"/>
     ${Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30) * Math.PI / 180;
        return `<circle cx="${x + r * Math.cos(a)}" cy="${y + r * Math.sin(a)}" r="2.1" fill="${F}" stroke="${L}" stroke-width=".9"/>`;
      }).join('')}
     <circle cx="${x}" cy="${y}" r="${r * 0.42}" fill="var(--pasta-hole)" opacity=".75"/>`).join(''),

  discs: () => [[32, 34, 19], [66, 52, 17], [38, 74, 16]].map(([x, y, r]) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${F}" stroke="${L}" stroke-width="1.5"/>
     <circle cx="${x}" cy="${y}" r="${r * 0.55}" fill="none" stroke="${L}" stroke-width="1" opacity=".4"/>`).join(''),

  balls: () => [[34, 36, 21], [68, 56, 18], [38, 76, 16]].map(([x, y, r]) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${F}" stroke="${L}" stroke-width="1.5"/>
     ${[0, 1, 2, 3, 4].map(i => `<circle cx="${x - r * 0.5 + (i * r) / 3}" cy="${y - r * 0.3 + (i % 2) * r * 0.5}" r="2" fill="${L}" opacity=".3"/>`).join('')}`).join(''),

  // a half-tube with a ruffle down each side
  cascatelli: () => `<g transform="rotate(-10 50 50)">
    <path d="M38 14 Q30 50 38 86 Q50 90 62 86 Q70 50 62 14 Q50 10 38 14 Z" fill="${F}" stroke="${L}" stroke-width="1.6"/>
    ${[0, 1, 2, 3, 4, 5].map(i => {
      const y = 20 + i * 12;
      return `<path d="M36 ${y} Q24 ${y + 4} 22 ${y + 10} Q32 ${y + 8} 36 ${y + 12}" fill="${F}" stroke="${L}" stroke-width="1.2"/>
              <path d="M64 ${y} Q76 ${y + 4} 78 ${y + 10} Q68 ${y + 8} 64 ${y + 12}" fill="${F}" stroke="${L}" stroke-width="1.2"/>`;
    }).join('')}
    <path d="M44 16 Q40 50 44 84" fill="none" stroke="${L}" stroke-width="1" opacity=".45"/>
  </g>`,

  // a fluted barrel
  zucca: () => `<ellipse cx="50" cy="52" rx="34" ry="30" fill="${F}" stroke="${L}" stroke-width="1.7"/>
    ${[-22, -11, 0, 11, 22].map(o => `<path d="M${50 + o} 24 Q${50 + o * 1.35} 52 ${50 + o} 80" fill="none" stroke="${L}" stroke-width="1.2" opacity=".55"/>`).join('')}
    <ellipse cx="50" cy="26" rx="12" ry="4.5" fill="var(--pasta-hole)" stroke="${L}" stroke-width="1.4"/>`,

  // a spinning top: a bulbed body drawn to a point, ribbon wound round it
  trottole: () => `<path d="M50 14 C70 20 78 38 76 52 C74 68 62 80 50 90
        C38 80 26 68 24 52 C22 38 30 20 50 14 Z"
      fill="${F}" stroke="${L}" stroke-width="1.6" stroke-linejoin="round"/>
    ${[0, 1, 2, 3, 4].map(i => {
      const y = 26 + i * 13;
      const w = 26 - Math.abs(i - 1.4) * 4;
      return `<path d="M${50 - w} ${y} Q50 ${y + 7} ${50 + w} ${y - 2}" fill="none" stroke="${L}" stroke-width="1.3" opacity=".6"/>`;
    }).join('')}
    <ellipse cx="50" cy="17" rx="9" ry="4" fill="var(--pasta-hole)" stroke="${L}" stroke-width="1.3"/>`,

  // a short hollow spiral
  'fusilli-bucati': () => `<path d="${helix(50, 16, 84, 19, 4)}" fill="none" stroke="${F}" stroke-width="15" stroke-linecap="round"/>
    <path d="${helix(50, 16, 84, 19, 4)}" fill="none" stroke="var(--pasta-hole)" stroke-width="5" stroke-linecap="round" opacity=".85"/>
    <path d="${helix(50, 16, 84, 19, 4)}" fill="none" stroke="${L}" stroke-width="1.2" opacity=".5"/>`,

  ravioli: () => `<path d="M18 18 L82 18 L82 82 L18 82 Z" fill="${F}" stroke="${L}" stroke-width="1.7"/>
    ${Array.from({ length: 32 }, (_, i) => {
      const per = i / 32;
      let x, y;
      if (per < 0.25) { x = 18 + per * 4 * 64; y = 18; }
      else if (per < 0.5) { x = 82; y = 18 + (per - 0.25) * 4 * 64; }
      else if (per < 0.75) { x = 82 - (per - 0.5) * 4 * 64; y = 82; }
      else { x = 18; y = 82 - (per - 0.75) * 4 * 64; }
      return `<circle cx="${x}" cy="${y}" r="2.6" fill="${F}" stroke="${L}" stroke-width="1.1"/>`;
    }).join('')}
    <ellipse cx="50" cy="50" rx="19" ry="15" fill="var(--pasta-hole)" opacity=".8"/>`,

  tortellini: () => `<circle cx="50" cy="56" r="30" fill="${F}" stroke="${L}" stroke-width="1.7"/>
    <circle cx="50" cy="56" r="12" fill="var(--pasta-hole)" stroke="${L}" stroke-width="1.4"/>
    <path d="M26 40 Q50 4 74 40 Q50 30 26 40 Z" fill="${F}" stroke="${L}" stroke-width="1.7" stroke-linejoin="round"/>
    <path d="M34 62 Q50 74 66 62" fill="none" stroke="${L}" stroke-width="1.2" opacity=".5"/>`,

  agnolotti: () => [[30, 32], [66, 50], [34, 74]].map(([x, y], i) =>
    `<g transform="rotate(${i * 18 - 12} ${x} ${y})">
      <rect x="${x - 22}" y="${y - 12}" width="44" height="24" rx="5" fill="${F}" stroke="${L}" stroke-width="1.6"/>
      <path d="M${x - 14} ${y - 12} L${x - 14} ${y + 12} M${x + 14} ${y - 12} L${x + 14} ${y + 12}" stroke="${L}" stroke-width="1.2" opacity=".55"/>
    </g>`).join(''),

  mezzelune: () => `<path d="M16 56 A34 34 0 0 1 84 56 Z" fill="${F}" stroke="${L}" stroke-width="1.7"/>
    ${Array.from({ length: 9 }, (_, i) => `<circle cx="${20 + i * 7.5}" cy="56" r="3" fill="${F}" stroke="${L}" stroke-width="1.1"/>`).join('')}
    <path d="M30 46 A22 22 0 0 1 70 46" fill="none" stroke="${L}" stroke-width="1.2" opacity=".5"/>`
};

function pastaSVG(type, cls) {
  const draw = ICONS[type] || ICONS.strand;
  return `<svg class="${cls || 'pasta-art'}" viewBox="0 0 100 100" role="img" aria-hidden="true">${draw()}</svg>`;
}
