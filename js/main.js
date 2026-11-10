// Interface de L'atelier des preuves.
import { LEVELS, THEOREMS, byId } from './data.js';
import { METHODS } from './methods.js';
import { show, vars, key, norm, V, subst, parse } from './logic.js';
import { TUTORIAL, GUIDES, EXPLAIN, GLOSSARY, FLECHE, MACHINE_WHY, explainStep } from './explain.js';
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
const ui = { screen: 'home', proof: null, method: null, tool: null, sigma: {}, msg: null, msgKind: '', hintText: null, last: null, resetArmed: false,
  did: null, info: null, open: {}, tuto: 0, tutoThen: null, guideStep: 0, guideThen: null, back: 'home' };

const nb = (s) => String(s).replace(/« /g, '«\u00a0').replace(/ »/g, '\u00a0»');
const esc = (s) => nb(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const F = (f) => esc(show(f, save.notation));
const P = () => save.notation === 'principia';
const persist = () => writeSave(storage, save);
const toolName = (t) => (P() ? t.id : t.nom);
const thmLabel = (t) => (P() ? `${t.id} · ${t.nom}` : t.nom);

function header() {
  return `<header class="top">
    <button class="link" data-action="home" aria-label="Accueil">🪴 L’atelier</button>
    <span class="top-r"><button class="helpbtn" data-action="help" aria-label="Comprendre : tutoriel et glossaire">?</button>
    <button class="toggle" data-action="notation" aria-pressed="${P()}">${P() ? 'Notation simple' : 'Voir les Principia'}</button></span>
  </header>`;
}

function render() {
  const fn = { home, intro, proof, success, garden, credits, tuto, help }[ui.screen] || home;
  app.innerHTML = header() + `<main class="screen screen-${ui.screen}">${fn()}</main>`;
  if (ui.screen === 'proof') {
    const fb = app.querySelector('.feedback');
    if (fb && ui.msg) fb.scrollIntoView({ block: 'nearest' });
  }
}

/** Bloc repliable ; garde son état ouvert/fermé entre deux affichages. */
function fold(k, summary, body, openDefault = true, cls = '') {
  const open = k in ui.open ? ui.open[k] : openDefault;
  return `<details class="fold ${cls}" data-k="${esc(k)}"${open ? ' open' : ''}><summary>${summary}</summary><div class="fold-b">${body}</div></details>`;
}

const exampleHtml = (id) => {
  const e = EXPLAIN[id];
  const lettres = Object.entries(e.lettres).sort().map(([v, t]) => `${v} = « ${esc(t)} »`).join(' ; ');
  return `<p>${esc(e.fr)}</p><p class="ex"><span class="exl">Exemple</span> <span class="lettres">${lettres}</span><br>${esc(e.ex)}</p>`;
};

const flecheHtml = () => `<p>${esc(FLECHE.texte)}</p><p class="ex"><span class="exl">Exemple</span> ${esc(FLECHE.ex)}</p><p class="small">${esc(FLECHE.jeu)}</p>`;

function tuto() {
  const i = ui.tuto;
  const c = TUTORIAL[i];
  const last = i === TUTORIAL.length - 1;
  const dots = TUTORIAL.map((_, j) => `<i class="${j === i ? 'on' : ''}"></i>`).join('');
  return `<section class="card tuto" data-swipe="tuto">
      <p class="kicker">Comprendre · ${i + 1} / ${TUTORIAL.length}</p>
      <h2>${esc(c.titre)}</h2>
      <p class="big-p">${esc(c.texte)}</p>
      <p class="ex"><span class="exl">Exemple</span> ${esc(c.ex)}</p>
      <div class="dots" aria-hidden="true">${dots}</div>
      <p class="small center">Balaie la carte ou touche les boutons.</p>
    </section>
    <div class="actions">
      <button class="btn" data-action="tuto-prev" ${i ? '' : 'disabled'}>‹ Avant</button>
      <button class="btn primary" data-action="tuto-next">${last ? (ui.tutoThen === 'start' ? 'C’est parti' : 'Terminé') : 'Suivant ›'}</button>
    </div>
    ${last ? '' : '<div class="actions"><button class="btn small link-btn" data-action="tuto-skip">Passer</button></div>'}`;
}

function help() {
  const reached = Math.max(1, ...THEOREMS.filter((t) => save.proven.includes(t.id)).map((t) => t.niveau), (nextTheorem(save) || { niveau: 3 }).niveau);
  const lv = LEVELS.filter((l) => l.n <= reached)
    .map((l) => `<button class="btn small" data-action="guide" data-level="${l.n}">Niveau ${l.n} : ${esc(l.titre)}</button>`)
    .join('');
  const glo = GLOSSARY.map(([t, d]) => `<div class="glo"><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join('');
  return `<section class="card help">
      <h2>Comprendre</h2>
      <div class="actions"><button class="btn primary" data-action="tuto-open">Revoir le tutoriel (6 cartes)</button></div>
      ${fold('help-lv', 'Revoir l’explication d’un niveau', `<div class="actions col">${lv}</div>`, false)}
      ${fold('help-fl', '🔑 ' + esc(FLECHE.titre), flecheHtml(), false)}
      ${fold('help-glo', 'Glossaire', `<dl class="glossary">${glo}</dl>`, true)}
    </section>
    <div class="actions"><button class="btn" data-action="help-close">${ui.back === 'proof' ? 'Retour à ma preuve' : 'Retour'}</button></div>`;
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
  const g = GUIDES[lv.n];
  const shown = g.pas.slice(0, ui.guideStep + 1);
  const all = ui.guideStep >= g.pas.length - 1;
  const steps = shown
    .map((st, j) => `<li class="pas${j === ui.guideStep ? ' new' : ''}"><span>${esc(st.t)}</span>${st.f ? `<span class="formula">${st.mots ? esc(st.f) : F(parse(st.f))}</span>` : ''}</li>`)
    .join('');
  const review = ui.guideThen === 'help';
  return `<section class="card intro">
      <p class="kicker">Niveau ${lv.n} sur 3</p>
      <h2>${esc(lv.titre)}</h2>
      <p class="analogie">${esc(g.analogie)}</p>
      <h3>Mini-exemple, pas à pas</h3>
      <ol class="pas-list">${steps}</ol>
      ${all && g.fleche ? fold('guide-fl', '🔑 Nouveau : ' + esc(FLECHE.titre), flecheHtml(), true, 'fleche') : ''}
      <div class="actions">
        ${all ? `<button class="btn primary" data-action="${review ? 'help' : 'intro-ok'}">${review ? 'Retour' : 'C’est parti'}</button>` : '<button class="btn primary" data-action="guide-next">Pas suivant ›</button>'}
      </div>
    </section>`;
}

function startNext() {
  const t = nextTheorem(save);
  if (!t) {
    ui.screen = 'garden';
    return;
  }
  if (!save.seenTuto) {
    ui.tuto = 0;
    ui.tutoThen = 'start';
    ui.screen = 'tuto';
    return;
  }
  if (!save.seenIntro.includes(t.niveau)) {
    ui.level = t.niveau;
    ui.guideStep = 0;
    ui.guideThen = 'start';
    ui.screen = 'intro';
    return;
  }
  ui.proof = newProof(t);
  clearChoice();
  ui.msg = null;
  ui.hintText = null;
  ui.did = null;
  ui.info = null;
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
      ${fold('fr', 'En français, ça veut dire…', exampleHtml(t.id), true)}
      ${EXPLAIN[t.id].fleche ? fold(`fl-${t.id}`, '🔑 Bon à savoir : ' + esc(FLECHE.titre), flecheHtml(), t.id === '*2.02', 'fleche') : ''}
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
        (x) => `<div class="toolrow"><button class="tool${ui.tool === x.id ? ' on' : ''}" data-action="tool" data-tool="${x.id}" aria-pressed="${ui.tool === x.id}">
          <span class="tname">${esc(toolName(x))}${x.axiome ? ' <span class="badge ax">axiome</span>' : ' <span class="badge">prouvé</span>'}</span><span class="f">${F(x.f)}</span></button>
          <button class="info${ui.info === x.id ? ' on' : ''}" data-action="info" data-tool="${x.id}" aria-expanded="${ui.info === x.id}" aria-label="Explication de ${esc(x.nom)}">i</button>
          ${ui.info === x.id ? `<div class="infobox">${exampleHtml(x.id)}<button class="btn small" data-action="info" data-tool="${x.id}">Fermer</button></div>` : ''}</div>`,
      )
      .join('')}</div>
    ${subst3}
    <div class="feedback ${ui.msgKind}" role="status" aria-live="polite">${ui.msg ? esc(ui.msg) : ''}${ui.did && ui.msgKind === 'good' ? `<p class="did"><b>Ce que tu viens de faire :</b> ${ui.did}</p>` : ''}${ui.hintText ? `<p class="hint">💡 ${esc(ui.hintText)}</p>` : ''}</div>
    <div class="bar">
      <button class="btn small" data-action="hint">Indice${pr.hint ? ` (${pr.hint}/3)` : ''}</button>
      <button class="btn small" data-action="reset" ${pr.steps.length ? '' : 'disabled'}>Recommencer</button>
      <button class="btn primary" data-action="try" ${ready ? '' : 'disabled'}>Essayer</button>
    </div>`;
}

function success() {
  const { thm, steps, goals, mach, did } = ui.last;
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
      <p class="did"><b>Ce que tu viens de faire :</b> ${did}</p>
      ${fold('win-fr', 'En français, tu as prouvé…', exampleHtml(thm.id), false)}
      <p class="small">« ${esc(thm.nom)} » rejoint tes outils.</p>
    </section>
    <section class="card machine">
      <h3>Comment la machine l’a trouvée</h3>
      <p>Toi : <b class="tries">${steps.length + ui.proof.errors}</b> essai${steps.length + ui.proof.errors > 1 ? 's' : ''}. La machine : <b class="tries">${mach.tries}</b> essai${mach.tries > 1 ? 's' : ''}.</p>
      ${fold('m-why', 'Pourquoi la machine fait tant d’essais ?', MACHINE_WHY.map((x) => `<p>${esc(x)}</p>`).join(''), true)}
      ${fold('m-path', 'Le chemin trouvé par la machine', `<ol class="trail">${path}</ol>`, false)}
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
    case 'help':
      if (ui.screen !== 'help' && ui.screen !== 'intro' && ui.screen !== 'tuto') ui.back = ui.screen;
      ui.screen = 'help';
      window.scrollTo(0, 0);
      break;
    case 'help-close':
      ui.screen = ui.back === 'proof' && !ui.proof ? 'home' : ui.back;
      break;
    case 'tuto-open':
      ui.tuto = 0;
      ui.tutoThen = 'help';
      ui.screen = 'tuto';
      break;
    case 'tuto-prev':
      ui.tuto = Math.max(0, ui.tuto - 1);
      break;
    case 'tuto-next':
      if (ui.tuto < TUTORIAL.length - 1) {
        ui.tuto += 1;
        break;
      }
    // falls through
    case 'tuto-skip':
      save.seenTuto = true;
      persist();
      if (ui.tutoThen === 'start') startNext();
      else ui.screen = 'help';
      window.scrollTo(0, 0);
      break;
    case 'guide':
      ui.level = Number(el.dataset.level);
      ui.guideStep = 0;
      ui.guideThen = 'help';
      ui.screen = 'intro';
      break;
    case 'guide-next':
      ui.guideStep += 1;
      break;
    case 'info':
      ui.info = ui.info === el.dataset.tool ? null : el.dataset.tool;
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
      ui.did = null;
      ui.sigma = {};
      ui.msg = null;
      break;
    case 'tool':
      ui.tool = el.dataset.tool;
      ui.did = null;
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
      ui.did = null;
      clearChoice();
      ui.msg = null;
      ui.hintText = null;
      break;
    case 'try': {
      const tool = byId(ui.tool);
      const sigma = ui.method === 'sub' ? Object.fromEntries([...vars(tool.f)].map((v) => [v, ui.sigma[v] || V(v)])) : undefined;
      const goalBefore = currentGoal(pr);
      const r = playStep(pr, ui.method, ui.tool, sigma);
      ui.hintText = null;
      ui.did = null;
      if (!r.ok) {
        ui.msg = r.msg;
        ui.msgKind = 'soft';
        break;
      }
      const did = explainStep({ method: ui.method, goal: goalBefore, tool: tool.f, nom: esc(toolName(tool)), sigma: r.sigma, subgoal: r.subgoal, done: r.done }, (f) => `« ${F(f)} »`);
      clearChoice();
      if (pr.done) {
        const thm = byId(pr.thmId);
        const before = save.proven.slice();
        const mach = machine(thm.f, thm, before);
        if (!save.proven.includes(thm.id)) save.proven = THEOREMS.map((x) => x.id).filter((id) => id === thm.id || save.proven.includes(id));
        persist();
        ui.last = { thm, steps: pr.steps, goals: pr.goals, mach, did: nb(did) };
        ui.msg = null;
        ui.screen = 'success';
        window.scrollTo(0, 0);
      } else {
        ui.msg = `Bien joué ! ${r.msg}`;
        ui.msgKind = 'good';
        ui.did = nb(did);
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

// Les blocs repliables gardent leur état (l'événement toggle ne remonte pas : capture).
app.addEventListener(
  'toggle',
  (e) => {
    const d = e.target;
    if (d.matches && d.matches('details[data-k]')) ui.open[d.dataset.k] = d.open;
  },
  true,
);

// Balayer les cartes du tutoriel.
let touchX = null;
app.addEventListener('touchstart', (e) => {
  touchX = ui.screen === 'tuto' && e.target.closest('[data-swipe]') ? e.touches[0].clientX : null;
}, { passive: true });
app.addEventListener('touchend', (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  touchX = null;
  if (Math.abs(dx) < 50) return;
  if (dx < 0 && ui.tuto < TUTORIAL.length - 1) ui.tuto += 1;
  else if (dx > 0 && ui.tuto > 0) ui.tuto -= 1;
  else return;
  render();
});

render();

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('./sw.js').catch(() => undefined);
}
