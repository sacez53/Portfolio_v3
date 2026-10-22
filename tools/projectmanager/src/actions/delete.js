import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { select, confirm } from '@inquirer/prompts';
import { loadListeProjets, loadProject, saveListeProjets } from '../config.js';
import { normalizeRelativePath } from '../utils.js';

/**
 * Action interactive de suppression ou désindexation d'un projet
 * @param {string} portfolioDir 
 */
export async function deleteProjectAction(portfolioDir) {
  const liste = loadListeProjets(portfolioDir);

  if (liste.length === 0) {
    console.log(chalk.yellow('\nAucun projet dans liste_projets.json à supprimer.\n'));
    return;
  }

  const choices = liste.map(relPath => {
    const data = loadProject(portfolioDir, relPath);
    const label = data && data.titre
      ? `${data.titre} [${data.categorie}] (${relPath})`
      : relPath;
    return { name: label, value: relPath };
  });

  choices.push({ name: '← Annuler et revenir en arrière', value: '__cancel__' });

  const selectedRelPath = await select({
    message: 'Quel projet souhaitez-vous supprimer ?',
    choices
  });

  if (selectedRelPath === '__cancel__') {
    return;
  }

  const cleanRel = normalizeRelativePath(selectedRelPath);
  const data = loadProject(portfolioDir, cleanRel);
  const projectTitle = data && data.titre ? data.titre : cleanRel;

  console.log(chalk.red(`\n⚠️  Vous êtes sur le point de supprimer le projet : ${chalk.bold(projectTitle)}`));

  const deleteMode = await select({
    message: 'Mode de suppression :',
    choices: [
      { name: '1. Retirer uniquement de liste_projets.json (conserver les fichiers sur le disque)', value: 'unindex' },
      { name: '2. Supprimer DÉFINITIVEMENT le dossier du projet et toutes ses images', value: 'purge' },
      { name: '← Annuler', value: 'cancel' }
    ]
  });

  if (deleteMode === 'cancel') {
    console.log(chalk.gray('Opération annulée.'));
    return;
  }

  const proceed = await confirm({
    message: `Êtes-vous absolument sûr de vouloir continuer ?`,
    default: false
  });

  if (!proceed) {
    console.log(chalk.gray('Opération annulée par sécurité.'));
    return;
  }

  // 1. Mise à jour de liste_projets.json
  const updatedListe = liste.filter(p => normalizeRelativePath(p) !== cleanRel);
  saveListeProjets(portfolioDir, updatedListe);
  console.log(chalk.green(`\n✔ Projet retiré de liste_projets.json.`));

  // 2. Suppression physique si demandée
  if (deleteMode === 'purge') {
    const fullJsonPath = path.join(portfolioDir, cleanRel);
    const projectDir = path.dirname(fullJsonPath);

    try {
      if (fs.existsSync(projectDir)) {
        fs.rmSync(projectDir, { recursive: true, force: true });
        console.log(chalk.green(`✔ Dossier supprimé avec succès : ${projectDir}`));
      }
    } catch (err) {
      console.error(chalk.red(`Erreur lors de la suppression physique du dossier :`), err.message);
    }
  }

  console.log('');
}
