import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { VERSION } from '../js/version.js';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const sw = read('sw.js');
const assets = [...sw.matchAll(/^\s*'(\.\/[^']*)',?$/gm)].map((m) => m[1]);

test('une seule version partout : sw.js, index.html (?v=), js/version.js', () => {
  assert.equal(VERSION, 'atelier-v3');
  assert.match(sw, new RegExp(`const CACHE = '${VERSION}';`));
  const html = read('index.html');
  const vs = [...html.matchAll(/\?v=([\w-]+)/g)].map((m) => m[1]);
  assert.ok(vs.length >= 2);
  for (const v of vs) assert.equal(v, VERSION);
  for (const a of assets.filter((x) => x.includes('?v='))) assert.ok(a.endsWith(`?v=${VERSION}`), a);
});

test('le service worker précharge tous les modules JS et les fichiers son', () => {
  for (const f of readdirSync(new URL('js/', root))) assert.ok(assets.includes(`./js/${f}`) || assets.includes(`./js/${f}?v=${VERSION}`), f);
  for (const f of readdirSync(new URL('assets/audio/', root))) assert.ok(assets.includes(`./assets/audio/${f}`), f);
});

test('chaque fichier préchargé existe', () => {
  for (const a of assets) {
    const p = a.replace(/\?.*$/, '').replace(/^\.\//, '');
    if (p === '') continue;
    assert.ok(existsSync(new URL(p, root)), a);
  }
});
