import test from 'node:test';
import assert from 'node:assert/strict';
import { gainFor, musicUrl, NOTES } from '../js/audio.js';

test('volume : curseur au carré, silence vrai à 0 et quand le son est coupé', () => {
  assert.equal(gainFor(0, false), 0);
  assert.equal(gainFor(1, false), 1);
  assert.equal(gainFor(0.5, false), 0.25);
  assert.equal(gainFor(1, true), 0);
});

test('musique : Opus si le navigateur le lit, sinon MP3', () => {
  assert.equal(musicUrl(() => 'probably'), './assets/audio/jardin.ogg');
  assert.equal(musicUrl(() => ''), './assets/audio/jardin.mp3');
});

test('sons : gamme pentatonique douce (aucune note aiguë agressive)', () => {
  for (const f of Object.values(NOTES)) assert.ok(f >= 200 && f <= 1400, f);
});
