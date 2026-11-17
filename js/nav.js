/**
 * Changement d'écran : on repart en haut de la page et on place le focus
 * sur le titre du nouvel écran (pour le clavier et les lecteurs d'écran).
 * Défilement instantané, jamais animé (respecte aussi « réduire les animations »).
 */
export const HEADING = '[data-heading], h1, h2';

export function enterScreen(main, win) {
  win.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  const h = main && main.querySelector(HEADING);
  if (!h) return null;
  if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1');
  h.focus({ preventScroll: true });
  return h;
}
