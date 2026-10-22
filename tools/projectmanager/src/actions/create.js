import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { input, select, checkbox, confirm } from '@inquirer/prompts';
import { getPaths, loadListeProjets, saveListeProjets, saveProject } from '../config.js';
import { CATEGORIES, AVAILABLE_TAGS, AVAILABLE_COMPETENCES, IMAGE_EXTENSIONS } from '../constants.js';
import { generateSlug, naturalSortImages, normalizeRelativePath } from '../utils.js';

/**
 * Action interactive de création de projet
 * @param {string} portfolioDir 
 */
export async function createProjectAction(portfolioDir) {
  console.log(chalk.cyan("\n╔════════════════════════════════════════════════════╗"));
  console.log(chalk.cyan("║           CRÉATION D'UN NOUVEAU PROJET             ║"));
  console.log(chalk.cyan("╚════════════════════════════════════════════════════╝\n"));

  const titre = await input({
    message: 'Titre du projet :',
    validate: (v) => v.trim().length > 0 || 'Le titre est obligatoire.'
  });

  const defaultSlug = generateSlug(titre);
  const slug = await input({
    message: 'Identifiant URL (slug) :',
    default: defaultSlug,
    validate: (v) => /^[a-z0-9-]+$/.test(v.trim()) || 'Le slug ne doit comporter que des lettres minuscules, chiffres et tirets.'
  });

  const categorie = await select({
    message: 'Catégorie du projet :',
    choices: CATEGORIES
  });

  const { projetsDir } = getPaths(portfolioDir);
  const targetDir = path.join(projetsDir, categorie, slug);

  if (fs.existsSync(targetDir)) {
    console.log(chalk.yellow(`\n⚠️  Le dossier 'projets/${categorie}/${slug}' existe déjà sur le disque.`));
    const overwrite = await confirm({
      message: 'Voulez-vous réutiliser ce dossier et mettre à jour sa fiche projet.json ?',
      default: true
    });
    if (!overwrite) {
      console.log(chalk.gray('Création annulée.'));
      return;
    }
  } else {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const description = await input({
    message: 'Description courte / Note d\'intention :',
    validate: (v) => v.trim().length > 0 || 'La description est obligatoire.'
  });

  const lien = await input({
    message: 'Lien externe (optionnel, ex: https://github.com/...) :'
  });

  console.log(chalk.yellow("\n💡 Utilisez Espace pour cocher/décocher, Entrée pour valider.\n"));

  const tags = await checkbox({
    message: 'Sélectionnez les tags applicables :',
    choices: AVAILABLE_TAGS
  });

  const competences = await checkbox({
    message: 'Sélectionnez les compétences mobilisées :',
    choices: AVAILABLE_COMPETENCES
  });

  console.log(chalk.cyan("\n--- ANALYSE RÉFLEXIVE (Attendu académique BUT MMI / Carnet de bord) ---\n"));
  const contexte = await input({
    message: '1. Contexte & Cadrage du projet :'
  });
  const difficultes = await input({
    message: '2. Défis & Contraintes rencontrées :'
  });
  const reussites = await input({
    message: '3. Réussites majeures :'
  });
  const apprentissages = await input({
    message: '4. Bilan & Apprentissages clés :'
  });

  console.log(chalk.cyan("\n--- ÉTAPES DE PRODUCTION DU WORKFLOW ---\n"));
  const etapes = [];
  let addStep = await confirm({
    message: 'Voulez-vous ajouter une étape de conception / production ?',
    default: false
  });

  while (addStep) {
    const stepNum = etapes.length + 1;
    const stepTitre = await input({
      message: `Étape ${stepNum} - Titre :`,
      validate: (v) => v.trim().length > 0 || 'Le titre de l\'étape est obligatoire.'
    });
    const stepDesc = await input({
      message: `Étape ${stepNum} - Description :`,
      validate: (v) => v.trim().length > 0 || 'La description de l\'étape est requise.'
    });

    etapes.push({ titre: stepTitre.trim(), desc: stepDesc.trim() });

    addStep = await confirm({
      message: 'Ajouter une autre étape ?',
      default: false
    });
  }

  // Détecter les images si l'utilisateur les a déjà déposées dans le dossier
  let initialImages = [];
  try {
    const files = fs.readdirSync(targetDir);
    const extRegex = new RegExp(`\\.(${IMAGE_EXTENSIONS.map(e => e.replace('.', '')).join('|')})$`, 'i');
    const imageFiles = files.filter(f => extRegex.test(f)).sort(naturalSortImages);
    initialImages = imageFiles.map(img => `projets/${categorie}/${slug}/${img}`);
  } catch {
    initialImages = [];
  }

  const projectData = {
    slug: slug.trim(),
    titre: titre.trim(),
    description: description.trim(),
    categorie,
    tags: tags || [],
    competences: competences || [],
    images: initialImages,
    reflexion: {
      contexte: contexte.trim(),
      difficultes: difficultes.trim(),
      reussites: reussites.trim(),
      apprentissages: apprentissages.trim()
    },
    etapes,
    lien: lien.trim() || null
  };

  const relJsonPath = `projets/${categorie}/${slug}/projet.json`;
  saveProject(portfolioDir, relJsonPath, projectData);

  // Mettre à jour liste_projets.json
  const liste = loadListeProjets(portfolioDir);
  const normalizedRel = normalizeRelativePath(relJsonPath);

  if (!liste.includes(normalizedRel)) {
    liste.push(normalizedRel);
    saveListeProjets(portfolioDir, liste);
  }

  console.log(chalk.bold.green(`\n✅ Projet créé avec succès !`));
  console.log(chalk.white(`   Dossier : ${targetDir}`));
  console.log(chalk.white(`   Fiche   : ${relJsonPath}`));
  console.log(chalk.white(`   Images détectées : ${initialImages.length}`));
  if (initialImages.length === 0) {
    console.log(chalk.yellow(`   💡 Vous pouvez déposer vos images WebP dans le dossier et lancer "Synchroniser les images".\n`));
  } else {
    console.log('');
  }
}
