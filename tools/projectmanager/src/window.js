import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

/**
 * Recherche l'exécutable Microsoft Edge ou Google Chrome sur la machine
 * @returns {string|null}
 */
export function findBrowserExecutable() {
  const localAppData = process.env.LOCALAPPDATA || '';
  const programFiles = process.env.ProgramFiles || 'C:\\Program Files';
  const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';

  const candidates = [
    path.join(programFilesX86, 'Microsoft\\Edge\\Application\\msedge.exe'),
    path.join(programFiles, 'Microsoft\\Edge\\Application\\msedge.exe'),
    path.join(localAppData, 'Microsoft\\Edge\\Application\\msedge.exe'),
    path.join(programFiles, 'Google\\Chrome\\Application\\chrome.exe'),
    path.join(programFilesX86, 'Google\\Chrome\\Application\\chrome.exe'),
    path.join(localAppData, 'Google\\Chrome\\Application\\chrome.exe')
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

/**
 * Ouvre l'interface graphique en mode fenêtre native (App Mode sans barre d'adresse ni onglets)
 * Utilise un profil dédié (--user-data-dir) pour empêcher la fermeture immédiate sous Windows
 * @param {string} url 
 * @param {object} options 
 * @returns {ChildProcess|null}
 */
export function openAppWindow(url, options = {}) {
  const { onExit, width = 1280, height = 820 } = options;
  const browserPath = findBrowserExecutable();

  if (browserPath) {
    // Dossier de profil temporaire isolé pour empêcher Edge de déléguer et quitter en 40ms
    const tempProfileDir = path.join(os.tmpdir(), 'projectmanager-edge-profile');
    try {
      if (!fs.existsSync(tempProfileDir)) {
        fs.mkdirSync(tempProfileDir, { recursive: true });
      }
    } catch {}

    const args = [
      `--app=${url}`,
      `--window-size=${width},${height}`,
      `--user-data-dir=${tempProfileDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--disable-plugins',
      '--class=ProjectManager'
    ];

    const launchTime = Date.now();
    let isFallbackDone = false;

    const child = spawn(browserPath, args, {
      detached: false,
      stdio: 'ignore'
    });

    child.on('exit', (code) => {
      const elapsed = Date.now() - launchTime;
      // Si le processus a quitté immédiatement (moins de 2.5 secondes),
      // Edge a délégué à une instance existante ou a rencontré un conflit.
      // On bascule alors immédiatement sur le navigateur par défaut SANS tuer le serveur !
      if (elapsed < 2500 && !isFallbackDone) {
        isFallbackDone = true;
        console.warn(`[Info] Fenêtre Edge détachée en ${elapsed}ms. Ouverture dans votre navigateur habituel...`);
        openInDefaultBrowser(url);
        return;
      }

      // Si la fenêtre a tourné plus de 2.5s et est fermée par l'utilisateur
      if (typeof onExit === 'function') {
        onExit(code);
      }
    });

    child.on('error', (err) => {
      console.warn('Impossible de lancer la fenêtre dédiée :', err.message);
      if (!isFallbackDone) {
        isFallbackDone = true;
        openInDefaultBrowser(url);
      }
    });

    return child;
  } else {
    // Si aucun navigateur Chromium n'est trouvé, ouvrir avec le navigateur par défaut
    openInDefaultBrowser(url);
    return null;
  }
}

/**
 * Ouvre l'URL directement dans le navigateur système par défaut (Chrome, Edge, Firefox, Brave...)
 * sous forme d'onglet standard (aucun mode popup ni fenêtre Chromium isolée).
 * @param {string} url 
 * @returns {ChildProcess|null}
 */
export function openInDefaultBrowser(url) {
  let child = null;
  try {
    if (process.platform === 'win32') {
      child = spawn('cmd.exe', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' });
    } else if (process.platform === 'darwin') {
      child = spawn('open', [url], { detached: true, stdio: 'ignore' });
    } else {
      child = spawn('xdg-open', [url], { detached: true, stdio: 'ignore' });
    }
    if (child) {
      child.unref();
    }
  } catch (err) {
    console.error('Erreur lors de l\'ouverture du navigateur :', err.message);
  }
  return child;
}
