import test from 'node:test';
import assert from 'node:assert/strict';
import { parse, show } from '../js/logic.js';

test('notation simple : → , ou, non', () => {
  assert.equal(show(parse('(p ⊃ ~q) ⊃ (q ⊃ ~p)')), '(p → non q) → (q → non p)');
  assert.equal(show(parse('~(p ∨ q)')), 'non (p ou q)');
});

test('notation des Principia : ⊃, ∨, ~', () => {
  assert.equal(show(parse('(p → non q) → (q ou p)'), 'principia'), '(p ⊃ ~q) ⊃ (q ∨ p)');
});

test('aller-retour sans perte', () => {
  for (const s of ['p → (p ou p)', '((p ou q) ou r) → (p ou (q ou r))', 'non non p → p']) {
    assert.equal(show(parse(s)), s);
    assert.equal(show(parse(show(parse(s), 'principia'))), s);
  }
});
