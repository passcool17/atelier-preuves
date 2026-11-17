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
| 4 (bonus, facultatif) | Double négation | *2.11 `p ∨ ~p`, *2.12 `p ⊃ ~~p`, *2.14 `~~p ⊃ p` |

### Niveau 4 : la double négation (bonus)
- S’ouvre quand les 12 plantes du jardin sont là (bouton « Niveau bonus » à l’accueil). Toutes les méthodes. 3 plantes dans un « coin bonus » au bord de l’eau.
- Énoncés exacts des *Principia*, vol. I (1910), p. 105-106 ([Wikisource p. 127](https://en.wikisource.org/wiki/Page:Russell,_Whitehead_-_Principia_Mathematica,_vol._I,_1910.djvu/127), [p. 128](https://en.wikisource.org/wiki/Page:Russell,_Whitehead_-_Principia_Mathematica,_vol._I,_1910.djvu/128)). Le livre écrit `~(~p)`, le jeu `~~p` (même formule).
- Preuves trouvées par le moteur du jeu, comme dans le livre : *2.11 = détachement avec *1.4 (Perm), puis *2.08 ; *2.12 = *2.11 avec p devenu « non p » ; *2.14 = détachement avec *1.4, puis *2.13.
- **\*2.13** (`p ∨ ~~~p`, p. 106) est **prêté** (badge « prêté ») : les Principia le prouvent en combinant deux résultats d’un coup (*1.6 + *2.12 + *2.11), ce que les 4 méthodes du jeu ne savent pas faire. Un test le vérifie (`tests/level4.test.js`). Il n’est pas une plante.
- Explication pour Camille : « un non = un demi-tour ; deux demi-tours = même direction ». Tiers exclu : « il pleut ou il ne pleut pas ».

### Rejouer et défi
- **Jardin** : touche une plante (dans le dessin ou la liste) → **Rejouer** sa preuve, ou **Défi**. Le jardin ne change pas ; seuls les outils d’avant ce théorème sont proposés (pas de triche).
- **Défi contre la machine** : la machine compte chaque méthode essayée avec chaque outil (recherche en largeur). Camille compte 1 essai par « Essayer » (réussi ou raté) et 1 par indice. Moins que la machine = gagné ; deux barres comparent. Meilleur score gardé par théorème (`best`).

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

## Son et mouvement (atelier-v3)
- **Musique** : boucle zen de 27 s (`assets/audio/jardin.ogg` Opus 40 kb/s, 156 Ko ; `jardin.mp3` 56 kb/s, 190 Ko pour les navigateurs sans Opus). Joue par WebAudio en boucle sans trou, fondu d’entrée 3 s, baisse sous le carillon de réussite. Téléchargée seulement après le premier geste, et seulement si la musique n’est pas coupée.
- **Effets** synthétisés (WebAudio, aucun fichier) en gamme pentatonique de ré : toucher (petit bois, légère variation), étape réussie, preuve trouvée (carillon), pousse, erreur (deux notes graves douces).
- **Réglages** : bouton haut-parleur → couper le son, volume musique, volume effets (curseur au carré). Gardés dans la sauvegarde (`audio`). Son en pause quand l’onglet est caché.
- **Mouvement** : fondu entre écrans, nouvelle ligne du chemin + but qui s’illumine, petit « non » de côté sur une erreur, plante qui pousse en 3 temps (graine, pousse, plante) puis se balance, lucioles, barres du défi. Transform/opacity seulement. `prefers-reduced-motion` : animations coupées, état final tout de suite.
- Mesuré (Chrome, 412×915, CPU ×4) : 60 images/s pendant l’animation de réussite.

## Illustrations (partie A, atelier-v4)
Livrées par le bot **Atelier assets · 2D & 3D** le 16 nov. 2026 (direction approuvée par Pascal à 20 h 31, heure de Toronto). Gouache douce, sauge #6B8F71 et crème #F6EFDC, sans texte ni personnage. Détail fichier par fichier : `/workspace/assets/atelier-preuves/MANIFEST.md` (sur la box).

| Usage | Fichiers | Poids |
|---|---|---|
| Fond du jardin (12 emplacements) | `assets/art/garden/fond.webp` (800×640, écrans ≥ 1,5x comme le S20) ou `fond-400.webp` (1x), choisi selon `devicePixelRatio` | 48,5 Ko / 13 Ko |
| Coin bonus au bord de l’eau (niveau 4) | `assets/art/garden/bonus.webp` (800×240) ou `bonus-400.webp` | 20,5 Ko / 5,4 Ko |
| 15 plantes × 3 stades | `assets/art/plants/<nom>-seed|sprout|bloom.webp` (384×384, transparent) | 384 Ko |
| Intros de niveau | `assets/art/intros/niveau-1…4.webp` (800×400) | 88 Ko |
| Icônes d’interface | `assets/art/icons/*.svg`, copiées en ligne dans `js/icons.js` (currentColor) | < 3 Ko |
| Icône d’application | `icon-192.png`, `icon-512.png`, `icon-512-maskable.png`, `icon.svg` | 252 Ko |

- **Stades** : graine = pas encore prouvé ; germe (qui respire doucement) = le prochain théorème à prouver ; floraison = prouvé. Écran de réussite : graine → germe → floraison enchaînés (CSS), puis balancement.
- **Branchement** : `js/art.js` (ART, `plantUrl`, `gardenBg`), `js/garden.js` (`spot`, `gardenSvg`, `bonusGardenSvg`, `plantGrow`, `introArt`). Si une entrée manque, retour au dessin SVG.
- **Cache** : au premier affichage, seul le nécessaire est téléchargé (fond, plantes visibles). Le service worker met ensuite en cache, en arrière-plan et un fichier à la fois, toutes les plantes, intros, fonds et la musique (`LATER` dans `sw.js`) : tout marche hors ligne après une visite.
- Pas utilisés : `garden/portrait.webp` (720×1280, autre disposition des emplacements), doublons `@2x` et `<nom>.webp` (= floraison).

## Ressources et licences
- Axiomes et théorèmes : *Principia Mathematica*, Whitehead et Russell (1910), domaine public.
- Musique `assets/audio/jardin.*` : générée le 16 nov. 2026 avec MusicGen (`facebook/musicgen-small`, Meta ; code MIT, poids CC BY-NC 4.0 : usage non commercial) sur la box, invite : « gentle japanese zen garden music, soft koto melody, warm low flute, light hand drum, steady calm tempo, relaxing, continuous, loopable, instrumental, no vocals ». Puis ffmpeg : fondu enchaîné fin → début (3 s), compression douce, normalisation à −20 LUFS, crête −3 dBFS.
- Effets sonores : synthétisés par `js/audio.js` (code du jeu).
- Illustrations, icônes et icône d’application : créées pour ce jeu par le bot Atelier assets (images générées par IA puis retouchées, originales, aucune ressource de tiers ; voir MANIFEST.md).
- Aucune dépendance npm, aucun CDN.

## État
- Version 1 publiée : 12 preuves, 3 niveaux, jardin final, crédits, PWA, sauvegarde (théorèmes prouvés, notation, intros vues, tutoriel vu).
- Version 2 (branche feat/explications) : explications pour Camille ; cache `atelier-v2`. Une ancienne sauvegarde reste valide (le tutoriel s’affiche une fois).
- Version 3 (`atelier-v3`) : son et mouvement, rejouer et défi depuis le jardin, niveau 4 bonus. Sauvegarde toujours `atelier-preuves-v1` (v: 1) : les anciennes restent valides ; `audio` et `best` sont ajoutés avec des valeurs par défaut (test de migration dans `tests/save.test.js`).
- Une preuve en cours n’est pas sauvegardée (elle est courte) ; on reprend au même théorème.
- Pas de chrono.

- Version 4 (`atelier-v4`) : illustrations d’Atelier assets branchées (jardin, 3 stades par plante, coin bonus, intros, icônes), accueil retravaillé autour du jardin.
- Version 5 (`atelier-v5`) : correctifs QA. Toutes les cibles tactiles font au moins 44 × 44 px (son, aide, « Voir les Principia », Rejouer / Défi, jetons, replis, curseurs). Chaque changement d’écran repart en haut (défilement instantané) et met le focus sur le titre du nouvel écran (`js/nav.js`).

## Prochaines idées
- Petites animations image par image des plantes (balancement, floraison) si Atelier assets les fait.
- Défi « sans indice » ou avec étoiles (1 étoile = battre la machine, 3 = preuve parfaite).
- *2.15 à *2.17 (contraposition) en niveau 5, si le moteur peut les prouver.
