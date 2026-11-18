import fs from 'node:fs';
import path from 'node:path';

/** Retourne le dossier des sources web, depuis la racine du dépôt ou src/. */
export function getSiteDir(dir) {
  const nested = path.join(dir, 'src');
  return fs.existsSync(path.join(nested, 'json', 'liste_projets.json'))
    && fs.existsSync(path.join(nested, 'projets')) ? nested : dir;
}

/** Retourne le dossier des commandes npm et de la configuration locale. */
export function getRepositoryDir(dir) {
  const site = path.resolve(getSiteDir(dir));
  const parent = path.dirname(site);
  return path.basename(site) === 'src' && fs.existsSync(path.join(parent, 'package.json'))
    ? parent : site;
}

