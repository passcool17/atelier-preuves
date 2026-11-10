// Jardin zen dessiné en SVG. Chaque plante tient dans une boîte de 100 × 100 (base au centre en bas).
import { THEOREMS } from './data.js';

const C = {
  sand: '#ebe2cc', rake: '#d8ccb0', moss: '#7f9c6c', mossD: '#5f7d55', stone: '#a29d92', stoneD: '#7e796f',
  ink: '#3e4a44', pink: '#e8b7bd', pinkD: '#d4949d', water: '#bcd3d8', bark: '#7a5e48', maple: '#c97b55', iris: '#8c84b8',
};

const PLANTS = {
  galets: () => `
    <ellipse cx="34" cy="88" rx="16" ry="9" fill="${C.stone}"/><ellipse cx="60" cy="90" rx="12" ry="7" fill="${C.stoneD}"/>
    <ellipse cx="50" cy="78" rx="9" ry="6" fill="#bdb8ad"/>`,
  mousse: () => `
    <ellipse cx="50" cy="86" rx="30" ry="14" fill="${C.stone}"/>
    <path d="M24 82 q8-14 18-6 q8-12 18-2 q10-8 16 6 z" fill="${C.moss}"/><circle cx="40" cy="74" r="3" fill="${C.mossD}"/>`,
  bambou: () => [30, 48, 64]
    .map((x, i) => {
      const h = 70 - i * 10;
      const segs = [1, 2, 3].map((k) => `<rect x="${x - 4}" y="${95 - (h * k) / 3.2}" width="8" height="2" fill="${C.mossD}"/>`).join('');
      return `<rect x="${x - 3}" y="${95 - h}" width="6" height="${h}" rx="3" fill="${C.moss}"/>${segs}
        <path d="M${x} ${100 - h} q12 -6 18 2 q-10 2 -18 -2z" fill="${C.mossD}"/>`;
    })
    .join(''),
  iris: () => `
    <path d="M50 95 L50 50" stroke="${C.mossD}" stroke-width="3"/><path d="M50 92 q-14-20 -6-40" stroke="${C.moss}" stroke-width="4" fill="none"/>
    <path d="M50 92 q14-22 8-38" stroke="${C.moss}" stroke-width="4" fill="none"/>
    <path d="M50 50 q-14-10 -4-24 q4 10 4 24z" fill="${C.iris}"/><path d="M50 50 q14-10 4-24 q-4 10 -4 24z" fill="${C.iris}"/>
    <ellipse cx="50" cy="54" rx="10" ry="5" fill="#a59fcb"/>`,
  fougere: () => [-1, 1, 0]
    .map((d) => {
      const leaves = [0, 1, 2, 3, 4].map((k) => `<ellipse cx="${50 + d * (10 + k * 6)}" cy="${86 - k * 11}" rx="7" ry="3" fill="${C.moss}" transform="rotate(${d * -30} ${50 + d * (10 + k * 6)} ${86 - k * 11})"/>`).join('');
      return `<path d="M50 95 q${d * 30} -30 ${d * 34} -62" stroke="${C.mossD}" stroke-width="2.5" fill="none"/>${leaves}`;
    })
    .join(''),
  lotus: () => `
    <ellipse cx="50" cy="86" rx="40" ry="12" fill="${C.water}"/><ellipse cx="28" cy="86" rx="12" ry="5" fill="${C.moss}"/>
    <path d="M50 82 q-22-4 -20-22 q14 4 20 22z" fill="${C.pink}"/><path d="M50 82 q22-4 20-22 q-14 4 -20 22z" fill="${C.pink}"/>
    <path d="M50 82 q-10-18 0-34 q10 16 0 34z" fill="${C.pinkD}"/>`,
  pierre: () => `
    <path d="M18 94 q2-36 30-46 q30 0 36 46z" fill="${C.stone}"/><path d="M30 60 q16-16 34-6 q-16 0 -34 6z" fill="${C.moss}"/>
    <path d="M10 98 q40 -14 80 0" stroke="${C.rake}" stroke-width="2" fill="none"/>`,
  lanterne: () => `
    <rect x="42" y="72" width="16" height="24" fill="${C.stoneD}"/><rect x="32" y="66" width="36" height="7" rx="2" fill="${C.stone}"/>
    <rect x="38" y="46" width="24" height="20" fill="${C.stone}"/><rect x="45" y="51" width="10" height="10" fill="#f1dc9c"/>
    <path d="M28 46 L50 30 L72 46z" fill="${C.stoneD}"/><circle cx="50" cy="27" r="4" fill="${C.stone}"/>`,
  erable: () => `
    <path d="M50 96 L50 58 M50 70 L38 60 M50 66 L62 56" stroke="${C.bark}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <circle cx="38" cy="52" r="14" fill="${C.maple}"/><circle cx="62" cy="48" r="15" fill="#d9926c"/><circle cx="50" cy="38" r="15" fill="${C.maple}"/>`,
  pin: () => `
    <path d="M50 96 q-4-20 4-40 q-6-14 2-26" stroke="${C.bark}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <ellipse cx="34" cy="58" rx="20" ry="7" fill="${C.mossD}"/><ellipse cx="66" cy="44" rx="20" ry="7" fill="${C.mossD}"/>
    <ellipse cx="52" cy="28" rx="16" ry="6" fill="${C.moss}"/>`,
  cerisier: () => `
    <path d="M50 96 L50 60 M50 74 L32 56 M50 66 L70 50" stroke="${C.bark}" stroke-width="5" fill="none" stroke-linecap="round"/>
    ${[[30, 50], [44, 40], [58, 36], [72, 46], [38, 56], [64, 58], [52, 50]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="${C.pink}"/>`).join('')}
    <circle cx="44" cy="44" r="3" fill="#fff"/><circle cx="64" cy="42" r="3" fill="#fff"/>`,
  bonsai: () => `
    <path d="M28 86 h44 l-6 12 h-32z" fill="#8b6b5a"/>
    <path d="M50 86 q-14-12 0-24 q12-8 -2-20" stroke="${C.bark}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <ellipse cx="34" cy="56" rx="16" ry="8" fill="${C.moss}"/><ellipse cx="62" cy="48" rx="16" ry="8" fill="${C.mossD}"/>
    <ellipse cx="48" cy="36" rx="14" ry="8" fill="${C.moss}"/>`,
};

export function plantSvg(name, cls = '') {
  return `<svg class="plant ${cls}" viewBox="0 0 100 100" role="img" aria-label="${name}">${PLANTS[name]()}</svg>`;
}

// Centres des 12 emplacements dans le jardin (viewBox 400 × 320), en quinconce.
const SPOTS = [
  [60, 80], [155, 70], [250, 80], [345, 70],
  [105, 170], [200, 160], [295, 170], [362, 182],
  [45, 260], [145, 255], [245, 262], [340, 262],
];

const rake = () => {
  let s = '';
  for (let y = 14; y < 320; y += 11) s += `<path d="M0 ${y} Q100 ${y - 5} 200 ${y} T400 ${y}" stroke="${C.rake}" stroke-width="1.6" fill="none"/>`;
  return s;
};

/** Le jardin : une plante par théorème prouvé, des cercles ratissés pour les autres. */
export function gardenSvg(proven, { highlight = null } = {}) {
  const items = THEOREMS.map((t, i) => {
    const [x, y] = SPOTS[i];
    const ring = `<ellipse cx="${x}" cy="${y + 14}" rx="36" ry="20" fill="${C.sand}" stroke="${C.rake}" stroke-width="1.6"/><ellipse cx="${x}" cy="${y + 14}" rx="25" ry="13" fill="none" stroke="${C.rake}" stroke-width="1.6"/>`;
    if (!proven.includes(t.id)) return ring;
    const cls = t.id === highlight ? 'grow' : '';
    return `${ring}<g class="${cls}" style="transform-origin:${x}px ${y + 14}px"><g transform="translate(${x - 40} ${y - 62}) scale(0.8)">${PLANTS[t.plante]()}</g></g>`;
  }).join('');
  return `<svg class="garden" viewBox="0 0 400 320" role="img" aria-label="Jardin zen : ${proven.length} plantes sur 12">
    <rect width="400" height="320" rx="18" fill="${C.sand}"/>${rake()}${items}</svg>`;
}

export function iconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#dfe9ef"/>
  <circle cx="50" cy="56" r="34" fill="${C.sand}"/><path d="M22 60 q28-10 56 0 M24 70 q26-8 52 0" stroke="${C.rake}" stroke-width="3" fill="none"/>
  <g transform="translate(25 12) scale(0.5)">${PLANTS.bambou()}</g></svg>`;
}
