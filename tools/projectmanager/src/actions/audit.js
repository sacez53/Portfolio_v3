import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { confirm, select } from '@inquirer/prompts';
import { getPaths, loadListeProjets, loadProject, saveListeProjets } from '../config.js';
import { normalizeRelativePath } from '../utils.js';
import { syncImagesAction } from './sync.js';

/**
 * Action d'audit et diagnostic de santé du portfolio
 * @param {string} portfolioDir 
 * @param {object} options 
 */
export async function auditAction(portfolioDir, options = {}) {
  const { silent = false, interactive = true } = options;
  const paths = getPaths(portfolioDir);
  const liste = loadListeProjets(portfolioDir);

  if (!silent) {
    console.log(chalk.cyan("\n╔════════════════════════════════════════════════════╗"));
    console.log(chalk.cyan("║        AUDIT & CONFORMITÉ DU PORTFOLIO             ║"));
    console.log(chalk.cyan("╚════════════════════════════════════════════════════╝\n"));
  }

  const report = {
    totalInList: liste.length,
    validProjects: 0,
    missingJsonFiles: [],
    invalidJsonFiles: [],
    zeroImageProjects: [],
    missingImageFiles: [],
    orphanFolders: []
  };

  // 1. Audit des projets enregistrés dans liste_projets.json
  for (const relPath of liste) {
    const cleanRel = normalizeRelativePath(relPath);
    const fullPath = path.join(portfolioDir, cleanRel);

    if (!fs.existsSync(fullPath)) {
      report.missingJsonFiles.push(cleanRel);
      continue;
    }

    const data = loadProject(portfolioDir, cleanRel);
    if (!data) {
      report.invalidJsonFiles.push(cleanRel);
      continue;
    }

    report.validProjects++;

    // Vérifier les images
    const images = Array.isArray(data.images) ? data.images : [];
    if (images.length === 0) {
      report.zeroImageProjects.push({ title: data.titre || data.slug, path: cleanRel });
    } else {
      for (const imgRel of images) {
        const cleanImgRel = normalizeRelativePath(imgRel);
        const fullImgPath = path.join(portfolioDir, cleanImgRel);
        if (!fs.existsSync(fullImgPath)) {
          report.missingImageFiles.push({ project: data.titre || data.slug, image: cleanImgRel });
        }
      }
    }
  }

  // 2. Recherche des dossiers orphelins sur le disque (présents dans projets/ mais non indexés)
  const categories = ['etudiant', 'perso'];
  for (const cat of categories) {
    const catDir = path.join(paths.projetsDir, cat);
    if (!fs.existsSync(catDir)) continue;

    try {
      const items = fs.readdirSync(catDir, { withFileTypes: true });
      for (const item of items) {
        if (!item.isDirectory()) continue;
        const slug = item.name;
        const expectedRel = `projets/${cat}/${slug}/projet.json`;

        if (!liste.includes(expectedRel)) {
          report.orphanFolders.push(expectedRel);
        }
      }
    } catch (err) {
      console.error(chalk.red(`Erreur de lecture du dossier ${catDir}:`), err.message);
    }
  }

  // Affichage du bilan
  if (!silent) {
    console.log(chalk.bold('📊 RÉSULTAT DU CONTRÔLE :'));
    console.log(`  • Projets répertoriés dans liste_projets.json : ${chalk.cyan(report.totalInList)}`);
    console.log(`  • Projets valides et opérationnels         : ${chalk.green(report.validProjects)}`);

    if (report.missingJsonFiles.length > 0) {
      console.log(`  • ${chalk.red('❌ Fichiers JSON introuvables sur le disque')} :`);
      report.missingJsonFiles.forEach(f => console.log(chalk.red(`     - ${f}`)));
    }

    if (report.orphanFolders.length > 0) {
      console.log(`  • ${chalk.yellow('⚠️  Dossiers orphelins non enregistrés dans la liste')} :`);
      report.orphanFolders.forEach(f => console.log(chalk.yellow(`     - ${f}`)));
    }

    if (report.zeroImageProjects.length > 0) {
      console.log(`  • ${chalk.yellow('⚠️  Projets sans aucune image associée')} :`);
      report.zeroImageProjects.forEach(p => console.log(chalk.yellow(`     - ${p.title} (${p.path})`)));
    }

    if (report.missingImageFiles.length > 0) {
      console.log(`  • ${chalk.red('❌ Références d\'images introuvables')} :`);
      report.missingImageFiles.forEach(m => console.log(chalk.red(`     - [${m.project}] ${m.image}`)));
    }

    if (
      report.missingJsonFiles.length === 0 &&
      report.orphanFolders.length === 0 &&
      report.zeroImageProjects.length === 0 &&
      report.missingImageFiles.length === 0
    ) {
      if (!silent) console.log(chalk.bold.green('\n✨ Excellent ! Tous les projets et visuels sont parfaitement synchronisés.\n'));
      return report;
    }

    if (!interactive) {
      return report;
    }

    // Propositions de corrections interactives
    console.log('');
    const action = await select({
      message: 'Souhaitez-vous effectuer des réparations automatiques ?',
      choices: [
        { name: 'Ne rien modifier et revenir au menu principal', value: 'none' },
        { name: '➕ Ajouter automatiquement les dossiers orphelins à liste_projets.json', value: 'fix_orphans' },
        { name: '🧹 Nettoyer les projets manquants de liste_projets.json', value: 'clean_missing' },
        { name: '🔄 Lancer la synchronisation complète des images', value: 'sync_images' }
      ]
    });

    if (action === 'fix_orphans' && report.orphanFolders.length > 0) {
      const updatedListe = [...liste, ...report.orphanFolders];
      saveListeProjets(portfolioDir, updatedListe);
      console.log(chalk.green(`\n✔ ${report.orphanFolders.length} dossier(s) orphelin(s) indexé(s) avec succès !`));
      await syncImagesAction(portfolioDir, { silent: false });
    } else if (action === 'clean_missing' && report.missingJsonFiles.length > 0) {
      const updatedListe = liste.filter(p => !report.missingJsonFiles.includes(p));
      saveListeProjets(portfolioDir, updatedListe);
      console.log(chalk.green(`\n✔ ${report.missingJsonFiles.length} entrée(s) obsolète(s) supprimée(s) de liste_projets.json.`));
    } else if (action === 'sync_images') {
      await syncImagesAction(portfolioDir, { silent: false });
    }
  }

  return report;
}
