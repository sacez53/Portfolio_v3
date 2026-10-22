import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { loadListeProjets, loadProject, saveProject } from '../config.js';
import { IMAGE_EXTENSIONS } from '../constants.js';
import { naturalSortImages, normalizeRelativePath } from '../utils.js';

/**
 * Synchronise les images d'un ou de tous les projets
 * @param {string} portfolioDir 
 * @param {object} options 
 * @returns {number} Nombre de projets mis à jour
 */
export async function syncImagesAction(portfolioDir, options = {}) {
  const { silent = false, targetSlug = null } = options;
  const liste = loadListeProjets(portfolioDir);

  if (liste.length === 0) {
    if (!silent) console.log(chalk.yellow('\nAucun projet listé dans liste_projets.json.\n'));
    return 0;
  }

  let inspectedCount = 0;
  let updatedCount = 0;
  let missingCount = 0;

  if (!silent) {
    console.log(chalk.cyan(`\n--- SYNCHRONISATION DES IMAGES ---`));
    console.log(chalk.gray(`Formats pris en charge : ${IMAGE_EXTENSIONS.join(', ')}\n`));
  }

  for (const relativePath of liste) {
    const cleanRel = normalizeRelativePath(relativePath);
    const fullJsonPath = path.join(portfolioDir, cleanRel);
    const projectDir = path.dirname(fullJsonPath);

    if (!fs.existsSync(fullJsonPath)) {
      missingCount++;
      if (!silent) console.log(chalk.red(`⚠️  Fichier introuvable : ${cleanRel}`));
      continue;
    }

    const data = loadProject(portfolioDir, cleanRel);
    if (!data) continue;

    if (targetSlug && data.slug !== targetSlug) {
      continue;
    }

    inspectedCount++;

    try {
      const files = fs.readdirSync(projectDir);
      const extRegex = new RegExp(`\\.(${IMAGE_EXTENSIONS.map(e => e.replace('.', '')).join('|')})$`, 'i');
      const imageFiles = files.filter(f => extRegex.test(f));

      // Tri naturel avec priorité aux couvertures
      imageFiles.sort(naturalSortImages);

      const category = data.categorie || 'perso';
      const slug = data.slug || path.basename(projectDir);
      const newImages = imageFiles.map(img => `projets/${category}/${slug}/${img}`);

      const currentImages = Array.isArray(data.images) ? data.images.map(normalizeRelativePath) : [];

      if (JSON.stringify(currentImages) !== JSON.stringify(newImages)) {
        data.images = newImages;
        saveProject(portfolioDir, cleanRel, data);
        updatedCount++;
        if (!silent) {
          console.log(chalk.green(`  ✔ ${data.titre || slug} : ${newImages.length} image(s) synchronisée(s)`));
        }
      } else {
        if (!silent) {
          console.log(chalk.gray(`  • ${data.titre || slug} : déjà à jour (${newImages.length} image(s))`));
        }
      }
    } catch (err) {
      if (!silent) {
        console.error(chalk.red(`Erreur lors de la synchronisation de ${cleanRel}:`), err.message);
      }
    }
  }

  if (!silent) {
    console.log(chalk.bold.green(`\n✅ Synchronisation terminée !`));
    console.log(chalk.white(`   Projets examinés : ${inspectedCount}`));
    console.log(chalk.white(`   Projets actualisés : ${updatedCount}`));
    if (missingCount > 0) {
      console.log(chalk.yellow(`   Projets manquants signalés : ${missingCount}`));
    }
    console.log('');
  }

  const result = {
    inspectedCount,
    updatedCount,
    missingCount,
    count: updatedCount,
    valueOf() { return this.updatedCount; }
  };

  return result;
}
