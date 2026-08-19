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

  sheet: () => `<path d="M14 12 Q22 20 14 28 Q22 36 14 44 Q22 52 14 60 Q22 68 14 76 Q22 84 14 88
      L86 88 Q78 80 86 72 Q78 64 86 56 Q78 48 86 40 Q78 32 86 24 Q78 16 86 12 Z"
      fill="${F}" stroke="${L}" stroke-width="1.8" stroke-linejoin="round"/>`,

  penne: () => quill(true),
  'penne-smooth': () => quill(false),

  rigatoni: () => tube(28, 20, 44, 60, true, -8),
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
