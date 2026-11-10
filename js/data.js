// Axiomes et théorèmes des Principia Mathematica (Whitehead et Russell, domaine public).
// Écrits ici directement à partir des Principia, avec la notation du jeu.
import { parse } from './logic.js';

export const AXIOMS = [
  { id: '*1.2', nom: 'Tautologie', src: '(p ou p) → p' },
  { id: '*1.3', nom: 'Addition', src: 'q → (p ou q)' },
  { id: '*1.4', nom: 'Permutation', src: '(p ou q) → (q ou p)' },
  { id: '*1.5', nom: 'Association', src: '(p ou (q ou r)) → (q ou (p ou r))' },
  { id: '*1.6', nom: 'Sommation', src: '(q → r) → ((p ou q) → (p ou r))' },
].map((a) => ({ ...a, f: parse(a.src), axiome: true }));

export const LEVELS = [
  {
    n: 1,
    titre: 'La substitution',
    methods: ['sub'],
    intro: [
      'Un outil est une formule déjà vraie. Si tu remplaces une lettre partout par une autre formule, l’outil reste vrai : c’est la substitution.',
      'Petit secret des Principia : « A → B » veut dire exactement « non A ou B ».',
    ],
  },
  {
    n: 2,
    titre: 'Le détachement',
    methods: ['sub', 'det'],
    intro: [
      'Si un outil dit « A → ton but », il suffit de prouver A. Tu choisis l’outil, la machine écrit le nouveau but.',
      'Tu termines toujours par une substitution.',
    ],
  },
  {
    n: 3,
    titre: 'Le chaînage',
    methods: ['sub', 'avant', 'arriere', 'det'],
    intro: [
      'Pour aller de a jusqu’à c, on passe par une étape b au milieu.',
      'Chaînage avant : un outil part de a. Chaînage arrière : un outil arrive à c.',
    ],
  },
];

// 12 théorèmes *2, du plus simple au plus difficile. Chacun fait pousser une plante.
export const THEOREMS = [
  { id: '*2.07', niveau: 1, nom: 'Le double', src: 'p → (p ou p)', plante: 'galets' },
  { id: '*2.02', niveau: 1, nom: 'Le vrai reste vrai', src: 'q → (p → q)', plante: 'mousse' },
  { id: '*2.01', niveau: 1, nom: 'L’absurde', src: '(p → non p) → non p', plante: 'bambou' },
  { id: '*2.03', niveau: 1, nom: 'Le miroir', src: '(p → non q) → (q → non p)', plante: 'iris' },
  { id: '*2.06', niveau: 2, nom: 'Le syllogisme', src: '(p → q) → ((q → r) → (p → r))', plante: 'fougere' },
  { id: '*2.3', niveau: 2, nom: 'L’échange', src: '(p ou (q ou r)) → (p ou (r ou q))', plante: 'lotus' },
  { id: '*2.8', niveau: 2, nom: 'Le carrefour', src: '(q ou r) → ((non r ou s) → (q ou s))', plante: 'pierre' },
  { id: '*2.08', niveau: 2, nom: 'L’identité', src: 'p → p', plante: 'lanterne' },
  { id: '*2.2', niveau: 3, nom: 'L’ajout', src: 'p → (p ou q)', plante: 'erable' },
  { id: '*2.36', niveau: 3, nom: 'Le détour', src: '(q → r) → ((p ou q) → (r ou p))', plante: 'pin' },
  { id: '*2.32', niveau: 3, nom: 'Regrouper à droite', src: '((p ou q) ou r) → (p ou (q ou r))', plante: 'cerisier' },
  { id: '*2.31', niveau: 3, nom: 'Regrouper à gauche', src: '(p ou (q ou r)) → ((p ou q) ou r)', plante: 'bonsai' },
].map((t) => ({ ...t, f: parse(t.src) }));

export const byId = (id) => AXIOMS.find((a) => a.id === id) || THEOREMS.find((t) => t.id === id);
