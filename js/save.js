// Sauvegarde dans localStorage. Tolère une sauvegarde abîmée.
import { THEOREMS } from './data.js';

export const SAVE_KEY = 'atelier-preuves-v1';

export function defaultSave() {
  return { v: 1, proven: [], notation: 'simple', seenIntro: [], seenTuto: false };
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
      seenIntro: Array.isArray(d.seenIntro) ? d.seenIntro.filter((n) => [1, 2, 3].includes(n)) : [],
      seenTuto: d.seenTuto === true,
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

/** Prochain théorème à prouver (ordre fixe), ou null si le jardin est complet. */
export function nextTheorem(s) {
  return THEOREMS.find((t) => !s.proven.includes(t.id)) || null;
}
