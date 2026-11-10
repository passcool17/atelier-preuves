# L’atelier des preuves

Jeu web pour Camille (13 ans) : deviens le **Logic Theorist** (Newell, Shaw et Simon, 1956) et prouve 12 théorèmes des *Principia Mathematica* avec les 5 axiomes. Chaque preuve fait pousser une plante dans un jardin zen.

**Jouer :** https://passcool17.github.io/atelier-preuves/

- HTML, CSS et modules JS, sans étape de build ; PWA installable (Samsung S20 FE visé).
- Moteur logique écrit de zéro. Inspiration : [dmoews/logic-theorist](https://github.com/dmoews/logic-theorist) (aucun code repris, ce dépôt n’a pas de licence).
- Axiomes et théorèmes : *Principia Mathematica*, Whitehead et Russell (domaine public).

```sh
npm test        # tests node (moteur, 12 preuves, explications, notation, sauvegarde)
npm run serve   # http://localhost:8893
```

Publication : GitHub Pages par GitHub Actions (`.github/workflows/pages.yml`) à chaque push sur `main`, après les tests. Pour forcer une mise à jour des téléphones, change `CACHE` dans `sw.js` et `?v=` dans `index.html`.

Voir [GAME.md](GAME.md) et [docs/PLAN.md](docs/PLAN.md).
