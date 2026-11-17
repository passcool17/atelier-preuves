// Interface de L'atelier des preuves.
import { LEVELS, THEOREMS, CORE, byId } from './data.js';
import { METHODS } from './methods.js';
import { show, vars, key, norm, V, subst, parse } from './logic.js';
import { TUTORIAL, GUIDES, EXPLAIN, GLOSSARY, FLECHE, MACHINE_WHY, explainStep } from './explain.js';
import { newProof, playStep, resetProof, currentGoal, substOptions, toolsFor, machine, hint, levelOf, challengeScore, compareTries } from './game.js';
import { loadSave, writeSave, nextTheorem, nextBonus, bonusUnlocked, recordBest, setAudio } from './save.js';
import { plantSvg, plantGrow, gardenSvg, bonusGardenSvg, introArt } from './garden.js';
import { enterScreen } from './nav.js';
import { ICONS } from './icons.js';
import { createAudio } from './audio.js';
import { VERSION } from './version.js';

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
  did: null, info: null, open: {}, tuto: 0, tutoThen: null, guideStep: 0, guideThen: null, back: 'home',
  mode: 'normal', pending: null, machTries: 0, soundOpen: false, fx: null, flow: 'core' };
const audio = createAudio(() => save.audio);
const MODE_LABEL = { replay: 'Rejouer', defi: 'Défi' };

const nb = (s) => String(s).replace(/« /g, '«\u00a0').replace(/ »/g, '\u00a0»');
const esc = (s) => nb(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const F = (f) => esc(show(f, save.notation));
const P = () => save.notation === 'principia';
const persist = () => writeSave(storage, save);
const toolName = (t) => (P() ? t.id : t.nom);
const thmLabel = (t) => (P() ? `${t.id} · ${t.nom}` : t.nom);
const coreCount = () => CORE.filter((t) => save.proven.includes(t.id)).length;

const ICON_SON = ICONS.son;
const ICON_MUET = ICONS.sonOff;

function soundPanel() {
  const a = save.audio;
  const pct = (x) => Math.round(x * 100);
  return `<div class="sound-panel" id="sound-panel" role="group" aria-label="Réglages du son">
      <button class="btn small mute" data-action="mute" aria-pressed="${a.muted}">${a.muted ? 'Remettre le son' : 'Couper le son'}</button>
      <label class="slider"><span>Musique <output>${pct(a.music)} %</output></span><input type="range" min="0" max="100" step="5" value="${pct(a.music)}" data-vol="music" ${a.muted ? 'disabled' : ''}></label>
      <label class="slider"><span>Effets <output>${pct(a.sfx)} %</output></span><input type="range" min="0" max="100" step="5" value="${pct(a.sfx)}" data-vol="sfx" ${a.muted ? 'disabled' : ''}></label>
      <p class="small">Musique : boucle zen générée pour le jeu. Ton choix est gardé.</p>
    </div>`;
}

function header() {
  const a = save.audio;
  const off = a.muted || (a.music === 0 && a.sfx === 0);
  return `<header class="top">
    <button class="link brand" data-action="home" aria-label="Accueil">${ICONS.jardin}<span>L’atelier</span></button>
    <span class="top-r"><button class="iconbtn${off ? ' off' : ''}" data-action="sound" aria-expanded="${ui.soundOpen}" aria-controls="sound-panel" aria-label="Son : ${off ? 'coupé' : 'activé'}. Réglages">${off ? ICON_MUET : ICON_SON}</button>
    <button class="helpbtn" data-action="help" aria-label="Comprendre : tutoriel et glossaire">?</button>
    <button class="toggle" data-action="notation" aria-pressed="${P()}">${P() ? 'Notation simple' : 'Voir les Principia'}</button></span>
    ${ui.soundOpen ? soundPanel() : ''}
  </header>`;
}

let shown = null;
let shownSteps = 0;
function render() {
  const fn = { home, intro, proof, success, garden, credits, tuto, help }[ui.screen] || home;
  const enter = shown !== ui.screen;
  const steps = ui.screen === 'proof' && ui.proof ? ui.proof.steps.length : 0;
  const stepUp = !enter && steps > shownSteps;
  app.innerHTML = header() + `<main class="screen screen-${ui.screen}${enter ? ' enter' : ''}${stepUp ? ' step-up' : ''}">${fn()}</main>`;
  const first = shown === null;
  shown = ui.screen;
  shownSteps = steps;
  if (enter && !first && !ui.focus) enterScreen(app.querySelector('main'), window);
  else if (enter) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  if (ui.focus) {
    const f = app.querySelector(ui.focus);
    if (f) f.focus({ preventScroll: true });
    ui.focus = null;
  }
  if (ui.fx) {
    const fb = app.querySelector('.feedback');
    if (fb) fb.classList.add(`fx-${ui.fx}`);
    ui.fx = null;
  }
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
  const lv = LEVELS.filter((l) => l.n <= reached || (l.bonus && bonusUnlocked(save)))
    .map((l) => `<button class="btn small" data-action="guide" data-level="${l.n}">${l.bonus ? 'Bonus' : `Niveau ${l.n}`} : ${esc(l.titre)}</button>`)
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
  const n = coreCount();
  const next = nextTheorem(save);
  const bonus = bonusUnlocked(save);
  const nb4 = nextBonus(save);
  return `<section class="hero">
      <div class="garden-wrap hero-art">${gardenSvg(save.proven, { current: next ? next.id : null })}</div>
      <h1>L’atelier des preuves</h1>
      <p class="lead">En 1956, une machine, le Logic Theorist, a prouvé des théorèmes toute seule. Aujourd’hui, la machine, c’est toi.</p>
      <p class="count"><span class="count-n">${n} / 12</span> plantes dans ton jardin${next ? ` · prochaine : « ${esc(next.nom)} »` : ''}</p>
    </section>
    <div class="actions">
      ${next ? `<button class="btn primary" data-action="start">${n ? 'Continuer' : 'Commencer'}</button>` : `<button class="btn primary" data-action="garden">Voir mon jardin</button>`}
      ${n && next ? '<button class="btn" data-action="garden">Mon jardin</button>' : ''}
      <button class="btn" data-action="credits">Crédits</button>
    </div>
    ${n ? '<p class="small center">Dans ton jardin, touche une plante pour rejouer sa preuve ou lancer un défi contre la machine.</p>' : ''}
    ${bonus ? `<section class="card bonus-card">
        <p class="kicker">Niveau bonus (facultatif)</p>
        <h2>La double négation</h2>
        <p>Trois théorèmes de plus des Principia : *2.11, *2.12 et *2.14. « Non non p », est-ce que c’est p ?</p>
        <div class="garden-wrap bonus-wrap">${bonusGardenSvg(save.proven, { current: nb4 ? nb4.id : null })}</div>
        <div class="actions">${nb4 ? `<button class="btn primary" data-action="bonus">${save.proven.some((id) => byId(id).niveau === 4) ? 'Continuer le bonus' : 'Essayer le bonus'}</button>` : '<p class="small">Bonus terminé : 3 / 3. Bravo !</p>'}</div>
      </section>` : ''}`;
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
      <div class="intro-art-wrap">${introArt(lv.n)}</div>
      <p class="kicker">${lv.bonus ? 'Niveau bonus' : `Niveau ${lv.n} sur 3`}</p>
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
  const t = nextTheorem(save) || (ui.flow === 'bonus' ? nextBonus(save) : null);
  if (!t) {
    ui.screen = 'garden';
    return;
  }
  startProof(t, 'normal');
}

/** Ouvre une preuve. mode : 'normal' (fait pousser une plante), 'replay' (rejouer) ou 'defi' (contre la machine). */
function startProof(t, mode) {
  ui.pending = { id: t.id, mode };
  if (!save.seenTuto) {
    ui.tuto = 0;
    ui.tutoThen = 'start';
    ui.screen = 'tuto';
    return;
  }
  if (mode === 'normal' && !save.seenIntro.includes(t.niveau)) {
    ui.level = t.niveau;
    ui.guideStep = 0;
    ui.guideThen = 'start';
    ui.screen = 'intro';
    return;
  }
  ui.pending = null;
  ui.mode = mode;
  ui.proof = newProof(t);
  ui.machTries = mode === 'defi' ? machine(t.f, t, save.proven).tries : 0;
  clearChoice();
  ui.msg = null;
  ui.hintText = null;
  ui.did = null;
  ui.info = null;
  ui.screen = 'proof';
}

function resumePending() {
  if (ui.pending) startProof(byId(ui.pending.id), ui.pending.mode);
  else startNext();
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
  const inLevel = THEOREMS.filter((x) => x.niveau === t.niveau);
  const idx = inLevel.indexOf(t) + 1;
  const goal = currentGoal(pr);
  const tools = toolsFor(save.proven, t);
  const mine = challengeScore(pr);
  const defi = ui.mode === 'defi'
    ? `<section class="card defi" aria-live="polite">
        <p class="kicker">Défi contre la machine</p>
        <div class="score"><span><b>${mine}</b> essai${mine > 1 ? 's' : ''} pour toi</span><span class="vs">contre</span><span><b>${ui.machTries}</b> pour la machine</span></div>
        ${fold('defi-how', 'Comment on compte ?', '<p>Chaque fois que tu touches <b>Essayer</b>, ça fait 1 essai (réussi ou raté). Un <b>indice</b> compte aussi pour 1. La machine, elle, compte chaque méthode essayée avec chaque outil. Fais moins d’essais qu’elle pour gagner !</p>', false)}
      </section>`
    : ui.mode === 'replay' ? '<p class="mode-tag">Tu rejoues une preuve déjà trouvée : ton jardin ne change pas.</p>' : '';
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
  return `<div class="progress"><span>${MODE_LABEL[ui.mode] ? `${MODE_LABEL[ui.mode]} · ` : ''}${lv.bonus ? 'Bonus' : `Niveau ${t.niveau}`} · ${esc(lv.titre)}</span><span>${idx} / ${inLevel.length}</span></div>
    ${defi}
    <section class="card goal">
      <p class="kicker" data-heading>À prouver — ${esc(thmLabel(t))}</p>
      <p class="formula big">${F(t.f)}</p>
      ${fold('fr', 'En français, ça veut dire…', exampleHtml(t.id), true)}
      ${EXPLAIN[t.id].fleche ? fold(`fl-${t.id}`, '🔑 Bon à savoir : ' + esc(FLECHE.titre), flecheHtml(), t.id === '*2.02', 'fleche') : ''}
      ${pr.steps.length ? `<ol class="trail">${trail}</ol><p class="kicker now">But actuel</p><p class="formula now-goal">${F(goal)}</p>` : ''}
    </section>
    <h3>1. Choisis une méthode</h3>
    <div class="methods">${methods
      .map((m) => `<button class="mbtn${ui.method === m ? ' on' : ''}" data-action="method" data-method="${m}" aria-pressed="${ui.method === m}">${ICONS[m]}<span>${esc(METHODS[m].nom)}</span></button>`)
      .join('')}</div>
    ${ui.method ? `<p class="mdesc">${esc(METHODS[ui.method].court)}</p>` : ''}
    <h3>2. Choisis un outil</h3>
    <div class="tools">${tools
      .map(
        (x) => `<div class="toolrow"><button class="tool${ui.tool === x.id ? ' on' : ''}" data-action="tool" data-tool="${x.id}" aria-pressed="${ui.tool === x.id}">
          <span class="tname">${esc(toolName(x))}${x.axiome ? ' <span class="badge ax">axiome</span>' : x.pret ? ' <span class="badge pret">prêté</span>' : ' <span class="badge">prouvé</span>'}</span><span class="f">${F(x.f)}</span></button>
          <button class="info${ui.info === x.id ? ' on' : ''}" data-action="info" data-tool="${x.id}" aria-expanded="${ui.info === x.id}" aria-label="Explication de ${esc(x.nom)}">i</button>
          ${ui.info === x.id ? `<div class="infobox">${exampleHtml(x.id)}<button class="btn small" data-action="info" data-tool="${x.id}">Fermer</button></div>` : ''}</div>`,
      )
      .join('')}</div>
    ${subst3}
    <div class="feedback ${ui.msgKind}" role="status" aria-live="polite">${ui.msg ? esc(ui.msg) : ''}${ui.did && ui.msgKind === 'good' ? `<p class="did"><b>Ce que tu viens de faire :</b> ${ui.did}</p>` : ''}${ui.hintText ? `<p class="hint">💡 ${esc(ui.hintText)}</p>` : ''}</div>
    <div class="bar">
      <button class="btn small ibtn" data-action="hint">${ICONS.indice}Indice${pr.hint ? ` (${pr.hint}/3)` : ''}${ui.mode === 'defi' ? ' +1' : ''}</button>
      <button class="btn small" data-action="reset" ${pr.steps.length ? '' : 'disabled'}>Recommencer</button>
      <button class="btn primary" data-action="try" ${ready ? '' : 'disabled'}>Essayer</button>
    </div>`;
}

function versus(me, mach) {
  const max = Math.max(me, mach, 1);
  const w = (x) => Math.max(4, Math.round((x / max) * 100));
  return `<div class="versus" aria-hidden="true">
      <div class="vrow"><span>Toi</span><i class="bar-me" style="--w:${w(me)}%"></i><b>${me}</b></div>
      <div class="vrow"><span>Machine</span><i class="bar-mach" style="--w:${w(mach)}%"></i><b>${mach}</b></div>
    </div>`;
}

function success() {
  const { thm, steps, goals, mach, did, mode, score, cmp, isBest } = ui.last;
  const mine = steps
    .map((s, i) => `<li>${esc(METHODS[s.method].nom)} avec ${esc(toolName(byId(s.toolId)))}${goals[i + 1] ? ` → ${F(goals[i + 1])}` : ''}</li>`)
    .join('');
  const path = mach.path
    .map((s) => `<li>${esc(METHODS[s.method].nom)} avec ${esc(toolName(byId(s.toolId)))}${s.subgoal ? ` → ${F(s.subgoal)}` : ' ✓'}</li>`)
    .join('');
  const last = !nextTheorem(save) && !(ui.flow === 'bonus' && nextBonus(save));
  const verdict = cmp.result === 'win' ? `Tu as battu la machine de ${cmp.diff} essai${cmp.diff > 1 ? 's' : ''} !`
    : cmp.result === 'tie' ? 'Égalité : aussi efficace que la machine !'
    : `La machine gagne cette fois, de ${cmp.diff} essai${cmp.diff > 1 ? 's' : ''}. Regarde bien la forme du but avant de choisir, puis réessaie !`;
  const best = save.best[thm.id];
  const again = mode === 'normal' ? '' : `<div class="actions"><button class="btn primary" data-action="${mode === 'defi' ? 'defi' : 'replay'}" data-id="${thm.id}">${mode === 'defi' ? 'Refaire le défi' : 'Rejouer encore'}</button><button class="btn" data-action="garden">Retour au jardin</button></div>`;
  if (mode === 'defi') {
    return `<section class="card win defi-win ${cmp.result}">
      <div class="plant-big"><div class="sway">${plantGrow(thm.plante)}</div><div class="motes" aria-hidden="true"><i></i><i></i><i></i><i></i></div></div>
      <p class="kicker">Défi · ${esc(thmLabel(thm))}</p>
      <h2 role="status">${esc(verdict)}</h2>
      ${versus(score, mach.tries)}
      <p>Toi : <b class="tries">${score}</b> essai${score > 1 ? 's' : ''}. La machine : <b class="tries">${mach.tries}</b> essai${mach.tries > 1 ? 's' : ''}.</p>
      <p class="small">${isBest ? 'Nouveau record pour ce théorème !' : `Ton record : ${best} essai${best > 1 ? 's' : ''}.`}</p>
      ${fold('m-why', 'Pourquoi la machine fait tant d’essais ?', MACHINE_WHY.map((x) => `<p>${esc(x)}</p>`).join(''), false)}
    </section>${again}`;
  }
  return `<section class="card win">
      <div class="plant-big"><div class="sway">${plantGrow(thm.plante)}</div><div class="motes" aria-hidden="true"><i></i><i></i><i></i><i></i></div></div>
      <h2>${mode === 'replay' ? 'Preuve rejouée !' : 'Preuve trouvée !'}</h2>
      <p class="formula">${F(thm.f)}</p>
      <p>Ton chemin (${steps.length} étape${steps.length > 1 ? 's' : ''}) :</p><ol class="trail">${mine}</ol>
      <p class="did"><b>Ce que tu viens de faire :</b> ${did}</p>
      ${fold('win-fr', 'En français, tu as prouvé…', exampleHtml(thm.id), false)}
      ${mode === 'normal' ? `<p class="small">« ${esc(thm.nom)} » rejoint tes outils.</p>` : ''}
    </section>
    <section class="card machine">
      <h3>Comment la machine l’a trouvée</h3>
      ${versus(score, mach.tries)}
      <p>Toi : <b class="tries">${score}</b> essai${score > 1 ? 's' : ''}. La machine : <b class="tries">${mach.tries}</b> essai${mach.tries > 1 ? 's' : ''}.</p>
      ${fold('m-why', 'Pourquoi la machine fait tant d’essais ?', MACHINE_WHY.map((x) => `<p>${esc(x)}</p>`).join(''), true)}
      ${fold('m-path', 'Le chemin trouvé par la machine', `<ol class="trail">${path}</ol>`, false)}
    </section>
    ${mode === 'normal' ? `<div class="actions"><button class="btn primary" data-action="next">${last ? 'Voir mon jardin' : 'Continuer'}</button></div>` : again}`;
}

function garden() {
  const done = coreCount() === 12;
  const bonus = bonusUnlocked(save);
  const row = (t) => {
    const b = save.best[t.id];
    return `<li>${plantSvg(t.plante)}<span class="lg-t">${esc(thmLabel(t))}<br><span class="f">${F(t.f)}</span>${b ? `<br><span class="small">Record en défi : ${b} essai${b > 1 ? 's' : ''}</span>` : ''}</span>
      <span class="lg-b"><button class="btn small" data-action="replay" data-id="${t.id}" aria-label="Rejouer « ${esc(t.nom)} »">Rejouer</button><button class="btn small defi-btn ibtn" data-action="defi" data-id="${t.id}" aria-label="Défi sur « ${esc(t.nom)} »">${ICONS.defi}Défi</button></span></li>`;
  };
  return `<section class="final ${done ? 'complete' : ''}">
      ${done ? '<div class="petals" aria-hidden="true">' + Array.from({ length: 14 }, (_, i) => `<i style="--i:${i}"></i>`).join('') + '</div>' : ''}
      <h2>${done ? 'Ton jardin est complet' : 'Ton jardin'}</h2>
      <div class="garden-wrap">${gardenSvg(save.proven, { replay: true, current: nextTheorem(save) ? nextTheorem(save).id : null })}</div>
      ${bonus ? `<div class="garden-wrap bonus-wrap">${bonusGardenSvg(save.proven, { replay: true, current: nextBonus(save) ? nextBonus(save).id : null })}</div>` : ''}
      ${done ? '<p class="lead">Douze théorèmes des Principia, prouvés par toi, comme la machine de 1956. Respire, admire, bravo Camille.</p>' : `<p class="count">${coreCount()} / 12 plantes</p>`}
      ${save.proven.length ? '<p class="small center">Touche une plante (ou « Rejouer ») pour refaire sa preuve. « Défi » : fais moins d’essais que la machine.</p>' : ''}
      <ul class="legend">${THEOREMS.filter((t) => save.proven.includes(t.id)).map(row).join('')}</ul>
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
      <p><b>Musique</b> : boucle zen générée pour ce jeu avec MusicGen (modèle facebook/musicgen-small de Meta, poids sous licence CC BY-NC 4.0 : usage non commercial). Petits sons synthétisés en direct dans le navigateur.</p>
      <p><b>Illustrations</b> : jardin, 15 plantes en 3 stades, intros de niveau, icônes et icône d’application créés pour ce jeu par le bot Atelier assets (images générées par IA, originales, aucune ressource de tiers).</p>
      <p>Jeu fait pour Camille. Version ${esc(VERSION)}.</p>
      <button class="btn" data-action="home">Retour</button>
    </section>`;
}

function onAction(el) {
  const a = el.dataset.action;
  const pr = ui.proof;
  if (a !== 'reset-all') ui.resetArmed = false;
  if (a !== 'sound' && a !== 'mute') ui.soundOpen = false;
  switch (a) {
    case 'home':
      ui.screen = 'home';
      break;
    case 'notation':
      save.notation = P() ? 'simple' : 'principia';
      persist();
      break;
    case 'start':
      ui.flow = 'core';
      startNext();
      break;
    case 'bonus':
      ui.flow = 'bonus';
      startNext();
      break;
    case 'replay':
    case 'defi': {
      const t = byId(el.dataset.id);
      if (!t || !save.proven.includes(t.id)) return;
      startProof(t, a);
      break;
    }
    case 'sound':
      ui.soundOpen = !ui.soundOpen;
      ui.focus = ui.soundOpen ? '.sound-panel .mute' : '[data-action="sound"]';
      break;
    case 'mute':
      save = setAudio(save, { muted: !save.audio.muted });
      persist();
      audio.unlock();
      audio.apply();
      ui.focus = '.sound-panel .mute';
      break;
    case 'help':
      if (ui.screen !== 'help' && ui.screen !== 'intro' && ui.screen !== 'tuto') ui.back = ui.screen;
      ui.screen = 'help';
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
      if (ui.tutoThen === 'start') resumePending();
      else ui.screen = 'help';
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
      resumePending();
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
        ui.fx = 'err';
        audio.play('error');
        break;
      }
      const did = explainStep({ method: ui.method, goal: goalBefore, tool: tool.f, nom: esc(toolName(tool)), sigma: r.sigma, subgoal: r.subgoal, done: r.done }, (f) => `« ${F(f)} »`);
      clearChoice();
      if (pr.done) {
        const thm = byId(pr.thmId);
        const mach = machine(thm.f, thm, save.proven);
        const score = ui.mode === 'defi' ? challengeScore(pr) : pr.tries;
        let isBest = false;
        if (ui.mode === 'normal' && !save.proven.includes(thm.id)) save.proven = THEOREMS.map((x) => x.id).filter((id) => id === thm.id || save.proven.includes(id));
        if (ui.mode === 'defi') ({ isBest, save } = recordBest(save, thm.id, score));
        persist();
        audio.play('win');
        audio.play('grow');
        ui.last = { thm, steps: pr.steps, goals: pr.goals, mach, did: nb(did), mode: ui.mode, score, cmp: compareTries(score, mach.tries), isBest };
        ui.msg = null;
        ui.screen = 'success';
        } else {
        ui.msg = `Bien joué ! ${r.msg}`;
        ui.fx = 'ok';
        audio.play('step');
        ui.msgKind = 'good';
        ui.did = nb(did);
      }
      break;
    }
    case 'next':
      startNext();
      break;
    case 'reset-all':
      if (!ui.resetArmed) {
        ui.resetArmed = true;
        break;
      }
      save = { ...save, proven: [], seenIntro: [], best: {} };
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
  if (!el || el.disabled) return;
  if (el.dataset.action !== 'try') audio.play('tap');
  onAction(el);
});

// Plantes du jardin (éléments SVG role="button") : Entrée ou Espace.
app.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && ui.soundOpen) {
    ui.soundOpen = false;
    render();
    app.querySelector('[data-action="sound"]').focus();
    return;
  }
  const el = e.target.closest && e.target.closest('[role="button"][data-action]');
  if (!el || (e.key !== 'Enter' && e.key !== ' ')) return;
  e.preventDefault();
  audio.play('tap');
  onAction(el);
});

// Curseurs de volume : effet immédiat, sans redessiner (le doigt garde le curseur).
app.addEventListener('input', (e) => {
  const k = e.target.dataset && e.target.dataset.vol;
  if (!k) return;
  save = setAudio(save, { [k]: Number(e.target.value) / 100 });
  const out = e.target.parentElement.querySelector('output');
  if (out) out.textContent = `${e.target.value} %`;
  audio.unlock();
  audio.apply();
});
app.addEventListener('change', (e) => {
  const k = e.target.dataset && e.target.dataset.vol;
  if (!k) return;
  persist();
  if (k === 'sfx') audio.play('step');
});

// Le son démarre au premier geste (règle des navigateurs).
const firstGesture = () => audio.unlock();
window.addEventListener('pointerdown', firstGesture, { once: true, capture: true });
window.addEventListener('keydown', firstGesture, { once: true, capture: true });

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
