#!/usr/bin/env node

/**
 * PORTFOLIO PROJECT MANAGER v2.2.0 (GUI & CLI)
 * Application Desktop Standalone (Node.js SEA + Chromium App Window)
 * Sacha Guitter — Portfolio Photographie & Direction Artistique
 */

import chalk from 'chalk';
import { select, password } from '@inquirer/prompts';
import { resolvePortfolioDir } from './src/config.js';
import { createProjectAction } from './src/actions/create.js';
import { modifyProjectAction } from './src/actions/modify.js';
import { syncImagesAction } from './src/actions/sync.js';
import { auditAction } from './src/actions/audit.js';
import { deleteProjectAction } from './src/actions/delete.js';
import { startServer } from './src/server.js';
import { openAppWindow, openInDefaultBrowser } from './src/window.js';
import { isPasswordSet, verifyPassword, savePassword, disablePassword } from './src/auth.js';

const VERSION = '2.3.0';

function showHelp() {
  console.log(`
${chalk.bold.cyan('PORTFOLIO PROJECT MANAGER')} ${chalk.gray(`v${VERSION}`)}
Application d'administration éditoriale du portfolio de Sacha Guitter.

${chalk.bold('UTILISATION :')}
  projectmanager.exe [OPTIONS]
  node index.js [OPTIONS]

${chalk.bold('MODES :')}
  (Par défaut)            Lance le serveur et ouvre l'interface dans votre navigateur
  --popup                 Ouvre en fenêtre dédiée Chromium (mode application / popup)
  --cli                   Lance le menu textuel interactif en console
  -s, --sync              Synchronise directement les images sans interaction (CLI)
  -a, --audit             Exécute directement le diagnostic de santé (CLI)

${chalk.bold('OPTIONS :')}
  -p, --path <chemin>     Spécifie le dossier racine du portfolio
  --port <numéro>         Spécifie le port HTTP local (par défaut 4899)
  -w, --password <pwd>    Spécifie le mot de passe pour les commandes automatisées
  -v, --version           Affiche la version de l'application
  -h, --help              Affiche cette documentation d'aide

${chalk.bold('EXEMPLES :')}
  projectmanager.exe
  projectmanager.exe --cli
  projectmanager.exe --sync
  projectmanager.exe --audit
`);
}

function parseCliArgs() {
  const args = process.argv.slice(2);
  const options = {
    help: false,
    version: false,
    sync: false,
    audit: false,
    cli: false,
    popup: false,
    port: 0,
    password: null,
    path: null
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-h' || arg === '--help') {
      options.help = true;
    } else if (arg === '-v' || arg === '--version') {
      options.version = true;
    } else if (arg === '-s' || arg === '--sync') {
      options.sync = true;
    } else if (arg === '-a' || arg === '--audit') {
      options.audit = true;
    } else if (arg === '--cli') {
      options.cli = true;
    } else if (arg === '--popup' || arg === '--app') {
      options.popup = true;
    } else if (arg === '--browser') {
      options.popup = false;
    } else if (arg === '--port' && i + 1 < args.length) {
      options.port = parseInt(args[++i], 10) || 0;
    } else if ((arg === '-w' || arg === '--password') && i + 1 < args.length) {
      options.password = args[++i];
    } else if ((arg === '-p' || arg === '--path') && i + 1 < args.length) {
      options.path = args[++i];
    } else if (!arg.startsWith('-') && !options.path) {
      options.path = arg;
    }
  }

  return options;
}

async function authenticateCli(portfolioDir) {
  if (!isPasswordSet(portfolioDir)) return true;
  console.log(chalk.yellow('🔒 Accès sécurisé : Ce portfolio est protégé par un mot de passe.\n'));
  for (let attempt = 1; attempt <= 3; attempt++) {
    const entered = await password({
      message: '🔑 Mot de passe requis :',
      mask: '*'
    });
    if (verifyPassword(portfolioDir, entered)) {
      console.log(chalk.green('\n✔ Mot de passe validé avec succès.\n'));
      return true;
    }
    console.log(chalk.red(`❌ Mot de passe incorrect (${attempt}/3)`));
  }
  console.log(chalk.red('\nNombre maximal de tentatives dépassé. Fermeture.\n'));
  return false;
}

async function manageCliSecurity(portfolioDir) {
  const hasPwd = isPasswordSet(portfolioDir);
  if (hasPwd) {
    const choice = await select({
      message: 'Gestion de la sécurité et du mot de passe :',
      choices: [
        { name: '✏️  Modifier le mot de passe', value: 'change' },
        { name: '🔓 Désactiver la protection par mot de passe', value: 'disable' },
        { name: '↩️  Retour au menu principal', value: 'back' }
      ]
    });
    if (choice === 'change') {
      const current = await password({ message: 'Mot de passe actuel :', mask: '*' });
      if (!verifyPassword(portfolioDir, current)) {
        console.log(chalk.red('❌ Mot de passe actuel incorrect.'));
        return;
      }
      const newPwd = await password({ message: 'Nouveau mot de passe (min 3 car.) :', mask: '*' });
      if (!newPwd || newPwd.length < 3) {
        console.log(chalk.red('❌ Le mot de passe doit comporter au moins 3 caractères.'));
        return;
      }
      const confirmPwd = await password({ message: 'Confirmez le nouveau mot de passe :', mask: '*' });
      if (newPwd !== confirmPwd) {
        console.log(chalk.red('❌ Les mots de passe ne correspondent pas.'));
        return;
      }
      savePassword(portfolioDir, newPwd);
      console.log(chalk.green('✔ Nouveau mot de passe enregistré avec succès !\n'));
    } else if (choice === 'disable') {
      const current = await password({ message: 'Mot de passe actuel pour confirmation :', mask: '*' });
      if (!verifyPassword(portfolioDir, current)) {
        console.log(chalk.red('❌ Mot de passe incorrect.'));
        return;
      }
      disablePassword(portfolioDir);
      console.log(chalk.green('✔ Protection par mot de passe désactivée.\n'));
    }
  } else {
    const choice = await select({
      message: 'Aucun mot de passe actif. Que souhaitez-vous faire ?',
      choices: [
        { name: '🔒 Définir un mot de passe de protection', value: 'set' },
        { name: '↩️  Retour au menu principal', value: 'back' }
      ]
    });
    if (choice === 'set') {
      const newPwd = await password({ message: 'Nouveau mot de passe (min 3 car.) :', mask: '*' });
      if (!newPwd || newPwd.length < 3) {
        console.log(chalk.red('❌ Le mot de passe doit comporter au moins 3 caractères.'));
        return;
      }
      const confirmPwd = await password({ message: 'Confirmez le mot de passe :', mask: '*' });
      if (newPwd !== confirmPwd) {
        console.log(chalk.red('❌ Les mots de passe ne correspondent pas.'));
        return;
      }
      savePassword(portfolioDir, newPwd);
      console.log(chalk.green('✔ Mot de passe activé avec succès !\n'));
    }
  }
}

async function runCliMode(portfolioDir) {
  if (!await authenticateCli(portfolioDir)) {
    process.exit(1);
  }

  console.log(chalk.bold.magenta(`
╔════════════════════════════════════════════════════════════════════╗
║                PORTFOLIO PROJECT MANAGER v${VERSION}                    ║
║               Sacha Guitter — Portfolio Éditorial                  ║
╚════════════════════════════════════════════════════════════════════╝
`));
  console.log(`${chalk.bold('📁 Dossier actif :')} ${chalk.cyan(portfolioDir)}\n`);

  while (true) {
    const action = await select({
      message: 'Que souhaitez-vous faire ?',
      choices: [
        { name: '✨ Créer un nouveau projet', value: 'create' },
        { name: '✏️  Modifier un projet existant', value: 'modify' },
        { name: '🔄 Synchroniser les images (détection automatique)', value: 'sync' },
        { name: '🔍 Auditer l\'intégrité des projets (santé & cohérence)', value: 'audit' },
        { name: '🗑️  Supprimer ou désindexer un projet', value: 'delete' },
        { name: '🔒 Sécurité & Mot de passe', value: 'security' },
        { name: '📁 Changer de dossier de portfolio', value: 'switch_dir' },
        { name: '❌ Quitter', value: 'exit' }
      ]
    });

    try {
      if (action === 'create') await createProjectAction(portfolioDir);
      else if (action === 'modify') await modifyProjectAction(portfolioDir);
      else if (action === 'sync') await syncImagesAction(portfolioDir);
      else if (action === 'audit') await auditAction(portfolioDir);
      else if (action === 'delete') await deleteProjectAction(portfolioDir);
      else if (action === 'security') await manageCliSecurity(portfolioDir);
      else if (action === 'switch_dir') {
        portfolioDir = await resolvePortfolioDir(null, true);
        console.clear();
        console.log(`${chalk.bold('📁 Dossier actif :')} ${chalk.cyan(portfolioDir)}\n`);
      } else if (action === 'exit') {
        console.log(chalk.blue('\nÀ bientôt ! ✨\n'));
        process.exit(0);
      }
    } catch (err) {
      if (err.name === 'ExitPromptError') {
        console.log(chalk.gray('\nAction interrompue.\n'));
      } else {
        console.error(chalk.red('\nErreur :'), err);
      }
    }
  }
}

async function main() {
  const options = parseCliArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  if (options.version) {
    console.log(`Portfolio Project Manager v${VERSION}`);
    process.exit(0);
  }

  // Résolution du dossier de travail
  let portfolioDir = await resolvePortfolioDir(options.path, options.cli || options.sync || options.audit);
  if (!portfolioDir) {
    // Si la détection silencieuse a échoué en mode GUI, on résout avec prompt
    portfolioDir = await resolvePortfolioDir(null, true);
  }

  // 1. Commandes CLI directes (Headless)
  if (options.sync || options.audit) {
    if (isPasswordSet(portfolioDir)) {
      if (options.password) {
        if (!verifyPassword(portfolioDir, options.password)) {
          console.error(chalk.red('❌ Erreur : Mot de passe fourni incorrect.'));
          process.exit(1);
        }
      } else if (process.stdin.isTTY) {
        if (!await authenticateCli(portfolioDir)) {
          process.exit(1);
        }
      } else {
        console.error(chalk.red('❌ Erreur : Ce portfolio est protégé par mot de passe. Fournissez --password <pwd>.'));
        process.exit(1);
      }
    }
  }

  if (options.sync) {
    await syncImagesAction(portfolioDir, { silent: false });
    process.exit(0);
  }

  if (options.audit) {
    await auditAction(portfolioDir, { silent: false, interactive: true });
    process.exit(0);
  }

  // 2. Mode Console TUI classique si demandé
  if (options.cli) {
    await runCliMode(portfolioDir);
    return;
  }

  // 3. Mode INTERFACE GRAPHIQUE (Par défaut)
  try {
    const { server, port, url } = await startServer({
      portfolioDir,
      port: options.port || 4899,
      onPortfolioChanged: (newDir) => {
        portfolioDir = newDir;
      }
    });

    console.log(chalk.bold.cyan(`
╔════════════════════════════════════════════════════════════════════╗
║                PORTFOLIO PROJECT MANAGER v${VERSION}                    ║
║               Sacha Guitter — Portfolio Éditorial                  ║
╚════════════════════════════════════════════════════════════════════╝
`));
    console.log(chalk.green(`  ✔ Application prête et active sur : ${chalk.bold.underline(url)}`));
    console.log(chalk.gray(`  ✔ Dossier de travail : ${portfolioDir}`));
    console.log(chalk.cyan(`  ✔ Ouverture dans votre navigateur web...\n`));
    console.log(chalk.yellow(`  💡 Si le navigateur ne s'ouvre pas automatiquement,`));
    console.log(chalk.yellow(`     ouvrez directement l'adresse ${url} dans votre navigateur.\n`));
    console.log(chalk.gray(`  (Appuyez sur Ctrl+C dans ce terminal ou fermez l'onglet pour quitter)\n`));

    if (options.popup) {
      openAppWindow(url, {
        width: 1280,
        height: 840,
        onExit: () => {
          server.close(() => process.exit(0));
        }
      });
    } else {
      openInDefaultBrowser(url);
    }

    // Gestion propre de l'arrêt (Ctrl+C dans le terminal s'il est ouvert)
    process.on('SIGINT', () => {
      server.close(() => process.exit(0));
    });
  } catch (err) {
    console.error(chalk.red('Erreur de démarrage du serveur graphique :'), err);
    process.exit(1);
  }
}

main().catch(err => {
  if (err.name === 'ExitPromptError') {
    process.exit(0);
  }
  console.error(chalk.red('Erreur fatale :'), err);
  process.exit(1);
});
