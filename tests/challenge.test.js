import test from 'node:test';
import assert from 'node:assert/strict';
import { byId } from '../js/data.js';
import { newProof, playStep, hint, resetProof, challengeScore, compareTries, machine } from '../js/game.js';
import { parse } from '../js/logic.js';

test('chaque « Essayer » compte un essai, réussi ou raté, même après Recommencer', () => {
  const t = byId('*2.07');
  const pr = newProof(t);
  assert.equal(pr.tries, 0);
  assert.equal(playStep(pr, 'sub', '*1.2').ok, false);
  resetProof(pr);
  assert.equal(playStep(pr, 'sub', '*1.3', { p: parse('p'), q: parse('p') }).ok, true);
  assert.equal(pr.tries, 2);
  assert.equal(challengeScore(pr), 2);
});

test('en défi, un indice compte comme un essai', () => {
  const t = byId('*2.07');
  const pr = newProof(t);
  hint(pr, t, []);
  hint(pr, t, []);
  assert.equal(pr.hints, 2);
  assert.equal(challengeScore(pr), 2);
});

test('comparer Camille et la machine', () => {
  assert.deepEqual(compareTries(3, 217), { result: 'win', diff: 214 });
  assert.deepEqual(compareTries(2, 2), { result: 'tie', diff: 0 });
  assert.deepEqual(compareTries(9, 2), { result: 'lose', diff: 7 });
});

test('la machine de *2.07 fait 2 essais : on peut la battre en 1', () => {
  const t = byId('*2.07');
  assert.equal(machine(t.f, t, []).tries, 2);
});
