import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { input, select, checkbox, confirm } from '@inquirer/prompts';
import { loadListeProjets, loadProject, saveListeProjets, saveProject, getPaths } from '../config.js';
import { AVAILABLE_TAGS, AVAILABLE_COMPETENCES, CATEGORIES } from '../constants.js';
import { normalizeRelativePath } from '../utils.js';
import { syncImagesAction } from './sync.js';

/**
 * Action interactive de modification d'un projet existant
 * @param {string} portfolioDir 
 */
export async function modifyProjectAction(portfolioDir) {
  const liste = loadListeProjets(portfolioDir);

  if (liste.length === 0) {
    console.log(chalk.yellow('\nAucun projet dans liste_projets.json à modifier.\n'));
    return;
  }

  // Filtrage par catégorie
  const filterCat = await select({
    message: 'Filtrer par catégorie :',
    choices: [
      { name: '🌐 Tous les projets', value: 'all' },
      { name: '🎓 Étudiant (BUT MMI)', value: 'etudiant' },
      { name: '🎨 Personnel & Tirages', value: 'perso' }
    ]
  });

  const filteredPaths = filterCat === 'all'
    ? liste
    : liste.filter(p => normalizeRelativePath(p).startsWith(`projets/${filterCat}/`));

  if (filteredPaths.length === 0) {
    console.log(chalk.yellow(`\nAucun projet trouvé dans la catégorie '${filterCat}'.\n`));
    return;
  }

  // Création des choix avec titre et aperçu
  const choices = filteredPaths.map(relPath => {
    const data = loadProject(portfolioDir, relPath);
    const label = data && data.titre
      ? `${data.titre} (${relPath})`
      : relPath;
    return { name: label, value: relPath };
  });

  const selectedRelPath = await select({
    message: 'Sélectionnez le projet à modifier :',
    choices
  });

  const data = loadProject(portfolioDir, selectedRelPath);
  if (!data) {
    console.log(chalk.red(`\nImpossible de charger le projet ${selectedRelPath}\n`));
    return;
  }

  console.log(chalk.cyan(`\n╔════════════════════════════════════════════════════╗`));
  console.log(chalk.cyan(`║  MODIFICATION : ${data.titre || data.slug}`));
  console.log(chalk.cyan(`╚════════════════════════════════════════════════════╝\n`));

  const editMode = await select({
    message: 'Que souhaitez-vous modifier ?',
    choices: [
      { name: '🔄 Passer en revue toutes les rubriques dans l\'ordre', value: 'all' },
      { name: '📝 Titre, description et lien', value: 'meta' },
      { name: '🏷️  Tags et compétences', value: 'tags' },
      { name: '🧠 Analyse réflexive (Carnet de bord BUT MMI)', value: 'reflexion' },
      { name: '📐 Étapes de production du workflow', value: 'etapes' },
      { name: '🖼️  Synchroniser les images de ce projet uniquement', value: 'sync' }
    ]
  });

  if (editMode === 'sync') {
    await syncImagesAction(portfolioDir, { targetSlug: data.slug });
    return;
  }

  if (editMode === 'all' || editMode === 'meta') {
    data.titre = await input({
      message: 'Titre du projet :',
      default: data.titre || '',
      validate: (v) => v.trim().length > 0 || 'Le titre est obligatoire.'
    });

    data.description = await input({
      message: 'Description courte :',
      default: data.description || '',
      validate: (v) => v.trim().length > 0 || 'La description est obligatoire.'
    });

    const currentLien = data.lien || '';
    const newLien = await input({
      message: 'Lien externe (optionnel) :',
      default: currentLien
    });
    data.lien = newLien.trim() || null;
  }

  if (editMode === 'all' || editMode === 'tags') {
    console.log(chalk.yellow("\n💡 Cochez avec Espace, validez avec Entrée\n"));

    const currentTags = Array.isArray(data.tags) ? data.tags : [];
    const tagChoices = AVAILABLE_TAGS.map(t => ({
      ...t,
      checked: currentTags.includes(t.value)
    }));
    data.tags = await checkbox({
      message: 'Tags du projet :',
      choices: tagChoices
    });

    const currentComp = Array.isArray(data.competences) ? data.competences : [];
    const compChoices = AVAILABLE_COMPETENCES.map(c => ({
      ...c,
      checked: currentComp.includes(c.value)
    }));
    data.competences = await checkbox({
      message: 'Compétences mobilisées :',
      choices: compChoices
    });
  }

  if (editMode === 'all' || editMode === 'reflexion') {
    console.log(chalk.cyan("\n--- ANALYSE RÉFLEXIVE ---\n"));
    const currentReflexion = data.reflexion || {};

    const contexte = await input({
      message: '1. Contexte & Cadrage :',
      default: currentReflexion.contexte || ''
    });
    const difficultes = await input({
      message: '2. Défis & Contraintes rencontrées :',
      default: currentReflexion.difficultes || ''
    });
    const reussites = await input({
      message: '3. Réussites :',
      default: currentReflexion.reussites || ''
    });
    const apprentissages = await input({
      message: '4. Bilan & Apprentissages :',
      default: currentReflexion.apprentissages || ''
    });

    data.reflexion = {
      contexte: contexte.trim(),
      difficultes: difficultes.trim(),
      reussites: reussites.trim(),
      apprentissages: apprentissages.trim()
    };
  }

  if (editMode === 'all' || editMode === 'etapes') {
    console.log(chalk.cyan("\n--- ÉTAPES DE PRODUCTION ---\n"));
    const existingEtapes = Array.isArray(data.etapes) ? data.etapes : [];
    console.log(chalk.gray(`Actuellement : ${existingEtapes.length} étape(s) enregistrée(s).`));

    const stepChoice = await select({
      message: 'Gestion des étapes :',
      choices: [
        { name: 'Conserver les étapes actuelles et en ajouter d\'autres', value: 'keep_append' },
        { name: 'Remplacer complètement les étapes', value: 'replace' },
        { name: 'Ne pas toucher aux étapes', value: 'skip' }
      ]
    });

    if (stepChoice !== 'skip') {
      let etapes = stepChoice === 'keep_append' ? [...existingEtapes] : [];
      let addStep = true;

      if (stepChoice === 'keep_append') {
        addStep = await confirm({
          message: 'Ajouter une nouvelle étape maintenant ?',
          default: false
        });
      }

      while (addStep) {
        const stepNum = etapes.length + 1;
        const stepTitre = await input({
          message: `Étape ${stepNum} - Titre :`,
          validate: (v) => v.trim().length > 0 || 'Le titre est obligatoire.'
        });
        const stepDesc = await input({
          message: `Étape ${stepNum} - Description :`,
          validate: (v) => v.trim().length > 0 || 'La description est obligatoire.'
        });

        etapes.push({ titre: stepTitre.trim(), desc: stepDesc.trim() });

        addStep = await confirm({
          message: 'Ajouter une autre étape ?',
          default: false
        });
      }

      data.etapes = etapes;
    }
  }

  saveProject(portfolioDir, selectedRelPath, data);
  console.log(chalk.bold.green(`\n✅ Projet mis à jour avec succès : ${selectedRelPath}\n`));
}
