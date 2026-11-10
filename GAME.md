# GAME.md — L’atelier des preuves

## Concept
Camille joue la machine de 1956. Pour chaque théorème, elle part du but et recule : à chaque étape elle choisit **une méthode** et **un outil** (axiome ou théorème déjà prouvé). La dernière étape est toujours une substitution qui rend l’outil identique au but. Le moteur vérifie tout ; une erreur reçoit un message doux.

Après chaque preuve, « Comment la machine l’a trouvée » : le moteur cherche seul (en largeur, méthode × outil), affiche son nombre d’essais et son chemin. Le théorème rejoint les outils et une plante pousse.

## Niveaux (un concept chacun)
| Niveau | Concept | Théorèmes |
|---|---|---|
| 1 | Substitution | *2.07, *2.02, *2.01, *2.03 (1 étape) |
| 2 | Détachement | *2.06, *2.3, *2.8 (2 étapes), *2.08 (3 étapes) |
| 3 | Chaînage avant / arrière | *2.2, *2.36 (2 étapes), *2.32, *2.31 (3 étapes) |

## Explications (pour une ado de 13 ans)
- **Tutoriel « Comprendre »** : 6 cartes à balayer (preuve, lettres, →, « ou »/« non », axiomes, Logic Theorist 1956), chacune avec un exemple de tous les jours. Montré une fois, puis revu avec le bouton **?**.
- **Intro de niveau** : une analogie (moule à biscuits, devoirs → jouer, dominos) et un mini-exemple pas à pas. Le niveau 2 présente le **secret de la flèche** : « A → B » = « non A ou B ».
- **« En français, ça veut dire… »** sur la carte du but (12 théorèmes) et bouton **i** sur chaque outil (5 axiomes + théorèmes), avec un exemple concret ; tout se replie.
- **« Ce que tu viens de faire »** après chaque étape réussie (signale aussi le secret de la flèche quand il a servi).
- **Glossaire** et explications des niveaux dans l’écran **?**.
- **Machine** : « Pourquoi tant d’essais ? » (elle essaie tout, toi tu devines : une heuristique) et ce que ça apprend sur l’IA.
- Textes dans `js/explain.js`, testés dans `tests/explain.test.js`.

## Contrôles
- Toucher une méthode, puis un outil. Pour la substitution, toucher la valeur de chaque lettre (choix guidés), regarder « Ça donne », puis **Essayer**.
- **Indice** : 1) la méthode, 2) l’outil, 3) l’étape complète. **Recommencer** revient au but de départ.
- **Voir les Principia** (en haut) : bascule → / ou / non ↔ ⊃ / ∨ / ~ et affiche les numéros *1.x et *2.xx.

## État
- Version 1 publiée : 12 preuves, 3 niveaux, jardin final, crédits, PWA, sauvegarde (théorèmes prouvés, notation, intros vues, tutoriel vu).
- Version 2 (branche feat/explications) : explications pour Camille ; cache `atelier-v2`. Une ancienne sauvegarde reste valide (le tutoriel s’affiche une fois).
- Une preuve en cours n’est pas sauvegardée (elle est courte) ; on reprend au même théorème.
- Pas de chrono.

## Prochaines idées
- Rejouer n’importe quelle preuve depuis le jardin.
- Mode « défi » : battre la machine en nombre d’essais.
- Niveau 4 facultatif : *2.11, *2.12, *2.14 (double négation).
