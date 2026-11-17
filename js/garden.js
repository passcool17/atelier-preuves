// Jardin zen dessiné en SVG. Chaque plante tient dans une boîte de 100 × 100 (base au centre en bas).
import { THEOREMS, CORE } from './data.js';
import { artUrl, plantUrl, gardenBg, STAGES } from './art.js';

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
  // Niveau 4 (placeholders) : bassin de pierre, petit pont, carpe koï.
  tsukubai: () => `
    <ellipse cx="50" cy="88" rx="30" ry="9" fill="${C.stoneD}"/><path d="M24 86 q0-26 26-28 q26 2 26 28z" fill="${C.stone}"/>
    <ellipse cx="50" cy="62" rx="18" ry="5" fill="${C.water}"/><path d="M70 46 h18 M72 46 v-8" stroke="${C.bark}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="44" cy="62" r="2" fill="#fff" opacity=".7"/>`,
  pont: () => `
    <ellipse cx="50" cy="90" rx="44" ry="8" fill="${C.water}"/>
    <path d="M10 82 q40-40 80 0" stroke="#b5533c" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M22 70 v14 M50 56 v22 M78 70 v14" stroke="#b5533c" stroke-width="4"/><path d="M14 66 q36-32 72 0" stroke="#c96a50" stroke-width="3" fill="none"/>`,
  koi: () => `
    <ellipse cx="50" cy="80" rx="42" ry="16" fill="${C.water}"/>
    <path d="M28 78 q18-16 40-4 q-20 12 -40 4z" fill="#e9874f"/><path d="M68 74 l12-8 v18z" fill="#e9874f"/>
    <circle cx="36" cy="76" r="2" fill="${C.ink}"/><path d="M46 72 q6 4 10 0" stroke="#fff" stroke-width="3" fill="none"/>
    <ellipse cx="30" cy="92" rx="8" ry="3" fill="${C.moss}"/>`,
};

/** Une plante en floraison : l’illustration livrée (js/art.js), sinon le dessin SVG. */
export function plantSvg(name, cls = '') {
  const url = plantUrl(name, 'bloom');
  if (url) return `<img class="plant ${cls}" src="${url}" alt="" width="384" height="384" decoding="async">`;
  return `<svg class="plant ${cls}" viewBox="0 0 100 100" aria-hidden="true">${PLANTS[name]()}</svg>`;
}

/** Pousse animée (écran de réussite) : graine, puis germe, puis floraison, empilés et enchaînés en CSS. */
export function plantGrow(name) {
  if (!plantUrl(name)) return plantSvg(name, 'grow');
  const img = (st) => `<img class="st st-${st}" src="${plantUrl(name, st)}" alt="" width="384" height="384" decoding="async">`;
  return `<div class="grow3">${STAGES.map(img).join('')}</div>`;
}

/** Stade d’une plante dans le jardin. */
export const stageOf = (id, proven, current) => (proven.includes(id) ? 'bloom' : id === current ? 'sprout' : 'seed');

/** Illustration d’intro de niveau (800×400). Placeholder SVG si l’image manque. */
export function introArt(n) {
  const url = artUrl('intros', `niveau-${n}`);
  if (url) return `<img class="intro-art" src="${url}" alt="" width="800" height="400" decoding="async">`;
  const pl = { 1: 'galets', 2: 'lotus', 3: 'cerisier', 4: 'koi' }[n];
  return `<svg class="intro-art" viewBox="0 0 400 200" aria-hidden="true"><rect width="400" height="200" rx="16" fill="${C.sand}"/>${rake(200)}
    <g class="intro-plant" style="transform-origin:200px 180px"><g transform="translate(140 60) scale(1.2)">${PLANTS[pl]()}</g></g></svg>`;
}

// Pied des 12 plantes dans le jardin (viewBox 400 × 320), en quinconce, sur le sable du fond illustré.
const SPOTS = [
  [75, 128], [160, 128], [245, 128], [330, 128],
  [100, 208], [185, 208], [270, 208], [345, 208],
  [70, 288], [155, 288], [240, 288], [325, 288],
];

const rake = (h = 320) => {
  let s = '';
  for (let y = 14; y < h; y += 11) s += `<path d="M0 ${y} Q100 ${y - 5} 200 ${y} T400 ${y}" stroke="${C.rake}" stroke-width="1.6" fill="none"/>`;
  return s;
};

/** Un emplacement : cercle ratissé + plante au bon stade. (x, y) = pied de la plante. */
function spot(t, x, y, { proven, current, replay, size = 80 }) {
  const st = stageOf(t.id, proven, current);
  const bed = `<ellipse cx="${x}" cy="${y}" rx="${size * 0.4}" ry="${size * 0.12}" fill="none" stroke="${C.rake}" stroke-width="1.4" opacity=".75"/>`;
  const url = plantUrl(t.plante, st);
  let pic;
  if (url) pic = `<image href="${url}" x="${x - size / 2}" y="${y - size * 0.94}" width="${size}" height="${size}"/>`;
  else if (st === 'bloom') pic = `<g transform="translate(${x - 40} ${y - 76}) scale(0.8)">${PLANTS[t.plante]()}</g>`;
  else pic = '';
  const btn = replay && st === 'bloom' ? ` data-action="replay" data-id="${t.id}" role="button" tabindex="0" aria-label="Rejouer « ${t.nom} »"` : '';
  return `<g class="pl st-${st}" data-x="${x}"${btn} style="transform-origin:${x}px ${y}px"><rect x="${x - size / 2}" y="${y - size}" width="${size}" height="${size + 8}" fill="transparent"/>${bed}${pic}</g>`;
}

const dprNow = () => (typeof window !== 'undefined' && window.devicePixelRatio) || 2;

/** Le jardin : 12 emplacements. current = théorème en cours (germe). replay : plantes prouvées touchables. */
export function gardenSvg(proven, { current = null, replay = false, dpr = dprNow() } = {}) {
  const items = CORE.map((t, i) => spot(t, ...SPOTS[i], { proven, current, replay })).join('');
  const n = CORE.filter((t) => proven.includes(t.id)).length;
  const bg = gardenBg('fond', dpr);
  return `<svg class="garden${replay ? ' touch' : ''}" viewBox="0 0 400 320" role="group" aria-label="Jardin zen : ${n} plante${n > 1 ? 's' : ''} sur 12">
    ${bg ? `<image href="${bg}" width="400" height="320" preserveAspectRatio="xMidYMid slice"/>` : `<rect width="400" height="320" rx="18" fill="${C.sand}"/>${rake()}`}${items}</svg>`;
}

/** Le coin bonus (niveau 4) : 3 emplacements au bord de l’eau. */
export function bonusGardenSvg(proven, { current = null, replay = false, dpr = dprNow() } = {}) {
  const L4 = THEOREMS.filter((t) => t.niveau === 4);
  const items = L4.map((t, i) => spot(t, 80 + i * 120, 76, { proven, current, replay, size: 62 })).join('');
  const n = L4.filter((t) => proven.includes(t.id)).length;
  const bg = gardenBg('bonus', dpr);
  return `<svg class="garden bonus${replay ? ' touch' : ''}" viewBox="0 0 400 120" role="group" aria-label="Coin bonus : ${n} plante${n > 1 ? 's' : ''} sur 3">
    ${bg ? `<image href="${bg}" width="400" height="120" preserveAspectRatio="xMidYMid slice"/>` : `<rect width="400" height="120" rx="18" fill="${C.sand}"/>${rake(120)}<path d="M0 104 q100 -14 200 0 t200 0 v16 h-400z" fill="${C.water}" opacity=".7"/>`}${items}</svg>`;
}

export function iconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#dfe9ef"/>
  <circle cx="50" cy="56" r="34" fill="${C.sand}"/><path d="M22 60 q28-10 56 0 M24 70 q26-8 52 0" stroke="${C.rake}" stroke-width="3" fill="none"/>
  <g transform="translate(25 12) scale(0.5)">${PLANTS.bambou()}</g></svg>`;
}
