// Illustrations d’Atelier assets (partie A, livrées le 16 nov. 2026 ; voir GAME.md, « Illustrations »).
// Si une entrée de ART manque, le jeu retombe sur son dessin SVG : aucun fichier n’est demandé.
// Pour changer une image : remplace le fichier au même chemin et change la version (js/version.js, sw.js, index.html).

const PLANTS = ['galets', 'mousse', 'bambou', 'iris', 'fougere', 'lotus', 'pierre', 'lanterne', 'erable', 'pin', 'cerisier', 'bonsai', 'tsukubai', 'pont', 'koi'];

/** Stades d’une plante : graine (pas prouvé), germe (preuve en cours), floraison (prouvé). */
export const STAGES = ['seed', 'sprout', 'bloom'];

/** Fichiers attendus (chemins relatifs à la racine du site). */
export const EXPECTED = {
  garden: { fond: 'assets/art/garden/fond.webp', bonus: 'assets/art/garden/bonus.webp' },
  garden1x: { fond: 'assets/art/garden/fond-400.webp', bonus: 'assets/art/garden/bonus-400.webp' },
  plants: Object.fromEntries(PLANTS.map((p) => [p, `assets/art/plants/${p}`])),
  intros: Object.fromEntries([1, 2, 3, 4].map((n) => [`niveau-${n}`, `assets/art/intros/niveau-${n}.webp`])),
};

/** Images livrées : tout est branché. */
export const ART = {
  garden: { ...EXPECTED.garden },
  garden1x: { ...EXPECTED.garden1x },
  plants: { ...EXPECTED.plants },
  intros: { ...EXPECTED.intros },
};

/** URL d’une image livrée, ou null (on garde alors le dessin SVG). */
export function artUrl(kind, name) {
  const p = ART[kind] && ART[kind][name];
  return p ? `./${p}` : null;
}

/** Une plante à un stade donné (par défaut : floraison). */
export function plantUrl(name, stage = 'bloom') {
  const p = ART.plants[name];
  return p ? `./${p}-${stage}.webp` : null;
}

/** Fond du jardin : 400 px pour un écran 1x, 800 px (@2x) au-delà (S20 : densité 2,6). */
export function gardenBg(kind, dpr = 2) {
  const tab = dpr < 1.5 ? ART.garden1x : ART.garden;
  return tab[kind] ? `./${tab[kind]}` : artUrl('garden', kind);
}

/** Tous les fichiers d’illustration (le service worker les met en cache en arrière-plan). */
export function allArtFiles() {
  return [
    ...Object.values(EXPECTED.garden), ...Object.values(EXPECTED.garden1x),
    ...PLANTS.flatMap((p) => STAGES.map((s) => `${EXPECTED.plants[p]}-${s}.webp`)),
    ...Object.values(EXPECTED.intros),
  ].map((p) => `./${p}`);
}
