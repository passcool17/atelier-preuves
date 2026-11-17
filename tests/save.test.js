import test from 'node:test';
import assert from 'node:assert/strict';
import { loadSave, writeSave, defaultSave, nextTheorem, SAVE_KEY } from '../js/save.js';

const mem = () => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), m };
};

test('sauvegarde vide : départ propre', () => {
  const s = loadSave(mem());
  assert.deepEqual(s, defaultSave());
  assert.equal(nextTheorem(s).id, '*2.07');
});

test('aller-retour et ordre du jeu conservé', () => {
  const st = mem();
  writeSave(st, { v: 1, proven: ['*2.02', '*2.07', '*9.99'], notation: 'principia', seenIntro: [1, 7] });
  const s = loadSave(st);
  assert.deepEqual(s.proven, ['*2.07', '*2.02']);
  assert.equal(s.notation, 'principia');
  assert.deepEqual(s.seenIntro, [1]);
  assert.equal(nextTheorem(s).id, '*2.01');
});

test('sauvegarde abîmée ou stockage absent', () => {
  const st = mem();
  st.setItem(SAVE_KEY, '{oups');
  assert.deepEqual(loadSave(st), defaultSave());
  assert.deepEqual(loadSave(null), defaultSave());
  assert.equal(writeSave({ setItem() { throw new Error('plein'); } }, defaultSave()), false);
});

test('jardin complet : plus de théorème suivant', () => {
  const all = ['*2.07', '*2.02', '*2.01', '*2.03', '*2.06', '*2.3', '*2.8', '*2.08', '*2.2', '*2.36', '*2.32', '*2.31'];
  assert.equal(nextTheorem({ proven: all }), null);
});

test('ancienne sauvegarde (sans tutoriel) : tout est gardé, le tutoriel s’affichera une fois', () => {
  const st = mem();
  st.setItem(SAVE_KEY, JSON.stringify({ v: 1, proven: ['*2.07', '*2.02'], notation: 'simple', seenIntro: [1] }));
  const s = loadSave(st);
  assert.deepEqual(s.proven, ['*2.07', '*2.02']);
  assert.deepEqual(s.seenIntro, [1]);
  assert.equal(s.seenTuto, false);
  writeSave(st, { ...s, seenTuto: true });
  assert.equal(loadSave(st).seenTuto, true);
});

import { nextBonus, bonusUnlocked, recordBest, setAudio } from '../js/save.js';

const CORE_IDS = ['*2.07', '*2.02', '*2.01', '*2.03', '*2.06', '*2.3', '*2.8', '*2.08', '*2.2', '*2.36', '*2.32', '*2.31'];

test('migration : une sauvegarde v1 d’avant (forme du 14 nov.) reste valide, réglages par défaut ajoutés', () => {
  const st = mem();
  // Forme exacte écrite par la version atelier-v2.
  st.setItem(SAVE_KEY, JSON.stringify({ v: 1, proven: ['*2.07', '*2.02', '*2.01'], notation: 'principia', seenIntro: [1], seenTuto: true }));
  const s = loadSave(st);
  assert.deepEqual(s.proven, ['*2.07', '*2.02', '*2.01']);
  assert.equal(s.notation, 'principia');
  assert.equal(s.seenTuto, true);
  assert.deepEqual(s.audio, { music: 0.5, sfx: 0.8, muted: false });
  assert.deepEqual(s.best, {});
  assert.equal(nextTheorem(s).id, '*2.03');
});

test('le bonus s’ouvre quand les 12 plantes du jardin sont là', () => {
  assert.equal(bonusUnlocked({ proven: CORE_IDS.slice(0, 11) }), false);
  assert.equal(nextBonus({ proven: CORE_IDS.slice(0, 11) }), null);
  assert.equal(bonusUnlocked({ proven: CORE_IDS }), true);
  assert.equal(nextBonus({ proven: CORE_IDS }).id, '*2.11');
  assert.equal(nextBonus({ proven: [...CORE_IDS, '*2.11', '*2.12', '*2.14'] }), null);
});

test('niveau 4 sauvegardé : intro vue et théorèmes bonus gardés', () => {
  const st = mem();
  writeSave(st, { ...defaultSave(), proven: [...CORE_IDS, '*2.11'], seenIntro: [1, 2, 3, 4] });
  const s = loadSave(st);
  assert.deepEqual(s.proven, [...CORE_IDS, '*2.11']);
  assert.deepEqual(s.seenIntro, [1, 2, 3, 4]);
});

test('son : réglages bornés et gardés après rechargement', () => {
  const st = mem();
  const s = setAudio(defaultSave(), { muted: true, music: 2, sfx: -1 });
  assert.deepEqual(s.audio, { music: 1, sfx: 0, muted: true });
  writeSave(st, s);
  assert.deepEqual(loadSave(st).audio, { music: 1, sfx: 0, muted: true });
  st.setItem(SAVE_KEY, JSON.stringify({ v: 1, proven: [], audio: { music: 'fort', muted: 'oui' } }));
  assert.deepEqual(loadSave(st).audio, { music: 0.5, sfx: 0.8, muted: false });
});

test('défi : meilleur score gardé par théorème, inconnu ignoré', () => {
  const st = mem();
  let s = defaultSave();
  let r = recordBest(s, '*2.07', 3);
  assert.equal(r.isBest, true);
  r = recordBest(r.save, '*2.07', 5);
  assert.equal(r.isBest, false);
  r = recordBest(r.save, '*2.07', 1);
  assert.equal(r.isBest, true);
  s = r.save;
  assert.deepEqual(s.best, { '*2.07': 1 });
  writeSave(st, { ...s, best: { ...s.best, '*9.9': 2, '*2.02': 'x' } });
  assert.deepEqual(loadSave(st).best, { '*2.07': 1 });
});
