import test from 'node:test';
import assert from 'node:assert/strict';
import { THEOREMS, LEVELS, LEMMAS, CORE, byId } from '../js/data.js';
import { machine, toolsFor } from '../js/game.js';
import { search } from '../js/methods.js';
import { show } from '../js/logic.js';
import { GUIDES, EXPLAIN } from '../js/explain.js';

const L4 = THEOREMS.filter((t) => t.niveau === 4);
const ids = (xs) => xs.map((x) => x.id);

test('niveau 4 : « La double négation », facultatif, toutes les méthodes', () => {
  const lv = LEVELS[3];
  assert.equal(lv.n, 4);
  assert.equal(lv.bonus, true);
  assert.deepEqual(lv.methods, ['sub', 'det', 'avant', 'arriere']);
  assert.ok(GUIDES[4] && GUIDES[4].pas.length >= 3);
});

test('*2.13 (Principia p. 106) est prêté : vrai énoncé, utile seulement au niveau 4', () => {
  assert.deepEqual(ids(LEMMAS), ['*2.13']);
  assert.equal(show(byId('*2.13').f, 'principia'), 'p ∨ ~~~p');
  assert.equal(byId('*2.13').pret, true);
  assert.ok(!ids(toolsFor(ids(CORE), CORE[11])).includes('*2.13'));
  assert.ok(ids(toolsFor(ids(CORE), L4[0])).includes('*2.13'));
  assert.ok(EXPLAIN['*2.13']);
});

test('honnêteté : les 4 méthodes du jeu ne trouvent pas *2.13 seules (d’où le prêt)', () => {
  const tools = toolsFor([...ids(CORE), '*2.11', '*2.12'], CORE[0]).filter((x) => x.id !== '*2.13');
  assert.equal(search(byId('*2.13').f, tools, LEVELS[3].methods, 3).path, null);
});

test('outils d’un théorème : seulement ce qui vient avant lui (rejouer ne triche pas)', () => {
  const all = ids(THEOREMS);
  const t = byId('*2.06');
  const got = ids(toolsFor(all, t));
  assert.deepEqual(got, ['*1.2', '*1.3', '*1.4', '*1.5', '*1.6', '*2.07', '*2.02', '*2.01', '*2.03']);
  assert.ok(!ids(toolsFor(all, byId('*2.11'))).includes('*2.11'));
});

const expected = {
  '*2.11': ['det:*1.4', 'sub:*2.08'],
  '*2.12': ['sub:*2.11'],
  '*2.14': ['det:*1.4', 'sub:*2.13'],
};
for (const t of L4) {
  test(`${t.id} : la machine du jeu le prouve comme les Principia`, () => {
    const res = machine(t.f, t, ids(THEOREMS));
    assert.ok(res.path, t.id);
    assert.deepEqual(res.path.map((s) => `${s.method}:${s.toolId}`), expected[t.id]);
    assert.ok(res.tries > 0);
  });
}

import { newProof, playStep } from '../js/game.js';
import { parse as P } from '../js/logic.js';

test('mini-exemple du niveau 4 : *2.11 avec p devenu « non p » donne *2.12', () => {
  const [b, o, r] = GUIDES[4].pas.map((s) => s.f);
  assert.equal(o, byId('*2.11').src);
  const pr = newProof({ id: 'x', f: P(b) });
  const res = playStep(pr, 'sub', '*2.11', { p: P('non p') });
  assert.ok(res.done);
  assert.equal(show(res.result), r);
});
