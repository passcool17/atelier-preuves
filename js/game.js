// État d'une preuve, sans DOM : facile à tester.
import { AXIOMS, LEVELS, THEOREMS, byId } from './data.js';
import { applyMethod, search, METHODS } from './methods.js';
import { equiv, key, norm, subformulas, show, V, N, vars } from './logic.js';

export const levelOf = (thm) => LEVELS[thm.niveau - 1];

/** Outils disponibles : axiomes + théorèmes déjà prouvés (dans l'ordre du jeu). */
export function toolsFor(proven) {
  return [...AXIOMS, ...THEOREMS.filter((t) => proven.includes(t.id))];
}

export function newProof(thm) {
  return { thmId: thm.id, goals: [thm.f], steps: [], done: false, hint: 0, errors: 0 };
}

export const currentGoal = (p) => p.goals[p.goals.length - 1];

/** Choix proposés pour remplacer une lettre (forme guidée). */
export function substOptions(goal) {
  const pool = [V('p'), V('q'), V('r'), V('s'), N(V('p')), N(V('q')), N(V('r')), ...subformulas(goal), ...subformulas(norm(goal))];
  const seen = new Set();
  const out = [];
  for (const f of pool) {
    const k = key(norm(f));
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(f);
  }
  out.sort((a, b) => show(a).length - show(b).length);
  return out.filter((f) => show(f).length <= 40);
}

/** Une étape jouée. Renvoie le résultat ; modifie la preuve seulement si l'étape est valide. */
export function playStep(proof, method, toolId, sigma) {
  const tool = byId(toolId);
  const goal = currentGoal(proof);
  const r = applyMethod(method, goal, tool.f, sigma);
  if (!r.ok) {
    proof.errors += 1;
    return r;
  }
  proof.steps.push({ method, toolId, sigma: r.sigma });
  if (r.done) proof.done = true;
  else proof.goals.push(r.subgoal);
  proof.hint = 0;
  return r;
}

export function resetProof(proof) {
  proof.goals = proof.goals.slice(0, 1);
  proof.steps = [];
  proof.done = false;
  proof.hint = 0;
}

/** Recherche de la machine à partir du but courant, avec les outils et méthodes du niveau. */
export function machine(goal, thm, proven) {
  return search(goal, toolsFor(proven), levelOf(thm).methods);
}

/** Indice à 3 niveaux : méthode, puis outil, puis étape complète. */
export function hint(proof, thm, proven, mode = 'simple') {
  const res = machine(currentGoal(proof), thm, proven);
  if (!res.path) return { level: 0, text: 'Recommence cette preuve depuis le début : ce chemin ne mène nulle part.' };
  proof.hint = Math.min(3, proof.hint + 1);
  const st = res.path[0];
  const m = METHODS[st.method].nom;
  const tool = byId(st.toolId);
  const tname = mode === 'principia' ? `${tool.id}` : `« ${tool.nom} »`;
  if (proof.hint === 1) return { level: 1, step: st, text: `Essaie la méthode : ${m}.` };
  if (proof.hint === 2) return { level: 2, step: st, text: `${m}, avec l’outil ${tname}.` };
  let detail = '';
  if (st.method === 'sub') {
    const parts = [...vars(tool.f)]
      .sort()
      .filter((v) => !equiv(st.sigma[v], V(v)))
      .map((v) => `${v} devient ${show(st.sigma[v], mode)}`);
    detail = parts.length ? ` Remplace : ${parts.join(', ')}.` : ' Garde toutes les lettres telles quelles.';
  }
  return { level: 3, step: st, text: `${m}, avec l’outil ${tname}.${detail}` };
}
