import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { enterScreen } from '../js/nav.js';

const fakeWin = () => ({ calls: [], scrollTo(o) { this.calls.push(o); } });
const fakeEl = (name, attrs = {}) => ({
  name, attrs, focused: null,
  hasAttribute(k) { return k in this.attrs; },
  setAttribute(k, v) { this.attrs[k] = v; },
  focus(o) { this.focused = o; },
});
const fakeMain = (map) => ({ querySelector(sel) { for (const s of sel.split(',').map((x) => x.trim())) if (map[s]) return map[s]; return null; } });

test('changement d’écran : retour en haut, instantané (pas de défilement animé)', () => {
  const w = fakeWin();
  enterScreen(fakeMain({}), w);
  assert.deepEqual(w.calls, [{ top: 0, left: 0, behavior: 'instant' }]);
});

test('changement d’écran : le focus va au titre du nouvel écran, sans faire défiler', () => {
  const h2 = fakeEl('h2');
  const got = enterScreen(fakeMain({ h2 }), fakeWin());
  assert.equal(got, h2);
  assert.equal(h2.attrs.tabindex, '-1');
  assert.deepEqual(h2.focused, { preventScroll: true });
});

test('écran de preuve : le titre marqué data-heading passe avant les autres titres', () => {
  const k = fakeEl('p'), h2 = fakeEl('h2');
  assert.equal(enterScreen(fakeMain({ '[data-heading]': k, h2 }), fakeWin()), k);
  const btn = fakeEl('button', { tabindex: '0' });
  enterScreen(fakeMain({ h1: btn }), fakeWin());
  assert.equal(btn.attrs.tabindex, '0');
});

test('main.js : plus de window.scrollTo(0, 0) éparpillés ; le rendu appelle enterScreen', () => {
  const src = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  assert.ok(!src.includes('scrollTo(0, 0)'));
  assert.match(src, /enterScreen\(app\.querySelector\('main'\), window\)/);
  assert.match(src, /data-heading>À prouver/);
});

test('style.css : boutons ronds, bascule et petits boutons à 44 px minimum', () => {
  const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');
  const v5 = css.slice(css.indexOf('atelier-v5'));
  assert.match(v5, /\.iconbtn, \.helpbtn \{ width: 44px; height: 44px; \}/);
  assert.match(v5, /\.toggle \{ min-height: 44px;/);
  assert.match(v5, /\.chip \{ min-height: 44px; \}/);
  assert.match(v5, /\.lg-b \.btn\.small \{ min-height: 44px; min-width: 44px; \}/);
});
