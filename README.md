# L’atelier des preuves

Jeu web pour Camille (13 ans) : deviens le **Logic Theorist** (Newell, Shaw et Simon, 1956) et prouve 12 théorèmes des *Principia Mathematica* avec les 5 axiomes (plus 3 en niveau bonus : la double négation). Chaque preuve fait pousser une plante dans un jardin zen. On peut rejouer chaque preuve et défier la machine en nombre d’essais. Musique zen et petits sons, réglables.

**Jouer :** https://passcool17.github.io/atelier-preuves/

- HTML, CSS et modules JS, sans étape de build ; PWA installable (Samsung S20 FE visé).
- Moteur logique écrit de zéro. Inspiration : [dmoews/logic-theorist](https://github.com/dmoews/logic-theorist) (aucun code repris, ce dépôt n’a pas de licence).
- Axiomes et théorèmes : *Principia Mathematica*, Whitehead et Russell (domaine public).

```sh
npm test        # tests node (moteur, 15 preuves, défi, explications, sauvegarde + migration, son, version/SW)
npm run serve   # http://localhost:8893
```

Publication : GitHub Pages par GitHub Actions (`.github/workflows/pages.yml`) à chaque push sur `main`, après les tests. Pour forcer une mise à jour des téléphones, change la version au même endroit dans `js/version.js`, `CACHE` de `sw.js` et les `?v=` de `index.html` (un test vérifie qu’elles sont égales). Version actuelle : `atelier-v5`.

- Illustrations (jardin, plantes en 3 stades, intros, icônes) : bot Atelier assets, originales pour ce jeu (voir GAME.md, « Illustrations »).
- Musique : MusicGen (`facebook/musicgen-small`, poids CC BY-NC 4.0), voir GAME.md, « Ressources et licences ».

Voir [GAME.md](GAME.md) et [docs/PLAN.md](docs/PLAN.md).
