// Les méthodes du Logic Theorist, réimplémentées : on part du but et on recule.
import { I, asImp, equiv, match, subst, vars, show, pretty } from './logic.js';

export const METHODS = {
  sub: { id: 'sub', nom: 'Substitution', court: 'Remplacer des lettres d’un outil pour obtenir exactement le but.' },
  det: { id: 'det', nom: 'Détachement', court: 'Si l’outil dit « A → but », il suffit de prouver A.' },
  avant: { id: 'avant', nom: 'Chaînage avant', court: 'But « a → c » : l’outil donne « a → b », il reste « b → c ».' },
  arriere: { id: 'arriere', nom: 'Chaînage arrière', court: 'But « a → c » : l’outil donne « b → c », il reste « a → b ».' },
};

function allBound(f, sigma) {
  for (const v of vars(f)) if (!sigma[v]) return false;
  return true;
}

/**
 * Applique une méthode au but `goal` avec l'outil `tool` (formule).
 * Pour la substitution, `sigma` vient de la joueuse ; sinon l'appariement est automatique.
 * Renvoie { ok, done?, subgoal?, sigma?, msg }.
 */
export function applyMethod(method, goal, tool, sigma) {
  if (method === 'sub') {
    const s = sigma || match(tool, goal);
    if (!s) return { ok: false, msg: 'Aucun remplacement ne transforme cet outil en ton but. Essaie un autre outil.' };
    const res = subst(tool, s);
    if (equiv(res, goal)) {
      const def = show(res) !== show(goal);
      return { ok: true, done: true, result: res, sigma: s, msg: def ? 'Le but est atteint ! (« A → B » et « non A ou B », c’est pareil.)' : 'Le but est atteint !' };
    }
    return { ok: false, result: res, msg: 'Presque ! Ce remplacement donne une autre formule que le but. Réessaie.' };
  }
  const t = asImp(tool);
  if (!t) return { ok: false, msg: 'Cet outil n’a pas de flèche : il ne peut pas servir ici.' };
  if (method === 'det') {
    const s = match(t.b, goal);
    if (!s) return { ok: false, msg: 'La fin de cet outil ne ressemble pas à ton but. Cherche un outil qui se termine comme lui.' };
    if (!allBound(t.a, s)) return { ok: false, msg: 'Cet outil laisserait une lettre sans valeur. Essaie-en un autre.' };
    return { ok: true, subgoal: pretty(subst(t.a, s)), sigma: s, msg: 'Nouveau but : prouver le début de l’outil.' };
  }
  const g = asImp(goal);
  if (!g) return { ok: false, msg: 'Le chaînage demande un but avec une flèche.' };
  if (method === 'avant') {
    const s = match(t.a, g.a);
    if (!s) return { ok: false, msg: 'Le début de cet outil ne ressemble pas au début du but.' };
    if (!allBound(t.b, s)) return { ok: false, msg: 'Cet outil laisserait une lettre sans valeur. Essaie-en un autre.' };
    return { ok: true, subgoal: pretty(I(subst(t.b, s), g.b)), sigma: s, msg: 'Il reste à relier le milieu à la fin.' };
  }
  if (method === 'arriere') {
    const s = match(t.b, g.b);
    if (!s) return { ok: false, msg: 'La fin de cet outil ne ressemble pas à la fin du but.' };
    if (!allBound(t.a, s)) return { ok: false, msg: 'Cet outil laisserait une lettre sans valeur. Essaie-en un autre.' };
    return { ok: true, subgoal: pretty(I(g.a, subst(t.a, s))), sigma: s, msg: 'Il reste à relier le début au milieu.' };
  }
  return { ok: false, msg: 'Méthode inconnue.' };
}

/**
 * Recherche de la machine, en largeur : essaie chaque méthode avec chaque outil.
 * tools: [{id, f}]. Renvoie { path: [{method, toolId, goal, subgoal?}], tries } ou { path:null, tries }.
 */
export function search(goal, tools, methods = ['sub', 'det', 'avant', 'arriere'], maxSteps = 3) {
  let tries = 0;
  let frontier = [{ goal, path: [] }];
  const seen = new Set([show(goal)]);
  for (let depth = 1; depth <= maxSteps; depth += 1) {
    const next = [];
    for (const node of frontier) {
      for (const m of methods) {
        if (m !== 'sub' && depth === maxSteps) continue;
        for (const tool of tools) {
          tries += 1;
          const r = applyMethod(m, node.goal, tool.f);
          if (!r.ok) continue;
          const step = { method: m, toolId: tool.id, goal: node.goal, sigma: r.sigma };
          if (r.done) return { path: [...node.path, step], tries };
          const k = show(r.subgoal);
          if (seen.has(k)) continue;
          seen.add(k);
          next.push({ goal: r.subgoal, path: [...node.path, { ...step, subgoal: r.subgoal }] });
        }
      }
    }
    frontier = next;
  }
  return { path: null, tries };
}
