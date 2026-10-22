/**
 * Utilitaires pour le gestionnaire de projets
 */

/**
 * Génère un slug propre à partir d'un titre
 * @param {string} title 
 * @returns {string}
 */
export function generateSlug(title) {
  if (!title) return '';
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')   // Remplace les caractères spéciaux par des tirets
    .replace(/(^-|-$)+/g, '');     // Supprime les tirets de début et fin
}

/**
 * Tri naturel des noms de fichiers images
 * Priorise 'cover', puis effectue un tri numérique intelligent (ex: photo-2 avant photo-10)
 * @param {string} a 
 * @param {string} b 
 * @returns {number}
 */
export function naturalSortImages(a, b) {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();

  const aIsCover = aLower.includes('cover');
  const bIsCover = bLower.includes('cover');

  if (aIsCover && !bIsCover) return -1;
  if (!aIsCover && bIsCover) return 1;

  // Tri naturel numérique
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Normalise un chemin relatif avec des barres obliques web (/)
 * @param {string} p 
 * @returns {string}
 */
export function normalizeRelativePath(p) {
  if (!p) return '';
  let clean = p.replace(/\\/g, '/');
  if (clean.startsWith('./')) clean = clean.substring(2);
  if (clean.startsWith('../')) clean = clean.substring(3);
  return clean;
}
