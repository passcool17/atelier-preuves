import test from 'node:test';
import assert from 'node:assert/strict';
import { THEOREMS, AXIOMS, LEVELS, byId } from '../js/data.js';
import { TUTORIAL, GUIDES, EXPLAIN, GLOSSARY, FLECHE, MACHINE_WHY, explainStep, usedDefinition } from '../js/explain.js';
import { machine, newProof, playStep, currentGoal } from '../js/game.js';
import { parse, show, vars, equiv, norm } from '../js/logic.js';

const words = (s) => s.split(/\s+/).length;

/** Valeur de vérité d'une formule (table de vérité). */
function val(f, env) {
  switch (f.t) {
    case 'v': return env[f.n];
    case 'n': return !val(f.a, env);
    case 'o': return val(f.a, env) || val(f.b, env);
    default: return !val(f.a, env) || val(f.b, env);
  }
}
function tautology(f) {
  const vs = [...vars(f)];
  for (let m = 0; m < 1 << vs.length; m += 1) {
    if (!val(f, Object.fromEntries(vs.map((v, i) => [v, Boolean(m & (1 << i))])))) return false;
  }
  return true;
}

test('tutoriel : 4 à 6 cartes courtes, chacune avec un exemple', () => {
  assert.ok(TUTORIAL.length >= 4 && TUTORIAL.length <= 6);
  for (const c of TUTORIAL) {
    assert.ok(c.titre && c.texte && c.ex);
    assert.ok(words(c.texte) <= 40, c.titre);
    assert.ok(words(c.ex) <= 40, c.titre);
  }
  const all = TUTORIAL.map((c) => c.titre + c.texte).join(' ');
  for (const k of ['preuve', 'p, q', '→', '« ou »', '« non »', 'axiome', '1956']) assert.ok(all.includes(k), k);
});

test('chaque niveau a une analogie et un mini-exemple pas à pas', () => {
  for (const lv of LEVELS) {
    const g = GUIDES[lv.n];
    assert.ok(g && g.analogie && g.pas.length >= 3, `niveau ${lv.n}`);
    for (const st of g.pas) if (st.f && !st.mots) parse(st.f);
  }
  assert.ok(GUIDES[2].fleche, 'le secret de la flèche est expliqué au niveau 2');
});

test('mini-exemples des guides : les pas sont justes', () => {
  // Niveau 1 : q → (p ou q), q devient p, donne le but.
  const [b1, o1, r1] = GUIDES[1].pas.map((s) => s.f);
  assert.ok(equiv(parse(r1), parse(b1)));
  assert.ok(playStep(newProof({ id: 'x', f: parse(b1) }), 'sub', '*1.3', { q: parse('p'), p: parse('p') }).done);
  assert.equal(o1, AXIOMS[1].src);
  // Niveau 2 : détachement de r ou s avec *1.3 donne le but s.
  const pr = { thmId: 'x', goals: [parse(GUIDES[2].pas[0].f)], steps: [], done: false, hint: 0, errors: 0 };
  const r = playStep(pr, 'det', '*1.3');
  assert.ok(r.ok);
  assert.equal(show(r.subgoal), GUIDES[2].pas[3].f);
});

for (const x of [...AXIOMS, ...THEOREMS]) {
  test(`${x.id} : phrase en français et exemple concret`, () => {
    const e = EXPLAIN[x.id];
    assert.ok(e, `${x.id} sans explication`);
    assert.ok(e.fr && e.ex, x.id);
    assert.ok(words(e.fr) <= 45 && words(e.ex) <= 45, `${x.id} trop long`);
    // L'exemple donne un sens à chaque lettre de la formule, et seulement à elles.
    assert.deepEqual(Object.keys(e.lettres).sort(), [...vars(x.f)].sort(), x.id);
    // Sanity : tout outil est toujours vrai (table de vérité).
    assert.ok(tautology(x.f), `${x.id} n’est pas une tautologie`);
  });
}

test('le drapeau « flèche » correspond aux preuves de la machine', () => {
  for (const [i, t] of THEOREMS.entries()) {
    const proven = THEOREMS.slice(0, i).map((x) => x.id);
    const res = machine(t.f, t, proven);
    const uses = res.path.some((s) => usedDefinition(s.method, s.goal, byId(s.toolId).f, s.sigma));
    assert.equal(Boolean(EXPLAIN[t.id].fleche), uses, t.id);
  }
});

test('le secret de la flèche est exact : A → B = non A ou B', () => {
  assert.ok(equiv(parse('p → q'), parse('non p ou q')));
  assert.ok(FLECHE.texte.includes('non A ou B'));
});

test('« Ce que tu viens de faire » pour chaque étape des 12 preuves', () => {
  for (const [i, t] of THEOREMS.entries()) {
    const proven = THEOREMS.slice(0, i).map((x) => x.id);
    const res = machine(t.f, t, proven);
    const pr = newProof(t);
    for (const st of res.path) {
      const goal = currentGoal(pr);
      const r = playStep(pr, st.method, st.toolId, st.method === 'sub' ? st.sigma : undefined);
      assert.ok(r.ok);
      const txt = explainStep({ method: st.method, goal, tool: byId(st.toolId).f, nom: byId(st.toolId).nom, sigma: r.sigma, subgoal: r.subgoal, done: r.done }, (f) => show(f));
      assert.ok(txt.length > 20 && txt.includes(byId(st.toolId).nom), `${t.id} ${st.method}`);
      if (r.subgoal) assert.ok(txt.includes(show(r.subgoal)));
      if (st.method === 'sub') assert.ok(txt.includes('ton but est vrai'));
    }
    assert.ok(pr.done);
  }
});

test('glossaire et écran de la machine', () => {
  const terms = GLOSSARY.map(([t]) => t);
  for (const k of ['Axiome', 'Théorème', 'Substitution', 'Détachement', 'Chaînage', 'Heuristique', '→']) assert.ok(terms.includes(k), k);
  for (const [, d] of GLOSSARY) assert.ok(words(d) <= 25);
  const m = MACHINE_WHY.join(' ');
  assert.ok(m.includes('essaie') && m.includes('heuristique') && m.includes('IA'));
});

test('norm ne casse pas : l’ancien moteur reste intact', () => {
  assert.equal(show(norm(parse('p → q'))), 'non p ou q');
});
