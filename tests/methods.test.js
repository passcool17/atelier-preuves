import test from 'node:test';
import assert from 'node:assert/strict';
import { parse, show, V } from '../js/logic.js';
import { applyMethod, search } from '../js/methods.js';
import { AXIOMS, THEOREMS, byId } from '../js/data.js';
import { newProof, playStep, hint, resetProof, substOptions } from '../js/game.js';

const ax = (id) => byId(id).f;

test('substitution : bonne et mauvaise', () => {
  const goal = parse('p → (p ou p)');
  assert.ok(applyMethod('sub', goal, ax('*1.3'), { p: V('p'), q: V('p') }).done);
  const bad = applyMethod('sub', goal, ax('*1.3'), { p: V('q'), q: V('p') });
  assert.equal(bad.ok, false);
  assert.match(bad.msg, /Réessaie/);
});

test('détachement : il reste à prouver le début de l’outil', () => {
  const r = applyMethod('det', parse('(p ou (q ou r)) → (p ou (r ou q))'), ax('*1.6'));
  assert.ok(r.ok);
  assert.equal(show(r.subgoal), '(q ou r) → (r ou q)');
});

test('chaînage avant et arrière', () => {
  const av = applyMethod('avant', parse('p → p'), byId('*2.07').f);
  assert.equal(show(av.subgoal), '(p ou p) → p');
  const ar = applyMethod('arriere', parse('p → (p ou q)'), ax('*1.4'));
  assert.equal(show(ar.subgoal), 'p → (q ou p)');
  assert.equal(applyMethod('avant', parse('p ou q'), ax('*1.4')).ok, false);
});

test('outil qui laisserait une lettre libre : refusé', () => {
  const r = applyMethod('det', parse('p'), ax('*1.2'));
  assert.equal(r.ok, true); // (p ou p) → p : toutes les lettres liées
  const r2 = applyMethod('arriere', parse('p → q'), ax('*1.3'));
  assert.equal(r2.ok, false);
});

test('la machine compte ses essais', () => {
  const r = search(parse('p → p'), [...AXIOMS, byId('*2.07')], ['sub', 'avant', 'arriere', 'det']);
  assert.ok(r.tries > 5);
  assert.deepEqual(r.path.map((s) => s.method), ['avant', 'sub']);
});

test('indice à 3 niveaux, puis étape complète', () => {
  const t = THEOREMS.find((x) => x.id === '*2.07');
  const p = newProof(t);
  assert.match(hint(p, t, []).text, /Substitution/);
  assert.match(hint(p, t, []).text, /Addition/);
  const h3 = hint(p, t, []);
  assert.equal(h3.level, 3);
  assert.match(h3.text, /q devient p/);
  assert.match(hint(p, t, [], 'principia').text, /\*1\.3/);
});

test('une étape ratée ne change pas la preuve ; recommencer revient au but', () => {
  const t = THEOREMS.find((x) => x.id === '*2.08');
  const p = newProof(t);
  assert.equal(playStep(p, 'sub', '*1.2', { p: V('p') }).ok, false);
  assert.equal(p.steps.length, 0);
  assert.equal(p.errors, 1);
  assert.ok(playStep(p, 'det', '*1.2').ok);
  assert.equal(p.goals.length, 2);
  resetProof(p);
  assert.equal(p.goals.length, 1);
  assert.ok(substOptions(p.goals[0]).length >= 4);
});
