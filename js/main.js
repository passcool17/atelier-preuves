// Interface de L'atelier des preuves.
import { LEVELS, THEOREMS, byId } from './data.js';
import { METHODS } from './methods.js';
import { show, vars, key, norm, V, subst } from './logic.js';
import { newProof, playStep, resetProof, currentGoal, substOptions, toolsFor, machine, hint, levelOf } from './game.js';
import { loadSave, writeSave, nextTheorem } from './save.js';
import { plantSvg, gardenSvg } from './garden.js';

const app = document.getElementById('app');
const storage = (() => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
})();
let save = loadSave(storage);
const ui = { screen: 'home', proof: null, method: null, tool: null, sigma: {}, msg: null, msgKind: '', hintText: null, last: null, resetArmed: false };

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const F = (f) => esc(show(f, save.notation));
const P = () => save.notation === 'principia';
const persist = () => writeSave(storage, save);
const toolName = (t) => (P() ? t.id : t.nom);
const thmLabel = (t) => (P() ? `${t.id} · ${t.nom}` : t.nom);

function header() {
  return `<header class="top">
    <button class="link" data-action="home" aria-label="Accueil">🪴 L’atelier des preuves</button>
    <button class="toggle" data-action="notation" aria-pressed="${P()}">${P() ? 'Notation simple' : 'Voir les Principia'}</button>
  </header>`;
}

function render() {
  const fn = { home, intro, proof, success, garden, credits }[ui.screen] || home;
  app.innerHTML = header() + `<main class="screen screen-${ui.screen}">${fn()}</main>`;
  if (ui.screen === 'proof') {
    const fb = app.querySelector('.feedback');
    if (fb && ui.msg) fb.scrollIntoView({ block: 'nearest' });
  }
}

function home() {
  const n = save.proven.length;
  const next = nextTheorem(save);
  return `<section class="hero">
      <h1>L’atelier des preuves</h1>
      <p class="lead">En 1956, une machine, le Logic Theorist, a prouvé des théorèmes toute seule. Aujourd’hui, la machine, c’est toi.</p>
    </section>
    <div class="garden-wrap">${gardenSvg(save.proven)}</div>
    <p class="count">${n} / 12 plantes dans ton jardin</p>
    <div class="actions">
      ${next ? `<button class="btn primary" data-action="start">${n ? 'Continuer' : 'Commencer'}</button>` : `<button class="btn primary" data-action="garden">Voir mon jardin</button>`}
      <button class="btn" data-action="credits">Crédits</button>
    </div>`;
}

function intro() {
  const lv = LEVELS[ui.level - 1];
  return `<section class="card intro">
      <p class="kicker">Niveau ${lv.n} sur 3</p>
      <h2>${esc(lv.titre)}</h2>
      ${lv.intro.map((p) => `<p>${esc(p)}</p>`).join('')}
      <button class="btn primary" data-action="intro-ok">C’est parti</button>
    </section>`;
}

function startNext() {
  const t = nextTheorem(save);
  if (!t) {
    ui.screen = 'garden';
    return;
  }
  if (!save.seenIntro.includes(t.niveau)) {
    ui.level = t.niveau;
    ui.screen = 'intro';
    return;
  }
  ui.proof = newProof(t);
  clearChoice();
  ui.msg = null;
  ui.hintText = null;
  ui.screen = 'proof';
}

function clearChoice() {
  ui.method = null;
  ui.tool = null;
  ui.sigma = {};
}

function proof() {
  const pr = ui.proof;
  const t = byId(pr.thmId);
  const lv = levelOf(t);
  const idx = THEOREMS.filter((x) => x.niveau === t.niveau).indexOf(t) + 1;
  const goal = currentGoal(pr);
  const tools = toolsFor(save.proven);
  const trail = pr.steps
    .map((s, i) => `<li><span class="m">${esc(METHODS[s.method].nom)}</span> avec ${esc(toolName(byId(s.toolId)))}<br><span class="f">→ nouveau but : ${F(pr.goals[i + 1])}</span></li>`)
    .join('');
  const methods = ['sub', 'det', 'avant', 'arriere'].filter((m) => lv.methods.includes(m));
  let subst3 = '';
  if (ui.method === 'sub' && ui.tool) {
    const tool = byId(ui.tool);
    const opts = substOptions(goal);
    const rows = [...vars(tool.f)].sort().map((v) => {
      const cur = ui.sigma[v] || V(v);
      const chips = opts
        .map((o) => {
          const k = key(norm(o));
          const on = key(norm(cur)) === k;
          return `<button class="chip${on ? ' on' : ''}" data-action="val" data-var="${v}" data-val="${esc(k)}" aria-pressed="${on}">${F(o)}</button>`;
        })
        .join('');
      return `<div class="var-row"><p class="var-label"><b>${v}</b> devient :</p><div class="chips">${chips}</div></div>`;
    });
    const preview = subst(tool.f, Object.fromEntries([...vars(tool.f)].map((v) => [v, ui.sigma[v] || V(v)])));
    subst3 = `<h3>3. Remplace les lettres</h3>${rows.join('')}<p class="preview">Ça donne : <span class="f">${F(preview)}</span></p>`;
  }
  const ready = ui.method && ui.tool;
  return `<div class="progress"><span>Niveau ${t.niveau} · ${esc(lv.titre)}</span><span>${idx} / 4</span></div>
    <section class="card goal">
      <p class="kicker">À prouver — ${esc(thmLabel(t))}</p>
      <p class="formula big">${F(t.f)}</p>
      ${pr.steps.length ? `<ol class="trail">${trail}</ol><p class="kicker now">But actuel</p><p class="formula">${F(goal)}</p>` : ''}
    </section>
    <h3>1. Choisis une méthode</h3>
    <div class="methods">${methods
      .map((m) => `<button class="mbtn${ui.method === m ? ' on' : ''}" data-action="method" data-method="${m}" aria-pressed="${ui.method === m}">${esc(METHODS[m].nom)}</button>`)
      .join('')}</div>
    ${ui.method ? `<p class="mdesc">${esc(METHODS[ui.method].court)}</p>` : ''}
    <h3>2. Choisis un outil</h3>
    <div class="tools">${tools
      .map(
        (x) => `<button class="tool${ui.tool === x.id ? ' on' : ''}" data-action="tool" data-tool="${x.id}" aria-pressed="${ui.tool === x.id}">
          <span class="tname">${esc(toolName(x))}${x.axiome ? '' : ' <span class="badge">prouvé</span>'}</span><span class="f">${F(x.f)}</span></button>`,
      )
      .join('')}</div>
    ${subst3}
    <div class="feedback ${ui.msgKind}" role="status" aria-live="polite">${ui.msg ? esc(ui.msg) : ''}${ui.hintText ? `<p class="hint">💡 ${esc(ui.hintText)}</p>` : ''}</div>
    <div class="bar">
      <button class="btn small" data-action="hint">Indice${pr.hint ? ` (${pr.hint}/3)` : ''}</button>
      <button class="btn small" data-action="reset" ${pr.steps.length ? '' : 'disabled'}>Recommencer</button>
      <button class="btn primary" data-action="try" ${ready ? '' : 'disabled'}>Essayer</button>
    </div>`;
}

function success() {
  const { thm, steps, goals, mach } = ui.last;
  const mine = steps
    .map((s, i) => `<li>${esc(METHODS[s.method].nom)} avec ${esc(toolName(byId(s.toolId)))}${goals[i + 1] ? ` → ${F(goals[i + 1])}` : ''}</li>`)
    .join('');
  const path = mach.path
    .map((s) => `<li>${esc(METHODS[s.method].nom)} avec ${esc(toolName(byId(s.toolId)))}${s.subgoal ? ` → ${F(s.subgoal)}` : ' ✓'}</li>`)
    .join('');
  const last = !nextTheorem(save);
  return `<section class="card win">
      <div class="plant-big">${plantSvg(thm.plante, 'grow')}</div>
      <h2>Preuve trouvée !</h2>
      <p class="formula">${F(thm.f)}</p>
      <p>Ton chemin (${steps.length} étape${steps.length > 1 ? 's' : ''}) :</p><ol class="trail">${mine}</ol>
      <p class="small">${esc(thm.nom)} rejoint tes outils.</p>
    </section>
    <section class="card machine">
      <h3>Comment la machine l’a trouvée</h3>
      <p>La machine essaie chaque méthode avec chaque outil, dans l’ordre. Elle a fait <b class="tries">${mach.tries}</b> essai${mach.tries > 1 ? 's' : ''} avant de trouver ce chemin :</p>
      <ol class="trail">${path}</ol>
      <p class="small">Toi, tu as choisi tes étapes en réfléchissant. C’est ce que Newell, Shaw et Simon appelaient une heuristique.</p>
    </section>
    <div class="actions"><button class="btn primary" data-action="next">${last ? 'Voir mon jardin' : 'Continuer'}</button></div>`;
}

function garden() {
  const done = save.proven.length === 12;
  return `<section class="final ${done ? 'complete' : ''}">
      ${done ? '<div class="petals" aria-hidden="true">' + Array.from({ length: 14 }, (_, i) => `<i style="--i:${i}"></i>`).join('') + '</div>' : ''}
      <h2>${done ? 'Ton jardin est complet' : 'Ton jardin'}</h2>
      <div class="garden-wrap">${gardenSvg(save.proven)}</div>
      ${done ? '<p class="lead">Douze théorèmes des Principia, prouvés par toi, comme la machine de 1956. Respire, admire, bravo Camille.</p>' : `<p class="count">${save.proven.length} / 12 plantes</p>`}
      <ul class="legend">${THEOREMS.filter((t) => save.proven.includes(t.id))
        .map((t) => `<li>${plantSvg(t.plante)}<span>${esc(thmLabel(t))}<br><span class="f">${F(t.f)}</span></span></li>`)
        .join('')}</ul>
      <div class="actions">
        <button class="btn" data-action="home">Accueil</button>
        ${done ? `<button class="btn small" data-action="reset-all">${ui.resetArmed ? 'Sûre ? Touche encore pour tout recommencer' : 'Recommencer le jardin'}</button>` : ''}
      </div>
    </section>`;
}

function credits() {
  return `<section class="card credits">
      <h2>Crédits</h2>
      <p><b>Logic Theorist</b> (1956) : Allen Newell, J. C. Shaw et Herbert A. Simon. La première machine à prouver des théorèmes, sur l’ordinateur JOHNNIAC.</p>
      <p><b>Principia Mathematica</b> : Alfred North Whitehead et Bertrand Russell (1910). Les axiomes *1 et les théorèmes *2 viennent de ce livre (domaine public).</p>
      <p><b>Inspiration</b> : le dépôt <a href="https://github.com/dmoews/logic-theorist" rel="noopener" target="_blank">dmoews/logic-theorist</a> sur GitHub, qui fait revivre le programme de 1956. Aucun code n’en a été repris : le moteur du jeu a été écrit de zéro en JavaScript.</p>
      <p>Jeu fait pour Camille. Jardin dessiné en SVG.</p>
      <button class="btn" data-action="home">Retour</button>
    </section>`;
}

function onAction(el) {
  const a = el.dataset.action;
  const pr = ui.proof;
  if (a !== 'reset-all') ui.resetArmed = false;
  switch (a) {
    case 'home':
      ui.screen = 'home';
      break;
    case 'notation':
      save.notation = P() ? 'simple' : 'principia';
      persist();
      break;
    case 'start':
      startNext();
      break;
    case 'intro-ok':
      if (!save.seenIntro.includes(ui.level)) save.seenIntro.push(ui.level);
      persist();
      startNext();
      break;
    case 'credits':
      ui.screen = 'credits';
      break;
    case 'garden':
      ui.screen = 'garden';
      break;
    case 'method':
      ui.method = el.dataset.method;
      ui.sigma = {};
      ui.msg = null;
      break;
    case 'tool':
      ui.tool = el.dataset.tool;
      ui.sigma = {};
      ui.msg = null;
      break;
    case 'val': {
      const goal = currentGoal(pr);
      const opt = substOptions(goal).find((o) => key(norm(o)) === el.dataset.val);
      if (opt) ui.sigma[el.dataset.var] = opt;
      break;
    }
    case 'hint': {
      const h = hint(pr, byId(pr.thmId), save.proven, save.notation);
      ui.hintText = h.text;
      break;
    }
    case 'reset':
      resetProof(pr);
      clearChoice();
      ui.msg = null;
      ui.hintText = null;
      break;
    case 'try': {
      const tool = byId(ui.tool);
      const sigma = ui.method === 'sub' ? Object.fromEntries([...vars(tool.f)].map((v) => [v, ui.sigma[v] || V(v)])) : undefined;
      const r = playStep(pr, ui.method, ui.tool, sigma);
      ui.hintText = null;
      if (!r.ok) {
        ui.msg = r.msg;
        ui.msgKind = 'soft';
        break;
      }
      clearChoice();
      if (pr.done) {
        const thm = byId(pr.thmId);
        const before = save.proven.slice();
        const mach = machine(thm.f, thm, before);
        if (!save.proven.includes(thm.id)) save.proven = THEOREMS.map((x) => x.id).filter((id) => id === thm.id || save.proven.includes(id));
        persist();
        ui.last = { thm, steps: pr.steps, goals: pr.goals, mach };
        ui.msg = null;
        ui.screen = 'success';
        window.scrollTo(0, 0);
      } else {
        ui.msg = `Bien joué ! ${r.msg}`;
        ui.msgKind = 'good';
      }
      break;
    }
    case 'next':
      startNext();
      window.scrollTo(0, 0);
      break;
    case 'reset-all':
      if (!ui.resetArmed) {
        ui.resetArmed = true;
        break;
      }
      save = { ...save, proven: [], seenIntro: [] };
      persist();
      ui.resetArmed = false;
      ui.screen = 'home';
      break;
    default:
      return;
  }
  render();
}

app.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (el && !el.disabled) onAction(el);
});

render();

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('./sw.js').catch(() => undefined);
}
