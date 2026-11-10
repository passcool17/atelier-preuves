import test from 'node:test';
import assert from 'node:assert/strict';
import { THEOREMS, AXIOMS, LEVELS } from '../js/data.js';
import { newProof, playStep, machine, substOptions, currentGoal, toolsFor } from '../js/game.js';
import { equiv, parse, show } from '../js/logic.js';

test('12 théorèmes, 3 niveaux de 4, 5 axiomes', () => {
  assert.equal(THEOREMS.length, 12);
  for (const n of [1, 2, 3]) assert.equal(THEOREMS.filter((t) => t.niveau === n).length, 4);
  assert.equal(AXIOMS.length, 5);
  assert.equal(new Set(THEOREMS.map((t) => t.plante)).size, 12);
});

test('formules identiques aux Principia (notation ⊃ ∨ ~)', () => {
  const pm = {
    '*2.07': 'p ⊃ (p ∨ p)', '*2.02': 'q ⊃ (p ⊃ q)', '*2.01': '(p ⊃ ~p) ⊃ ~p', '*2.03': '(p ⊃ ~q) ⊃ (q ⊃ ~p)',
    '*2.06': '(p ⊃ q) ⊃ ((q ⊃ r) ⊃ (p ⊃ r))', '*2.3': '(p ∨ (q ∨ r)) ⊃ (p ∨ (r ∨ q))',
    '*2.8': '(q ∨ r) ⊃ ((~r ∨ s) ⊃ (q ∨ s))', '*2.08': 'p ⊃ p', '*2.2': 'p ⊃ (p ∨ q)',
    '*2.36': '(q ⊃ r) ⊃ ((p ∨ q) ⊃ (r ∨ p))', '*2.32': '((p ∨ q) ∨ r) ⊃ (p ∨ (q ∨ r))',
    '*2.31': '(p ∨ (q ∨ r)) ⊃ ((p ∨ q) ∨ r)',
  };
  for (const t of THEOREMS) assert.equal(show(t.f, 'principia'), pm[t.id], t.id);
});

for (const [i, t] of THEOREMS.entries()) {
  test(`${t.id} est prouvable en 1 à 3 étapes au niveau ${t.niveau}`, () => {
    const proven = THEOREMS.slice(0, i).map((x) => x.id);
    const res = machine(t.f, t, proven);
    assert.ok(res.path, `${t.id} sans preuve`);
    assert.ok(res.path.length >= 1 && res.path.length <= 3);
    const methods = res.path.map((s) => s.method);
    if (t.niveau === 1) assert.deepEqual(methods, ['sub']);
    if (t.niveau === 2) assert.ok(methods.includes('det'));
    if (t.niveau === 3) assert.ok(methods.some((m) => m === 'avant' || m === 'arriere'));
    // Rejoue la preuve comme la joueuse : la substitution passe par la forme guidée.
    const proof = newProof(t);
    for (const st of res.path) {
      let sigma;
      if (st.method === 'sub') {
        const opts = substOptions(currentGoal(proof));
        sigma = {};
        for (const [v, val] of Object.entries(st.sigma)) {
          const choice = opts.find((o) => equiv(o, val));
          assert.ok(choice, `${t.id} : ${show(val)} absent des choix`);
          sigma[v] = choice;
        }
      }
      const r = playStep(proof, st.method, st.toolId, sigma);
      assert.ok(r.ok, `${t.id} : ${r.msg}`);
    }
    assert.ok(proof.done);
    // Outils utilisés : axiomes ou théorèmes déjà prouvés seulement.
    const allowed = toolsFor(proven).map((x) => x.id);
    for (const st of res.path) assert.ok(allowed.includes(st.toolId));
  });
}

test('le niveau 1 ne permet que la substitution', () => {
  assert.deepEqual(LEVELS[0].methods, ['sub']);
  assert.ok(equiv(parse('q → (p → q)'), parse('q ou (non p ou q)')) === false);
  assert.ok(equiv(parse('q → (p → q)'), parse('non q ou (non p ou q)')));
});
