// Crochets pour les illustrations d’Atelier assets (partie A, à venir).
// Tant qu’une entrée vaut null, le jeu dessine sa version SVG (placeholder) : aucun fichier n’est demandé.
// Pour brancher une image : copie-la au chemin de EXPECTED, puis mets ce chemin dans ART (même clé),
// ajoute-la à ASSETS dans sw.js et change la version (js/version.js, sw.js, index.html).

/** Fichiers attendus (chemins relatifs à la racine du site). Voir GAME.md, « Illustrations ». */
export const EXPECTED = {
  garden: { fond: 'assets/art/garden/fond.webp', bonus: 'assets/art/garden/bonus.webp' },
  plants: Object.fromEntries(
    ['galets', 'mousse', 'bambou', 'iris', 'fougere', 'lotus', 'pierre', 'lanterne', 'erable', 'pin', 'cerisier', 'bonsai', 'tsukubai', 'pont', 'koi']
      .map((p) => [p, `assets/art/plants/${p}.webp`]),
  ),
  intros: Object.fromEntries([1, 2, 3, 4].map((n) => [`niveau-${n}`, `assets/art/intros/niveau-${n}.webp`])),
  icons: Object.fromEntries(['sub', 'det', 'avant', 'arriere', 'indice', 'jardin', 'defi', 'son'].map((n) => [n, `assets/art/icons/${n}.svg`])),
};

/** Images réellement livrées. Vide pour l’instant : tout est en SVG dessiné par le code. */
export const ART = { garden: {}, plants: {}, intros: {}, icons: {} };

/** URL d’une image livrée, ou null (on garde alors le dessin SVG). */
export function artUrl(kind, name) {
  const p = ART[kind] && ART[kind][name];
  return p ? `./${p}` : null;
}
