import test from 'node:test';
import assert from 'node:assert/strict';
import { parse, show, norm, equiv, match, subst, vars, pretty, asImp, V, N, O, I } from '../js/logic.js';

test('lecture des trois notations', () => {
  const a = parse('(p → non q) → (q ou p)');
  assert.deepEqual(a, parse('(p ⊃ ~q) ⊃ (q ∨ p)'));
  assert.deepEqual(a, parse('( ( p -> ~ q ) -> ( q \\/ p ) )'));
  assert.deepEqual(parse('¬p'), N(V('p')));
  assert.throws(() => parse('p → '));
  assert.throws(() => parse('p x q'));
});

test('« A → B » égale « non A ou B » (définition *1.01)', () => {
  assert.deepEqual(norm(I(V('p'), V('q'))), O(N(V('p')), V('q')));
  assert.ok(equiv(parse('p → p'), parse('non p ou p')));
  assert.ok(!equiv(parse('p → q'), parse('q → p')));
  assert.deepEqual(pretty(parse('non p ou (q ou p)')), parse('p → (q ou p)'));
  assert.deepEqual(asImp(parse('non p ou q')), parse('p → q'));
  assert.equal(asImp(parse('p ou q')), null);
});

test('appariement et substitution', () => {
  const ax = parse('q → (p ou q)');
  const s = match(ax, parse('p → (p ou p)'));
  assert.deepEqual(s, { q: V('p'), p: V('p') });
  // Avec la définition : q → (non p ou q) se lit q → (p → q).
  const s2 = match(ax, parse('q → (p → q)'));
  assert.ok(equiv(s2.p, N(V('p'))));
  assert.equal(match(ax, parse('p → (q ou r)')), null);
  assert.deepEqual(subst(parse('p ou q'), { p: V('q'), q: V('p') }), parse('q ou p'));
  assert.deepEqual([...vars(parse('(p ou q) → r'))].sort(), ['p', 'q', 'r']);
});
