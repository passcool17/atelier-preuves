// Sauvegarde dans localStorage. Tolère une sauvegarde abîmée.
import { THEOREMS, CORE } from './data.js';

export const SAVE_KEY = 'atelier-preuves-v1';

export function defaultSave() {
  return { v: 1, proven: [], notation: 'simple', seenIntro: [], seenTuto: false, audio: defaultAudio(), best: {} };
}

/** Son : volumes 0..1 et coupure. Ajouté en atelier-v3 ; absent des anciennes sauvegardes. */
export const defaultAudio = () => ({ music: 0.5, sfx: 0.8, muted: false });
const vol = (x, d) => (typeof x === 'number' && Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : d);

function readAudio(a) {
  const d = defaultAudio();
  if (!a || typeof a !== 'object') return d;
  return { music: vol(a.music, d.music), sfx: vol(a.sfx, d.sfx), muted: typeof a.muted === 'boolean' ? a.muted : d.muted };
}

function readBest(b, ids) {
  const out = {};
  if (!b || typeof b !== 'object') return out;
  for (const [id, n] of Object.entries(b)) if (ids.has(id) && Number.isInteger(n) && n > 0) out[id] = n;
  return out;
}

export function setAudio(s, patch) {
  return { ...s, audio: readAudio({ ...s.audio, ...patch }) };
}

/** Garde le plus petit nombre d'essais en défi. */
export function recordBest(s, id, tries) {
  const prev = s.best && s.best[id];
  const isBest = !prev || tries < prev;
  return { isBest, save: isBest ? { ...s, best: { ...s.best, [id]: tries } } : s };
}

export function loadSave(storage) {
  try {
    const raw = storage && storage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const d = JSON.parse(raw);
    const ids = new Set(THEOREMS.map((t) => t.id));
    return {
      v: 1,
      proven: Array.isArray(d.proven) ? THEOREMS.map((t) => t.id).filter((id) => d.proven.includes(id) && ids.has(id)) : [],
      notation: d.notation === 'principia' ? 'principia' : 'simple',
      seenIntro: Array.isArray(d.seenIntro) ? d.seenIntro.filter((n) => [1, 2, 3, 4].includes(n)) : [],
      seenTuto: d.seenTuto === true,
      audio: readAudio(d.audio),
      best: readBest(d.best, ids),
    };
  } catch {
    return defaultSave();
  }
}

export function writeSave(storage, s) {
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(s));
    return true;
  } catch {
    return false;
  }
}

/** Prochain théorème du jardin à prouver (ordre fixe), ou null si les 12 sont prouvés. */
export function nextTheorem(s) {
  return CORE.find((t) => !s.proven.includes(t.id)) || null;
}

/** Le niveau 4 (facultatif) s'ouvre quand les 12 plantes du jardin sont là. */
export const bonusUnlocked = (s) => CORE.every((t) => s.proven.includes(t.id));

export function nextBonus(s) {
  if (!bonusUnlocked(s)) return null;
  return THEOREMS.find((t) => t.niveau === 4 && !s.proven.includes(t.id)) || null;
}
