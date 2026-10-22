import fs from 'node:fs';
import path from 'node:path';
import { exec, spawn } from 'node:child_process';
import chalk from 'chalk';
import { input } from '@inquirer/prompts';
import { normalizeRelativePath, generateSlug } from './utils.js';

/**
 * Vérifie si un dossier est une racine de portfolio valide
 * @param {string} dir 
 * @returns {boolean}
 */
export function isValidPortfolioRoot(dir) {
  if (!dir || typeof dir !== 'string') return false;
  try {
    const jsonPath = path.join(dir, 'json', 'liste_projets.json');
    const projetsDir = path.join(dir, 'projets');
    return fs.existsSync(jsonPath) && fs.existsSync(projetsDir);
  } catch {
    return false;
  }
}

/**
 * Recherche ascendante d'un dossier portfolio
 * @param {string} startDir 
 * @param {number} maxDepth 
 * @returns {string|null}
 */
export function searchUpwardForPortfolio(startDir, maxDepth = 5) {
  let current = path.resolve(startDir);
  for (let i = 0; i < maxDepth; i++) {
    if (isValidPortfolioRoot(current)) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) break; // Racine du système atteinte
    current = parent;
  }
  return null;
}

/**
 * Résout dynamiquement la racine du portfolio
 * Priorité :
 * 1. Chemin passé en argument explicite
 * 2. Variable d'environnement PORTFOLIO_DIR
 * 3. Recherche ascendante depuis process.cwd()
 * 4. Recherche ascendante depuis le dossier de l'exécutable
 * 5. Saisie interactive si non trouvé (en mode interactif)
 * @param {string|null} explicitPath 
 * @param {boolean} interactive 
 * @returns {Promise<string|null>}
 */
export async function resolvePortfolioDir(explicitPath = null, interactive = true) {
  // 1. Argument explicite
  if (explicitPath) {
    const candidate = path.resolve(explicitPath);
    if (isValidPortfolioRoot(candidate)) {
      return candidate;
    }
    console.log(chalk.yellow(`⚠️  Le chemin spécifié '${explicitPath}' ne contient pas l'arborescence requise (json/liste_projets.json et projets/).`));
  }

  // 2. Variable d'environnement
  if (process.env.PORTFOLIO_DIR) {
    const envCandidate = path.resolve(process.env.PORTFOLIO_DIR);
    if (isValidPortfolioRoot(envCandidate)) {
      return envCandidate;
    }
  }

  // 3. Recherche depuis le répertoire de travail actuel
  const fromCwd = searchUpwardForPortfolio(process.cwd());
  if (fromCwd) {
    return fromCwd;
  }

  // 4. Recherche depuis l'emplacement de l'exécutable Node SEA / script
  const execDir = path.dirname(process.execPath);
  const fromExec = searchUpwardForPortfolio(execDir);
  if (fromExec) {
    return fromExec;
  }

  // Si exécuté via script dans tools/projectmanager, vérifier le répertoire courant
  try {
    const scriptDir = typeof __dirname !== 'undefined' ? __dirname : null;
    if (scriptDir) {
      const fromScript = searchUpwardForPortfolio(scriptDir);
      if (fromScript) {
        return fromScript;
      }
    }
  } catch {}

  if (!interactive) {
    return null;
  }

  // 5. Demande interactive à l'utilisateur
  console.log(chalk.yellow("\n⚠️  Impossible de détecter automatiquement le dossier du portfolio."));
  while (true) {
    const userPath = await input({
      message: 'Veuillez saisir le chemin absolu vers le dossier du portfolio :',
      validate: (v) => {
        if (!v || v.trim().length === 0) return 'Chemin requis';
        const resolved = path.resolve(v.trim());
        if (!fs.existsSync(resolved)) return 'Ce dossier n\'existe pas sur le disque';
        if (!isValidPortfolioRoot(resolved)) return 'Ce dossier ne contient pas json/liste_projets.json et projets/';
        return true;
      }
    });

    const validated = path.resolve(userPath.trim());
    if (isValidPortfolioRoot(validated)) {
      return validated;
    }
  }
}

/**
 * Récupère les chemins absolus des fichiers clés
 * @param {string} portfolioDir 
 */
export function getPaths(portfolioDir) {
  return {
    root: portfolioDir,
    jsonDir: path.join(portfolioDir, 'json'),
    listeProjetsFile: path.join(portfolioDir, 'json', 'liste_projets.json'),
    projetsDir: path.join(portfolioDir, 'projets'),
    projetsEtudiantDir: path.join(portfolioDir, 'projets', 'etudiant'),
    projetsPersoDir: path.join(portfolioDir, 'projets', 'perso')
  };
}

/**
 * Lit la liste des projets
 * @param {string} portfolioDir 
 * @returns {string[]}
 */
export function loadListeProjets(portfolioDir) {
  const { listeProjetsFile } = getPaths(portfolioDir);
  try {
    if (!fs.existsSync(listeProjetsFile)) return [];
    const raw = fs.readFileSync(listeProjetsFile, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeRelativePath) : [];
  } catch (err) {
    console.error(chalk.red(`Erreur de lecture de ${listeProjetsFile}:`), err.message);
    return [];
  }
}

/**
 * Sauvegarde la liste des projets
 * @param {string} portfolioDir 
 * @param {string[]} list 
 */
export function saveListeProjets(portfolioDir, list) {
  const { listeProjetsFile } = getPaths(portfolioDir);
  const normalized = [...new Set(list.map(normalizeRelativePath))];
  fs.writeFileSync(listeProjetsFile, JSON.stringify(normalized, null, 2) + '\n', 'utf-8');
}

/**
 * Lit la fiche JSON d'un projet
 * @param {string} portfolioDir 
 * @param {string} relativeOrFullPath 
 * @returns {object|null}
 */
export function loadProject(portfolioDir, relativeOrFullPath) {
  const cleanRelative = normalizeRelativePath(relativeOrFullPath);
  const fullPath = path.isAbsolute(relativeOrFullPath)
    ? relativeOrFullPath
    : path.join(portfolioDir, cleanRelative);

  if (!fs.existsSync(fullPath)) return null;

  try {
    const raw = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(chalk.red(`Erreur de lecture du projet ${cleanRelative}:`), err.message);
    return null;
  }
}

/**
 * Sauvegarde la fiche JSON d'un projet
 * @param {string} portfolioDir 
 * @param {string} relativeOrFullPath 
 * @param {object} data 
 */
export function saveProject(portfolioDir, relativeOrFullPath, data) {
  const cleanRelative = normalizeRelativePath(relativeOrFullPath);
  const fullPath = path.isAbsolute(relativeOrFullPath)
    ? relativeOrFullPath
    : path.join(portfolioDir, cleanRelative);

  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

/**
 * Récupère l'intégralité des projets avec métadonnées enrichies pour l'interface graphique
 * @param {string} portfolioDir 
 * @returns {Array<object>}
 */
export function getAllProjectsData(portfolioDir) {
  const liste = loadListeProjets(portfolioDir);
  const projects = [];

  for (const relPath of liste) {
    const cleanRel = normalizeRelativePath(relPath);
    const fullPath = path.join(portfolioDir, cleanRel);
    const projectDir = path.dirname(fullPath);

    let stat = null;
    try {
      if (fs.existsSync(fullPath)) {
        stat = fs.statSync(fullPath);
      }
    } catch {}

    const projectData = loadProject(portfolioDir, cleanRel);
    if (!projectData) {
      projects.push({
        relativePath: cleanRel,
        slug: path.basename(projectDir),
        titre: path.basename(projectDir),
        categorie: cleanRel.includes('etudiant') ? 'etudiant' : 'perso',
        existsOnDisk: false,
        error: 'Fichier JSON introuvable'
      });
      continue;
    }

    // Calcul du statut et progression des étapes / tâches
    const etapes = Array.isArray(projectData.etapes) ? projectData.etapes : [];
    const completedSteps = etapes.filter(e => e.status === 'completed' || e.done === true).length;
    const totalSteps = etapes.length;
    const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 100;

    let computedStatus = 'en_cours';
    if (totalSteps > 0 && completedSteps === totalSteps) {
      computedStatus = 'termine';
    } else if (projectData.status) {
      computedStatus = projectData.status;
    }

    // Détection de la couverture
    const images = Array.isArray(projectData.images) ? projectData.images : [];
    const coverImage = images.length > 0 ? images[0] : null;

    projects.push({
      ...projectData,
      relativePath: cleanRel,
      fullPath,
      projectDir,
      existsOnDisk: true,
      lastModified: stat ? stat.mtime.toISOString() : null,
      imageCount: images.length,
      coverImage,
      totalSteps,
      completedSteps,
      progressPercent,
      computedStatus
    });
  }

  return projects;
}

/**
 * Crée un nouveau projet depuis l'interface ou l'API
 * @param {string} portfolioDir 
 * @param {object} payload 
 */
export function createProjectData(portfolioDir, payload) {
  const { titre, slug, categorie, description, tags, competences, reflexion, etapes, lien, status } = payload;

  if (!titre || !titre.trim()) throw new Error('Le titre du projet est requis.');
  if (!slug || !slug.trim()) throw new Error('Le slug du projet est requis.');
  if (!categorie || !['etudiant', 'perso'].includes(categorie)) throw new Error('Catégorie invalide.');

  const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  const { projetsDir } = getPaths(portfolioDir);
  const targetDir = path.join(projetsDir, categorie, cleanSlug);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Scan initial des images si déjà présentes
  let initialImages = [];
  try {
    const files = fs.readdirSync(targetDir);
    const extRegex = /\.(webp|png|jpe?g|avif|gif|svg)$/i;
    const imageFiles = files.filter(f => extRegex.test(f)).sort();
    initialImages = imageFiles.map(img => `projets/${categorie}/${cleanSlug}/${img}`);
  } catch {}

  const newProject = {
    slug: cleanSlug,
    titre: titre.trim(),
    description: (description || '').trim(),
    categorie,
    status: status || 'en_cours',
    tags: Array.isArray(tags) ? tags : [],
    competences: Array.isArray(competences) ? competences : [],
    images: initialImages,
    reflexion: reflexion || {
      contexte: '',
      difficultes: '',
      reussites: '',
      apprentissages: ''
    },
    etapes: Array.isArray(etapes) ? etapes : [],
    lien: lien ? lien.trim() : null
  };

  const relJsonPath = `projets/${categorie}/${cleanSlug}/projet.json`;
  saveProject(portfolioDir, relJsonPath, newProject);

  const liste = loadListeProjets(portfolioDir);
  if (!liste.includes(relJsonPath)) {
    liste.push(relJsonPath);
    saveListeProjets(portfolioDir, liste);
  }

  return newProject;
}

/**
 * Met à jour un projet existant
 * @param {string} portfolioDir 
 * @param {string} oldCategory 
 * @param {string} oldSlug 
 * @param {object} payload 
 */
export function updateProjectData(portfolioDir, oldCategory, oldSlug, payload) {
  const oldRelPath = `projets/${oldCategory}/${oldSlug}/projet.json`;
  const existing = loadProject(portfolioDir, oldRelPath) || {};

  const newCategory = payload.categorie || oldCategory;
  const newSlug = (payload.slug || oldSlug).trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  const isRenamed = newCategory !== oldCategory || newSlug !== oldSlug;

  const { projetsDir } = getPaths(portfolioDir);
  const oldDir = path.join(projetsDir, oldCategory, oldSlug);
  const newDir = path.join(projetsDir, newCategory, newSlug);

  if (isRenamed && fs.existsSync(oldDir)) {
    if (!fs.existsSync(path.dirname(newDir))) {
      fs.mkdirSync(path.dirname(newDir), { recursive: true });
    }
    fs.renameSync(oldDir, newDir);
  }

  // Si renommé, adapter les chemins d'images
  let images = Array.isArray(payload.images) ? payload.images : existing.images || [];
  if (isRenamed && Array.isArray(images)) {
    images = images.map(img => img.replace(`projets/${oldCategory}/${oldSlug}/`, `projets/${newCategory}/${newSlug}/`));
  }

  const sanitized = {
    slug: newSlug,
    titre: (payload.titre !== undefined ? payload.titre : existing.titre || '').trim(),
    description: (payload.description !== undefined ? payload.description : existing.description || '').trim(),
    categorie: newCategory,
    status: payload.status || existing.status || 'en_cours',
    tags: Array.isArray(payload.tags) ? payload.tags : existing.tags || [],
    competences: Array.isArray(payload.competences) ? payload.competences : existing.competences || [],
    images,
    reflexion: payload.reflexion || existing.reflexion || {
      contexte: '',
      difficultes: '',
      reussites: '',
      apprentissages: ''
    },
    etapes: Array.isArray(payload.etapes) ? payload.etapes : existing.etapes || [],
    lien: payload.lien !== undefined ? payload.lien : existing.lien || null
  };

  const newRelPath = `projets/${newCategory}/${newSlug}/projet.json`;
  saveProject(portfolioDir, newRelPath, sanitized);

  // Mettre à jour liste_projets.json
  let liste = loadListeProjets(portfolioDir);
  if (isRenamed) {
    liste = liste.map(p => p === oldRelPath ? newRelPath : p);
  } else if (!liste.includes(newRelPath)) {
    liste.push(newRelPath);
  }
  saveListeProjets(portfolioDir, liste);

  return sanitized;
}

/**
 * Supprime ou désindexe un projet
 * @param {string} portfolioDir 
 * @param {string} category 
 * @param {string} slug 
 * @param {string} mode 'unindex' ou 'purge'
 */
export function deleteProjectData(portfolioDir, category, slug, mode = 'unindex') {
  createBackup(portfolioDir);

  const relPath = `projets/${category}/${slug}/projet.json`;
  let liste = loadListeProjets(portfolioDir);
  liste = liste.filter(p => normalizeRelativePath(p) !== relPath);
  saveListeProjets(portfolioDir, liste);

  if (mode === 'purge') {
    const { projetsDir } = getPaths(portfolioDir);
    const targetDir = path.join(projetsDir, category, slug);
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }
  }

  return { success: true, mode, relPath };
}

/**
 * Crée une sauvegarde locale datée de liste_projets.json
 * @param {string} portfolioDir 
 */
export function createBackup(portfolioDir) {
  const { jsonDir, listeProjetsFile } = getPaths(portfolioDir);
  const backupDir = path.join(jsonDir, 'backups');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  if (fs.existsSync(listeProjetsFile)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `liste_projets_${timestamp}.json`);
    fs.copyFileSync(listeProjetsFile, backupFile);
    return backupFile;
  }
  return null;
}

/**
 * Définit une image spécifique comme couverture (la place en 1ère position dans images)
 * @param {string} portfolioDir 
 * @param {string} category 
 * @param {string} slug 
 * @param {string} imagePath 
 */
export function setProjectCover(portfolioDir, category, slug, imagePath) {
  const relJsonPath = `projets/${category}/${slug}/projet.json`;
  const data = loadProject(portfolioDir, relJsonPath);
  if (!data) throw new Error('Projet introuvable');

  const cleanTarget = normalizeRelativePath(imagePath);
  let images = Array.isArray(data.images) ? data.images.map(normalizeRelativePath) : [];

  if (!images.includes(cleanTarget)) {
    images.unshift(cleanTarget);
  } else {
    images = [cleanTarget, ...images.filter(img => img !== cleanTarget)];
  }

  data.images = images;
  saveProject(portfolioDir, relJsonPath, data);
  return data;
}

/**
 * Réordonne les images d'un projet
 * @param {string} portfolioDir 
 * @param {string} category 
 * @param {string} slug 
 * @param {string[]} newImages 
 */
export function reorderProjectImages(portfolioDir, category, slug, newImages) {
  const relJsonPath = `projets/${category}/${slug}/projet.json`;
  const data = loadProject(portfolioDir, relJsonPath);
  if (!data) throw new Error('Projet introuvable');

  if (!Array.isArray(newImages)) throw new Error('Tableau d\'images requis');
  data.images = newImages.map(normalizeRelativePath);
  saveProject(portfolioDir, relJsonPath, data);
  return data;
}

/**
 * Supprime physiquement une image et la retire du projet
 * @param {string} portfolioDir 
 * @param {string} category 
 * @param {string} slug 
 * @param {string} imagePath 
 */
export function deleteProjectImageFile(portfolioDir, category, slug, imagePath) {
  const relJsonPath = `projets/${category}/${slug}/projet.json`;
  const data = loadProject(portfolioDir, relJsonPath);
  if (!data) throw new Error('Projet introuvable');

  const cleanRel = normalizeRelativePath(imagePath);
  const fullImgPath = path.resolve(portfolioDir, cleanRel);

  // Sécurité anti-traversal
  if (!fullImgPath.startsWith(path.resolve(portfolioDir))) {
    throw new Error('Chemin d\'accès non autorisé');
  }

  if (fs.existsSync(fullImgPath)) {
    fs.unlinkSync(fullImgPath);
  }

  data.images = (data.images || []).map(normalizeRelativePath).filter(img => img !== cleanRel);
  saveProject(portfolioDir, relJsonPath, data);
  return data;
}

/**
 * Importe une nouvelle image depuis un buffer base64
 * @param {string} portfolioDir 
 * @param {string} category 
 * @param {string} slug 
 * @param {string} filename 
 * @param {string} base64Data 
 */
export function uploadProjectImageFile(portfolioDir, category, slug, filename, base64Data) {
  const relJsonPath = `projets/${category}/${slug}/projet.json`;
  const data = loadProject(portfolioDir, relJsonPath);
  if (!data) throw new Error('Projet introuvable');

  const ext = path.extname(filename).toLowerCase();
  const validExts = ['.webp', '.png', '.jpg', '.jpeg', '.avif', '.gif', '.svg'];
  if (!validExts.includes(ext)) {
    throw new Error(`Extension non prise en charge (${ext}). Formats admis : ${validExts.join(', ')}`);
  }

  const cleanName = path.basename(filename).toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
  const { projetsDir } = getPaths(portfolioDir);
  const targetDir = path.join(projetsDir, category, slug);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const targetFile = path.join(targetDir, cleanName);
  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(targetFile, buffer);

  const newRelImg = normalizeRelativePath(`projets/${category}/${slug}/${cleanName}`);
  const images = Array.isArray(data.images) ? data.images.map(normalizeRelativePath) : [];
  if (!images.includes(newRelImg)) {
    images.push(newRelImg);
  }
  data.images = images;
  saveProject(portfolioDir, relJsonPath, data);

  return { project: data, imagePath: newRelImg };
}

/**
 * Clone / duplique un projet existant
 * @param {string} portfolioDir 
 * @param {string} category 
 * @param {string} slug 
 * @param {string} newTitle 
 * @param {string} newSlug 
 */
export function duplicateProject(portfolioDir, category, slug, newTitle, newSlug) {
  const sourceRel = `projets/${category}/${slug}/projet.json`;
  const sourceData = loadProject(portfolioDir, sourceRel);
  if (!sourceData) throw new Error('Projet source introuvable');

  const finalSlug = (newSlug || generateSlug(newTitle) || `${slug}-copie`).trim().toLowerCase();
  const finalTitle = (newTitle || `${sourceData.titre || slug} (Copie)`).trim();

  const clonedPayload = {
    ...sourceData,
    titre: finalTitle,
    slug: finalSlug,
    categorie: category,
    status: 'en_cours',
    images: [] // Nouveau dossier vierge prêt pour de nouvelles photos
  };

  return createProjectData(portfolioDir, clonedPayload);
}

/**
 * Récupère la liste des sauvegardes disponibles
 * @param {string} portfolioDir 
 */
export function getBackupsList(portfolioDir) {
  const { jsonDir } = getPaths(portfolioDir);
  const backupDir = path.join(jsonDir, 'backups');
  if (!fs.existsSync(backupDir)) return [];

  const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json'));
  const backups = [];

  for (const file of files) {
    const fullPath = path.join(backupDir, file);
    try {
      const stat = fs.statSync(fullPath);
      let count = 0;
      try {
        const content = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
        if (Array.isArray(content)) count = content.length;
      } catch {}

      backups.push({
        filename: file,
        size: stat.size,
        sizeFormatted: `${(stat.size / 1024).toFixed(1)} Ko`,
        mtime: stat.mtime.toISOString(),
        projectCount: count
      });
    } catch {}
  }

  // Tri de la plus récente à la plus ancienne
  backups.sort((a, b) => new Date(b.mtime) - new Date(a.mtime));
  return backups;
}

/**
 * Restaure une sauvegarde spécifique
 * @param {string} portfolioDir 
 * @param {string} filename 
 */
export function restoreBackupFile(portfolioDir, filename) {
  const { jsonDir, listeProjetsFile } = getPaths(portfolioDir);
  const cleanName = path.basename(filename);
  const backupFile = path.join(jsonDir, 'backups', cleanName);

  if (!fs.existsSync(backupFile)) {
    throw new Error('Fichier de sauvegarde introuvable sur le disque.');
  }

  // Sauvegarde préventive de sécurité
  createBackup(portfolioDir);

  fs.copyFileSync(backupFile, listeProjetsFile);
  return { success: true, restored: cleanName };
}

/**
 * Supprime un fichier de sauvegarde
 * @param {string} portfolioDir 
 * @param {string} filename 
 */
export function deleteBackupFile(portfolioDir, filename) {
  const { jsonDir } = getPaths(portfolioDir);
  const cleanName = path.basename(filename);
  const backupFile = path.join(jsonDir, 'backups', cleanName);

  if (fs.existsSync(backupFile)) {
    fs.unlinkSync(backupFile);
  }
  return { success: true };
}

/**
 * Ouvre un dossier local dans l'Explorateur Windows
 * @param {string} targetPath 
 */
export function openInExplorer(targetPath) {
  if (process.platform === 'win32') {
    spawn('explorer.exe', [targetPath], { detached: true, stdio: 'ignore' }).unref();
  }
}

/**
 * Déclenche la compilation du site via 'npm run build'
 * @param {string} portfolioDir 
 * @returns {Promise<{success: boolean, output: string, elapsedMs: number}>}
 */
export function buildPortfolioProject(portfolioDir) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const cmd = process.platform === 'win32' ? 'npm.cmd run build' : 'npm run build';
    exec(cmd, { cwd: portfolioDir, timeout: 60000 }, (error, stdout, stderr) => {
      const elapsedMs = Date.now() - startTime;
      const output = `${stdout || ''}\n${stderr || ''}`.trim();
      if (error) {
        resolve({ success: false, output, error: error.message, elapsedMs });
      } else {
        resolve({ success: true, output, elapsedMs });
      }
    });
  });
}

/**
 * Génère une fiche projet complète formatée en Markdown pour les rapports académiques / carnets de bord
 * @param {object} project 
 * @returns {string}
 */
export function generateProjectMarkdown(project) {
  const p = project || {};
  const ref = p.reflexion || {};
  const tags = (p.tags || []).map(t => `#${t}`).join(' ');
  const comps = (p.competences || []).map(c => `- ${c}`).join('\n');
  const etapes = (p.etapes || []).map((e, idx) => `- [${e.status === 'completed' || e.done ? 'x' : ' '}] **Étape ${idx + 1} : ${e.titre}**${e.desc ? ` — ${e.desc}` : ''}`).join('\n');
  const images = (p.images || []).map(img => `- \`${img}\``).join('\n');

  return `# ${p.titre || 'Projet'}

> **Identifiant (Slug)** : \`${p.slug || ''}\`  
> **Catégorie** : ${p.categorie === 'etudiant' ? 'Étudiant (BUT MMI)' : 'Personnel / Photographie'}  
> **Statut** : ${p.status || 'en_cours'}  
> **Tags** : ${tags || 'Aucun'}  
${p.lien ? `> **Lien externe** : [Consulter](${p.lien})\n` : ''}

---

## 📌 Présentation & Note d'Intention
${p.description || 'Aucune description rédigée.'}

---

## 🎓 Compétences BUT MMI Mobilisées
${comps || '_Aucune compétence spécifiée._'}

---

## 📖 Analyse Réflexive (Carnet de bord)

### 1. Contexte & Cadrage
${ref.contexte || '_Non renseigné._'}

### 2. Défis & Contraintes
${ref.difficultes || '_Non renseigné._'}

### 3. Réussites & Points Forts
${ref.reussites || '_Non renseigné._'}

### 4. Bilan & Apprentissages
${ref.apprentissages || '_Non renseigné._'}

---

## 📐 Étapes de Conception & Jalons
${etapes || '_Aucune étape enregistrée._'}

---

## 📷 Visuels & Tirages Indexés (${(p.images || []).length})
${images || '_Aucune image associée._'}

---
*Généré automatiquement par Project Manager — Portfolio Sacha Guitter*
`;
}
