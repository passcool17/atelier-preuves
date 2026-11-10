// Explications pour Camille : tutoriel, guides de niveau, phrases en français, glossaire.
// Textes courts, un exemple de la vie de tous les jours chaque fois.
import { asImp, same, subst, vars, V, equiv } from './logic.js';

/** Tutoriel d'accueil : une carte = une idée + un exemple. */
export const TUTORIAL = [
  {
    titre: 'C’est quoi, une preuve ?',
    texte: 'Une preuve, c’est une suite de petits pas sûrs. Chaque pas part de choses vraies, alors ce qu’on obtient à la fin est vrai aussi.',
    ex: '« Les chats ont des moustaches. Minou est un chat. Donc Minou a des moustaches. » Trois petits pas, et personne ne peut dire non.',
  },
  {
    titre: 'Les lettres p, q, r, s',
    texte: 'Chaque lettre remplace une phrase qui peut être vraie ou fausse. Comme le x en maths : tu peux y mettre ce que tu veux.',
    ex: 'p = « il pleut ». Aujourd’hui, p est peut-être vrai ; demain, peut-être faux.',
  },
  {
    titre: 'La flèche → : « si… alors… »',
    texte: '« p → q » se lit « si p, alors q ». La flèche est fausse dans un seul cas : p est vrai, mais q est faux.',
    ex: 'p → q avec p = « il pleut », q = « je prends mon parapluie » : « S’il pleut, alors je prends mon parapluie. » C’est raté seulement s’il pleut et que je n’ai pas mon parapluie.',
  },
  {
    titre: '« ou » et « non »',
    texte: '« p ou q » est vrai si au moins une des deux est vraie (les deux, c’est correct aussi). « non p » est le contraire de p.',
    ex: '« Je mange une pomme ou une poire » : vrai si je mange l’une, l’autre ou les deux. Et non « il pleut », c’est « il ne pleut pas ».',
  },
  {
    titre: 'Les axiomes : les règles de départ',
    texte: 'Un axiome est une règle qu’on accepte sans preuve, comme les règles d’un jeu de société. Le jeu utilise 5 axiomes du livre Principia (1910). Tout le reste se prouve à partir d’eux.',
    ex: 'Un axiome : « Si j’ai un chat, alors c’est vrai que j’ai un chien ou un chat. » Évident, non ? C’est pour ça qu’on l’accepte.',
  },
  {
    titre: 'Logic Theorist, 1956',
    texte: 'En 1956, Newell, Shaw et Simon ont créé Logic Theorist, le premier programme à prouver des théorèmes tout seul. Il a prouvé 38 des 52 premiers théorèmes du chapitre 2 des Principia.',
    ex: 'Aujourd’hui, c’est toi la machine : tu vas prouver 12 de ces théorèmes avec les 5 axiomes. Chaque preuve fait pousser une plante.',
  },
];

/** Le secret de la flèche (définition *1.01 des Principia). */
export const FLECHE = {
  titre: 'Le secret de la flèche',
  texte: 'Dans les Principia, « A → B » veut dire exactement « non A ou B ». Les deux phrases sont fausses dans le même seul cas : A vrai et B faux.',
  ex: '« S’il pleut, je prends mon parapluie » = « Il ne pleut pas, ou je prends mon parapluie ».',
  jeu: 'Dans le jeu, un outil écrit avec « non … ou … » peut donc servir pour une flèche, et l’inverse.',
};

/** Guides de niveau : une analogie, puis un mini-exemple pas à pas. */
export const GUIDES = {
  1: {
    analogie: 'C’est comme un moule à biscuits : la forme reste la même, peu importe la pâte que tu mets dedans. Un outil vrai reste vrai si tu remplaces une lettre par une autre phrase, à condition de la remplacer partout.',
    pas: [
      { t: 'Ton but : prouver', f: 'p → (p ou p)' },
      { t: 'Le moule (l’axiome « Addition ») :', f: 'q → (p ou q)' },
      { t: 'Remplace q par p, partout :', f: 'p → (p ou p)' },
      { t: 'C’est exactement le but ! Le moule était vrai, donc le but est vrai. ✓' },
    ],
  },
  2: {
    analogie: '« Si mes devoirs sont faits → je peux jouer. Mes devoirs sont faits. Donc je peux jouer. » Pour arriver au bout d’une flèche, il suffit de prouver son début.',
    pas: [
      { t: 'Ton but :', f: 'r ou s' },
      { t: 'Un outil qui se termine comme le but (« Addition ») :', f: 'q → (p ou q)' },
      { t: 'Avec p = r et q = s, l’outil dit :', f: 's → (r ou s)' },
      { t: 'Donc il suffit de prouver le début. Ton nouveau but :', f: 's' },
    ],
    fleche: true,
  },
  3: {
    analogie: 'Comme des dominos : si A fait tomber B et que B fait tomber C, alors A fait tomber C. Pour relier a à c, cherche un domino b au milieu.',
    pas: [
      { t: 'Ton but :', f: 'pluie → bonne humeur', mots: true },
      { t: 'Chaînage avant : tu poses le premier domino (un outil).', f: 'pluie → bottes de pluie', mots: true },
      { t: 'Il reste le deuxième domino :', f: 'bottes de pluie → bonne humeur', mots: true },
      { t: 'Chaînage arrière : même idée, mais tu poses d’abord le dernier domino, et il reste à relier le début.' },
    ],
  },
};

/**
 * Pour chaque axiome et théorème : la phrase en français, les lettres de l'exemple, l'exemple.
 * `fleche` : la preuve utilise le secret de la flèche (vérifié par les tests).
 */
export const EXPLAIN = {
  '*1.2': { fr: 'Si « p ou p » est vrai, alors p est vrai. Dire deux fois la même chose ne change rien.', lettres: { p: 'il pleut' }, ex: 'S’il pleut ou qu’il pleut, alors il pleut.' },
  '*1.3': { fr: 'Si q est vrai, alors « p ou q » est vrai : un « ou » a besoin d’un seul côté vrai.', lettres: { p: 'j’ai un chien', q: 'j’ai un chat' }, ex: 'Si j’ai un chat, alors c’est vrai que j’ai un chien ou un chat.' },
  '*1.4': { fr: 'On peut échanger les deux côtés d’un « ou ».', lettres: { p: 'je mange de la pizza', q: 'je mange des sushis' }, ex: 'Si je mange de la pizza ou des sushis, alors je mange des sushis ou de la pizza.' },
  '*1.5': { fr: 'Dans « p ou (q ou r) », on peut faire passer q devant. L’ordre d’une liste de « ou » ne change rien.', lettres: { p: 'je lis', q: 'je dessine', r: 'je joue dehors' }, ex: 'Si je lis, ou bien (je dessine ou je joue dehors), alors je dessine, ou bien (je lis ou je joue dehors).' },
  '*1.6': { fr: 'Si q mène à r, alors « p ou q » mène à « p ou r » : on remplace q par r à droite du « ou ».', lettres: { p: 'il neige', q: 'il pleut', r: 'le sol est mouillé' }, ex: 'Si « il pleut → le sol est mouillé », alors « il neige ou il pleut » mène à « il neige ou le sol est mouillé ».' },
  '*2.07': { fr: 'Si p est vrai, alors « p ou p » est vrai.', lettres: { p: 'il pleut' }, ex: 'S’il pleut, alors c’est vrai qu’il pleut ou qu’il pleut.' },
  '*2.02': { fr: 'Si q est vrai, alors « si p, alors q » est vrai, peu importe p. En logique, « si… alors » ne veut pas dire « à cause de ».', lettres: { p: 'il neige', q: 'j’ai un chat' }, ex: 'Si j’ai un chat, alors « s’il neige, j’ai un chat » est vrai : neige ou pas, j’ai mon chat.', fleche: true },
  '*2.01': { fr: 'Si p entraîne son propre contraire, alors p est faux.', lettres: { p: 'j’ai raison' }, ex: 'Si « j’ai raison → je n’ai pas raison », alors je n’ai pas raison : une idée qui se contredit elle-même tombe.', fleche: true },
  '*2.03': { fr: 'Si p empêche q, alors q empêche p.', lettres: { p: 'il pleut', q: 'on fait un pique-nique' }, ex: 'Si « il pleut → pas de pique-nique », alors « on fait un pique-nique → il ne pleut pas ».', fleche: true },
  '*2.06': { fr: 'Si p mène à q, et que q mène à r, alors p mène à r.', lettres: { p: 'mes devoirs sont faits', q: 'je peux jouer', r: 'je suis de bonne humeur' }, ex: 'Si « devoirs faits → je peux jouer » et « je peux jouer → bonne humeur », alors « devoirs faits → bonne humeur ».', fleche: true },
  '*2.3': { fr: 'Dans « p ou (q ou r) », on peut échanger q et r.', lettres: { p: 'je bois du jus', q: 'je bois du lait', r: 'je bois de l’eau' }, ex: 'Si je bois du jus, ou bien (du lait ou de l’eau), alors je bois du jus, ou bien (de l’eau ou du lait).' },
  '*2.8': { fr: 'Si « q ou r » est vrai et que « non r ou s » est vrai, alors « q ou s » est vrai. Si r est faux, q est vrai ; si r est vrai, s est vrai.', lettres: { q: 'je vais au parc', r: 'je reste à la maison', s: 'je joue à un jeu' }, ex: 'Si je vais au parc ou je reste à la maison, et que (je ne reste pas à la maison ou je joue à un jeu), alors je vais au parc ou je joue à un jeu.', fleche: true },
  '*2.08': { fr: 'Si p, alors p. C’est évident… mais il faut quand même le prouver avec les 5 axiomes !', lettres: { p: 'il pleut' }, ex: 'S’il pleut, alors il pleut. Avec le secret de la flèche, c’est « il ne pleut pas, ou il pleut » : toujours vrai.', fleche: true },
  '*2.2': { fr: 'Si p est vrai, alors « p ou q » est vrai.', lettres: { p: 'il pleut', q: 'il neige' }, ex: 'S’il pleut, alors c’est vrai qu’il pleut ou qu’il neige.' },
  '*2.36': { fr: 'Si q mène à r, alors « p ou q » mène à « r ou p ».', lettres: { p: 'il neige', q: 'il pleut', r: 'le sol est mouillé' }, ex: 'Si « il pleut → le sol est mouillé », alors « il neige ou il pleut » mène à « le sol est mouillé ou il neige ».', fleche: true },
  '*2.32': { fr: 'On peut déplacer les parenthèses d’un « ou » : regrouper à droite au lieu de à gauche.', lettres: { p: 'je mange une pomme', q: 'je mange une poire', r: 'je mange une banane' }, ex: 'Si je mange (une pomme ou une poire) ou une banane, alors je mange une pomme ou (une poire ou une banane).' },
  '*2.31': { fr: 'L’inverse : on peut regrouper à gauche au lieu de à droite.', lettres: { p: 'je mange une pomme', q: 'je mange une poire', r: 'je mange une banane' }, ex: 'Si je mange une pomme ou (une poire ou une banane), alors je mange (une pomme ou une poire) ou une banane.' },
};

/** Glossaire court. */
export const GLOSSARY = [
  ['Preuve', 'Une suite de petits pas sûrs qui montre qu’une phrase est vraie.'],
  ['Axiome', 'Une règle de départ qu’on accepte sans preuve. Le jeu en utilise 5.'],
  ['Théorème', 'Une phrase qu’on a prouvée. Une fois prouvée, elle devient un outil.'],
  ['Outil', 'Un axiome, ou un théorème que tu as déjà prouvé.'],
  ['But', 'La phrase qu’il te reste à prouver.'],
  ['p, q, r, s', 'Des phrases qui peuvent être vraies ou fausses (ex. : p = « il pleut »).'],
  ['→', '« Si… alors… ». Dans les Principia : ⊃.'],
  ['ou', 'Vrai si au moins un côté est vrai. Dans les Principia : ∨.'],
  ['non', 'Le contraire. Dans les Principia : ~.'],
  ['Substitution', 'Remplacer une lettre partout dans un outil, comme changer la pâte dans un moule.'],
  ['Détachement', 'L’outil dit « A → but » : il suffit de prouver A.'],
  ['Chaînage', 'Relier a → c en passant par un milieu b, comme des dominos.'],
  ['Heuristique', 'Un « truc » pour bien deviner quoi essayer en premier, au lieu de tout essayer.'],
  ['Principia', 'Principia Mathematica, livre de Whitehead et Russell (1910).'],
];

/** Pourquoi la machine fait tant d'essais. */
export const MACHINE_WHY = [
  'La machine du jeu ne comprend pas les phrases. Elle essaie chaque méthode avec chaque outil, un par un, comme essayer toutes les clés d’un trousseau.',
  'Toi, tu as regardé la forme du but et tu as deviné quel outil allait servir. Ce « truc pour bien deviner », c’est une heuristique.',
  'Ce que ça apprend sur l’IA : essayer tout devient vite trop long quand les preuves s’allongent. Le vrai Logic Theorist de 1956 utilisait déjà des heuristiques pour choisir quoi essayer d’abord. Les IA d’aujourd’hui combinent aussi beaucoup d’essais très rapides et de bonnes façons de deviner.',
];

const listFr = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} et ${xs[xs.length - 1]}`);

/** L'étape a-t-elle eu besoin du secret de la flèche (« A → B » = « non A ou B ») ? */
export function usedDefinition(method, goal, tool, sigma) {
  if (method === 'sub') return !same(subst(tool, sigma), goal);
  const t = asImp(tool);
  if (!t) return false;
  if (tool.t !== 'i') return true;
  if (method === 'det') return !same(subst(t.b, sigma), goal);
  const g = asImp(goal);
  if (!g) return false;
  if (goal.t !== 'i') return true;
  if (method === 'avant') return !same(subst(t.a, sigma), g.a);
  return !same(subst(t.b, sigma), g.b);
}

/**
 * « Ce que tu viens de faire » : une phrase simple sur l'étape réussie.
 * fmt(f) affiche une formule ; nom = nom de l'outil ; r = résultat de playStep.
 */
export function explainStep({ method, goal, tool, nom, sigma, subgoal, done }, fmt) {
  let s;
  if (method === 'sub') {
    const changes = [...vars(tool)].sort().filter((v) => sigma[v] && !equiv(sigma[v], V(v))).map((v) => `${v} par ${fmt(sigma[v])}`);
    const what = changes.length ? `Tu as remplacé ${listFr(changes)} dans l’outil « ${nom} »` : `Tu as pris l’outil « ${nom} » tel quel`;
    s = `${what}. Il est devenu exactement ton but. L’outil était vrai, donc ton but est vrai !`;
  } else if (method === 'det') {
    s = `L’outil « ${nom} » dit « quelque chose → ton but ». Comme pour « devoirs faits → je peux jouer », il suffit de prouver le début : ${fmt(subgoal)}.`;
  } else if (method === 'avant') {
    s = `Premier domino posé avec l’outil « ${nom} ». Il reste le domino suivant : ${fmt(subgoal)}.`;
  } else {
    s = `Dernier domino posé avec l’outil « ${nom} ». Il reste à relier le début : ${fmt(subgoal)}.`;
  }
  if (usedDefinition(method, goal, tool, sigma)) s += ' 🔑 Tu as aussi utilisé le secret de la flèche : « A → B », c’est pareil que « non A ou B ».';
  return s;
}


