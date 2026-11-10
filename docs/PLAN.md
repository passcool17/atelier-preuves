# Plan — L’atelier des preuves

Approuvé par Pascal (via APP, 9 nov. 2026) : contenu court (12 théorèmes), décor jardin zen, notation → et « ou » avec bouton « Voir les Principia ».

1. **Moteur** (`js/logic.js`, `js/methods.js`) écrit de zéro en JS : formules, définition « A → B = non A ou B », appariement, substitution, détachement, chaînage avant et arrière, recherche en largeur de la machine (compte les essais).
2. **Contenu** (`js/data.js`) : 5 axiomes *1, 12 théorèmes *2 en 3 niveaux de 4. Chaque théorème est vérifié par le moteur (1 à 3 étapes, outils déjà acquis seulement).
3. **Jeu** (`js/game.js`, `js/main.js`) : méthode → outil → (remplacements guidés) → Essayer ; message doux si erreur ; indice en 3 niveaux ; « Comment la machine l’a trouvée » après chaque preuve.
4. **Jardin** (`js/garden.js`) : 12 plantes en SVG, jardin complet avec pluie de pétales.
5. **PWA** : manifest, icônes, service worker versionné ; sauvegarde localStorage.
6. **Tests node** : moteur, 12 preuves, notation, sauvegarde. QA Chrome headless 412×915 sur l’URL publique.
