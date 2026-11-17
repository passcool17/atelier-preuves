import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { THEOREMS, CORE, LEVELS } from '../js/data.js';
import { ART, artUrl, EXPECTED, plantUrl, gardenBg, STAGES, allArtFiles } from '../js/art.js';
import { plantSvg, plantGrow, gardenSvg, bonusGardenSvg, stageOf, introArt } from '../js/garden.js';
import { ICONS } from '../js/icons.js';

const root = new URL('../', import.meta.url);

test('toutes les illustrations d’Atelier assets sont branchées et présentes', () => {
  for (const t of THEOREMS) for (const s of STAGES) {
    const u = plantUrl(t.plante, s);
    assert.equal(u, `./assets/art/plants/${t.plante}-${s}.webp`);
    assert.ok(existsSync(new URL(u, root)), u);
  }
  for (const l of LEVELS) assert.ok(existsSync(new URL(artUrl('intros', `niveau-${l.n}`), root)), l.n);
  for (const f of allArtFiles()) assert.ok(existsSync(new URL(f, root)), f);
  assert.equal(allArtFiles().length, 45 + 4 + 4);
});

test('fond du jardin : 1x pour les petits écrans, @2x pour le S20 (densité 2,6)', () => {
  assert.equal(gardenBg('fond', 1), './assets/art/garden/fond-400.webp');
  assert.equal(gardenBg('fond', 2.625), './assets/art/garden/fond.webp');
  assert.equal(gardenBg('bonus', 3), './assets/art/garden/bonus.webp');
  assert.equal(gardenBg('bonus', 1), './assets/art/garden/bonus-400.webp');
});

test('stades : graine (pas prouvé), germe (en cours), floraison (prouvé)', () => {
  assert.equal(stageOf('*2.07', ['*2.07'], '*2.02'), 'bloom');
  assert.equal(stageOf('*2.02', ['*2.07'], '*2.02'), 'sprout');
  assert.equal(stageOf('*2.01', ['*2.07'], '*2.02'), 'seed');
});

test('le jardin dessine les images au bon stade, chaque plante prouvée est un bouton', () => {
  const g = gardenSvg(['*2.07'], { current: '*2.02', replay: true, dpr: 3 });
  assert.match(g, /<image href="\.\/assets\/art\/garden\/fond\.webp"/);
  assert.match(g, /galets-bloom\.webp/);
  assert.match(g, /mousse-sprout\.webp/);
  assert.match(g, /bambou-seed\.webp/);
  assert.equal((g.match(/<image href="\.\/assets\/art\/plants\//g) || []).length, 12);
  assert.equal((g.match(/data-action="replay"/g) || []).length, 1);
  assert.match(g, /0 plantes sur 12|1 plante sur 12/);
});

test('coin bonus : fond au bord de l’eau et 3 emplacements (80, 200, 320)', () => {
  const b = bonusGardenSvg(['*2.11'], { current: '*2.12', dpr: 1 });
  assert.match(b, /<image href="\.\/assets\/art\/garden\/bonus-400\.webp"/);
  assert.match(b, /1 plante sur 3/);
  assert.match(b, /tsukubai-bloom/);
  assert.match(b, /pont-sprout/);
  assert.match(b, /koi-seed/);
  for (const x of [80, 200, 320]) assert.match(b, new RegExp(`data-x="${x}"`));
});

test('pousse animée : graine, germe puis floraison empilés', () => {
  const h = plantGrow('lotus');
  for (const s of STAGES) assert.match(h, new RegExp(`lotus-${s}\\.webp`));
  assert.match(h, /class="grow3"/);
  assert.match(plantSvg('lotus'), /lotus-bloom\.webp/);
});

test('intro de niveau : image 800×400 réservée (pas de saut)', () => {
  assert.match(introArt(4), /niveau-4\.webp" alt="" width="800" height="400"/);
});

test('icônes de l’interface : SVG en ligne (couleur du texte), une par usage', () => {
  for (const k of ['sub', 'det', 'avant', 'arriere', 'indice', 'jardin', 'defi', 'son']) {
    assert.match(ICONS[k], /^<svg [^>]*aria-hidden="true"/, k);
    assert.match(ICONS[k], /currentColor/, k);
  }
});

test('sans image déclarée, on retombe sur le dessin SVG', () => {
  const saved = ART.plants.koi;
  delete ART.plants.koi;
  try {
    assert.match(plantSvg('koi'), /<svg/);
  } finally {
    ART.plants.koi = saved;
  }
});

test('liste des fichiers attendus : une plante par théorème, une intro par niveau', () => {
  assert.deepEqual(Object.keys(EXPECTED.plants).sort(), THEOREMS.map((t) => t.plante).sort());
  assert.deepEqual(Object.keys(EXPECTED.intros).sort(), LEVELS.map((l) => `niveau-${l.n}`).sort());
  assert.equal(CORE.length, 12);
});
