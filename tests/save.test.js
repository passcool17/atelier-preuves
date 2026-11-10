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
