// Moteur logique de L'atelier des preuves — écrit de zéro en JS.
// Formules : {t:'v',n} variable, {t:'n',a} négation, {t:'o',a,b} « ou », {t:'i',a,b} implication.
// Par définition (Principia *1.01), « A → B » veut dire « non A ou B ».

export const V = (n) => ({ t: 'v', n });
export const N = (a) => ({ t: 'n', a });
export const O = (a, b) => ({ t: 'o', a, b });
export const I = (a, b) => ({ t: 'i', a, b });

function tokenize(src) {
  const out = [];
  const re = /\s*(->|→|⊃|\\\/|∨|ou\b|non\b|~|¬|\(|\)|[pqrs])\s*/gy;
  let m;
  let pos = 0;
  while (pos < src.length) {
    re.lastIndex = pos;
    m = re.exec(src);
    if (!m) {
      if (/^\s*$/.test(src.slice(pos))) break;
      throw new Error(`Formule illisible près de « ${src.slice(pos)} »`);
    }
    out.push(m[1]);
    pos = re.lastIndex;
  }
  return out;
}

export function parse(src) {
  const toks = tokenize(src);
  let i = 0;
  const peek = () => toks[i];
  const eat = (t) => {
    if (toks[i] !== t) throw new Error(`Attendu « ${t} » dans « ${src} »`);
    i += 1;
  };
  function imp() {
    const a = or();
    if (['->', '→', '⊃'].includes(peek())) {
      i += 1;
      return I(a, imp());
    }
    return a;
  }
  function or() {
    let a = not();
    while (['\\/', '∨', 'ou'].includes(peek())) {
      i += 1;
      a = O(a, not());
    }
    return a;
  }
  function not() {
    const t = peek();
    if (t === '~' || t === '¬' || t === 'non') {
      i += 1;
      return N(not());
    }
    if (t === '(') {
      eat('(');
      const f = imp();
      eat(')');
      return f;
    }
    if (/^[pqrs]$/.test(t || '')) {
      i += 1;
      return V(t);
    }
    throw new Error(`Formule incomplète : « ${src} »`);
  }
  const f = imp();
  if (i !== toks.length) throw new Error(`Surplus dans « ${src} »`);
  return f;
}

export const NOTATIONS = {
  simple: { imp: '→', or: 'ou', not: 'non ' },
  principia: { imp: '⊃', or: '∨', not: '~' },
};

export function show(f, mode = 'simple', top = true) {
  const s = NOTATIONS[mode] || NOTATIONS.simple;
  switch (f.t) {
    case 'v':
      return f.n;
    case 'n':
      return s.not + show(f.a, mode, false);
    case 'o':
    case 'i': {
      const op = f.t === 'o' ? s.or : s.imp;
      const body = `${show(f.a, mode, false)} ${op} ${show(f.b, mode, false)}`;
      return top ? body : `(${body})`;
    }
    default:
      throw new Error('formule inconnue');
  }
}

/** Forme normale : toute implication A → B devient non A ou B. */
export function norm(f) {
  switch (f.t) {
    case 'v':
      return f;
    case 'n':
      return N(norm(f.a));
    case 'o':
      return O(norm(f.a), norm(f.b));
    case 'i':
      return O(N(norm(f.a)), norm(f.b));
    default:
      throw new Error('formule inconnue');
  }
}

export function key(f) {
  switch (f.t) {
    case 'v':
      return f.n;
    case 'n':
      return `~${key(f.a)}`;
    case 'o':
      return `(${key(f.a)}|${key(f.b)})`;
    case 'i':
      return `(${key(f.a)}>${key(f.b)})`;
    default:
      throw new Error('formule inconnue');
  }
}

/** Même formule, en comptant « A → B » = « non A ou B ». */
export const equiv = (a, b) => key(norm(a)) === key(norm(b));
/** Identique au caractère près (sans la définition). */
export const same = (a, b) => key(a) === key(b);

export function vars(f, acc = new Set()) {
  if (f.t === 'v') acc.add(f.n);
  else {
    vars(f.a, acc);
    if (f.b) vars(f.b, acc);
  }
  return acc;
}

export function subst(f, sigma) {
  switch (f.t) {
    case 'v':
      return sigma[f.n] ? sigma[f.n] : f;
    case 'n':
      return N(subst(f.a, sigma));
    default:
      return { t: f.t, a: subst(f.a, sigma), b: subst(f.b, sigma) };
  }
}

/** Vue « implication » d'une formule : A → B, ou non A ou B. Sinon null. */
export function asImp(f) {
  if (f.t === 'i') return f;
  if (f.t === 'o' && f.a.t === 'n') return I(f.a.a, f.b);
  return null;
}

/**
 * Appariement : trouve les remplacements des lettres du modèle `pat`
 * qui le rendent égal à `tgt` (définition de → comprise). Renvoie null sinon.
 */
export function match(pat, tgt, sigma = {}) {
  if (pat.t === 'v') {
    const prev = sigma[pat.n];
    if (prev) return equiv(prev, tgt) ? sigma : null;
    return { ...sigma, [pat.n]: tgt };
  }
  if (pat.t === tgt.t) {
    if (pat.t === 'n') return match(pat.a, tgt.a, sigma);
    const s1 = match(pat.a, tgt.a, sigma);
    return s1 && match(pat.b, tgt.b, s1);
  }
  if (pat.t === 'i' && tgt.t === 'o') return match(O(N(pat.a), pat.b), tgt, sigma);
  if (pat.t === 'o' && tgt.t === 'i') return match(pat, O(N(tgt.a), tgt.b), sigma);
  return null;
}

/** Toutes les sous-formules (pour proposer des remplacements). */
export function subformulas(f, acc = []) {
  acc.push(f);
  if (f.t !== 'v') {
    subformulas(f.a, acc);
    if (f.b) subformulas(f.b, acc);
  }
  return acc;
}

/** Lecture plus douce d'un but calculé : « non A ou B » s'affiche « A → B » (même formule). */
export function pretty(f) {
  switch (f.t) {
    case 'v':
      return f;
    case 'n':
      return N(pretty(f.a));
    case 'o':
      return f.a.t === 'n' ? I(pretty(f.a.a), pretty(f.b)) : O(pretty(f.a), pretty(f.b));
    default:
      return I(pretty(f.a), pretty(f.b));
  }
}
