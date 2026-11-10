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

## Contrôles
- Toucher une méthode, puis un outil. Pour la substitution, toucher la valeur de chaque lettre (choix guidés), regarder « Ça donne », puis **Essayer**.
- **Indice** : 1) la méthode, 2) l’outil, 3) l’étape complète. **Recommencer** revient au but de départ.
- **Voir les Principia** (en haut) : bascule → / ou / non ↔ ⊃ / ∨ / ~ et affiche les numéros *1.x et *2.xx.

## État
- Version 1 publiée : 12 preuves, 3 niveaux, jardin final, crédits, PWA, sauvegarde (théorèmes prouvés, notation, intros vues).
- Une preuve en cours n’est pas sauvegardée (elle est courte) ; on reprend au même théorème.
- Pas de chrono.

## Prochaines idées
- Rejouer n’importe quelle preuve depuis le jardin.
- Mode « défi » : battre la machine en nombre d’essais.
- Niveau 4 facultatif : *2.11, *2.12, *2.14 (double négation).
