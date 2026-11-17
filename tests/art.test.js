import test from 'node:test';
import assert from 'node:assert/strict';
import { THEOREMS, LEVELS } from '../js/data.js';
import { ART, artUrl, EXPECTED } from '../js/art.js';
import { plantSvg, gardenSvg, bonusGardenSvg } from '../js/garden.js';

test('sans image livrée, rien n’est demandé au réseau (pas d’erreur 404)', () => {
  for (const t of THEOREMS) assert.equal(artUrl('plants', t.plante), null);
  assert.equal(artUrl('garden', 'fond'), null);
});

test('liste des fichiers attendus : une plante par théorème, une intro par niveau', () => {
  assert.deepEqual(Object.keys(EXPECTED.plants).sort(), THEOREMS.map((t) => t.plante).sort());
  assert.deepEqual(Object.keys(EXPECTED.intros).sort(), LEVELS.map((l) => `niveau-${l.n}`).sort());
  for (const f of Object.values(EXPECTED.plants)) assert.match(f, /^assets\/art\/plants\/[a-z]+\.webp$/);
});

test('une image déclarée remplace le dessin SVG, la pousse reste animée', () => {
  ART.plants.koi = 'assets/art/plants/koi.webp';
  try {
    const html = plantSvg('koi', 'grow');
    assert.match(html, /<img[^>]+src="\.\/assets\/art\/plants\/koi\.webp"/);
    assert.match(html, /class="plant grow/);
  } finally {
    delete ART.plants.koi;
  }
  assert.match(plantSvg('koi'), /<svg/);
});

test('jardin : 12 emplacements, plus 3 bonus quand le niveau 4 est ouvert', () => {
  assert.match(gardenSvg([]), /0 plantes sur 12/);
  const b = bonusGardenSvg(['*2.11']);
  assert.match(b, /1 plante sur 3/);
  for (const t of THEOREMS) assert.ok(plantSvg(t.plante).length > 60, t.plante);
});

test('chaque plante du jardin est un bouton pour rejouer', () => {
  const g = gardenSvg(['*2.07', '*2.02'], { replay: true });
  assert.equal((g.match(/data-action="replay"/g) || []).length, 2);
  assert.match(g, /role="button"[^>]*tabindex="0"|tabindex="0"[^>]*role="button"/);
});
