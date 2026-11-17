// Son du jardin : une musique douce en boucle et de petits sons synthétisés (WebAudio, aucun fichier).
// Rien ne joue avant le premier geste (règle des navigateurs). Réglages dans la sauvegarde (save.audio).

/** Gamme pentatonique de ré (douce, jamais fausse ensemble). */
export const NOTES = { D4: 293.66, E4: 329.63, Fs4: 369.99, A4: 440, B4: 493.88, D5: 587.33, E5: 659.25, Fs5: 739.99, A5: 880 };

/** Curseur 0..1 vers gain : au carré, pour que le milieu du curseur sonne « à moitié ». */
export const gainFor = (slider, muted) => (muted ? 0 : Math.max(0, Math.min(1, slider)) ** 2);

export function musicUrl(canPlay) {
  return canPlay('audio/ogg; codecs="opus"') ? './assets/audio/jardin.ogg' : './assets/audio/jardin.mp3';
}

const MUSIC_LEVEL = 0.7; // la musique reste sous les effets

export function createAudio(getPrefs) {
  let ctx = null;
  let master;
  let music;
  let sfx;
  let src = null;
  let loading = null;
  let unlocked = false;

  function build() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.connect(ctx.destination);
    music = ctx.createGain();
    sfx = ctx.createGain();
    music.connect(master);
    sfx.connect(master);
    apply(true);
    return true;
  }

  function apply(now = false) {
    if (!ctx) return;
    const p = getPrefs();
    const t = ctx.currentTime;
    const set = (g, v) => (now ? g.gain.setValueAtTime(v, t) : g.gain.setTargetAtTime(v, t, 0.08));
    set(music, gainFor(p.music, p.muted) * MUSIC_LEVEL);
    set(sfx, gainFor(p.sfx, p.muted));
    if (!p.muted && p.music > 0) startMusic();
  }

  async function startMusic() {
    if (src || loading || !ctx) return;
    const probe = document.createElement('audio');
    loading = (async () => {
      try {
        const res = await fetch(musicUrl((type) => probe.canPlayType(type)));
        if (!res.ok) return;
        const buf = await ctx.decodeAudioData(await res.arrayBuffer());
        src = ctx.createBufferSource();
        src.buffer = buf;
        src.loop = true;
        const fade = ctx.createGain();
        fade.gain.setValueAtTime(0, ctx.currentTime);
        fade.gain.linearRampToValueAtTime(1, ctx.currentTime + 3);
        src.connect(fade).connect(music);
        src.start();
      } catch {
        src = null; // pas de musique : le jeu continue en silence
      } finally {
        loading = null;
      }
    })();
  }

  /** Premier geste : crée le contexte audio et lance la musique. */
  function unlock() {
    if (!ctx && !build()) return;
    unlocked = true;
    if (ctx.state === 'suspended') ctx.resume().catch(() => undefined);
    apply();
  }

  // Une note de cloche : sinus + harmonique, attaque douce, longue chute.
  function bell(freq, at, { dur = 1.1, vol = 0.22, type = 'sine' } = {}) {
    const t = ctx.currentTime + at;
    const o = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    const g2 = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    o2.type = 'sine';
    o2.frequency.setValueAtTime(freq * 2.01, t);
    g2.gain.value = 0.18;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    o2.connect(g2).connect(g);
    g.connect(sfx);
    o.start(t);
    o2.start(t);
    o.stop(t + dur + 0.05);
    o2.stop(t + dur + 0.05);
  }

  // Petit bruit de bois pour les touches, avec une légère variation pour éviter la répétition.
  function tock() {
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const f = 620 * 2 ** ((Math.random() - 0.5) / 12);
    o.type = 'triangle';
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * 0.6, t + 0.06);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    o.connect(g).connect(sfx);
    o.start(t);
    o.stop(t + 0.12);
  }

  function duck(seconds) {
    const p = getPrefs();
    const base = gainFor(p.music, p.muted) * MUSIC_LEVEL;
    const t = ctx.currentTime;
    music.gain.cancelScheduledValues(t);
    music.gain.setTargetAtTime(base * 0.45, t, 0.05);
    music.gain.setTargetAtTime(base, t + seconds, 0.4);
  }

  const SOUNDS = {
    tap: () => tock(),
    step: () => {
      bell(NOTES.A4, 0, { dur: 0.8, vol: 0.16 });
      bell(NOTES.D5, 0.09, { dur: 1.0, vol: 0.16 });
    },
    win: () => {
      duck(2.2);
      [NOTES.D4, NOTES.Fs4, NOTES.A4, NOTES.D5, NOTES.Fs5].forEach((f, i) => bell(f, i * 0.13, { dur: 1.6, vol: 0.18 }));
    },
    error: () => {
      bell(NOTES.E4, 0, { dur: 0.45, vol: 0.13, type: 'triangle' });
      bell(NOTES.D4 * 0.75, 0.12, { dur: 0.6, vol: 0.12, type: 'triangle' });
    },
    grow: () => [NOTES.B4, NOTES.E5, NOTES.A5].forEach((f, i) => bell(f, 0.5 + i * 0.22, { dur: 1.4, vol: 0.07 })),
  };

  function play(name) {
    if (!unlocked || !ctx || ctx.state !== 'running') return;
    const p = getPrefs();
    if (p.muted || p.sfx <= 0) return;
    SOUNDS[name] && SOUNDS[name]();
  }

  // Écran éteint ou onglet caché : on met le son en pause (batterie).
  document.addEventListener('visibilitychange', () => {
    if (!ctx || !unlocked) return;
    if (document.hidden) ctx.suspend().catch(() => undefined);
    else ctx.resume().catch(() => undefined);
  });

  return { unlock, apply, play, get running() { return !!ctx && ctx.state === 'running'; }, get musicOn() { return !!src; } };
}
