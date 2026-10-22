import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { URL } from 'node:url';

import {
  getAllProjectsData,
  createProjectData,
  updateProjectData,
  deleteProjectData,
  createBackup,
  loadProject,
  saveListeProjets,
  loadListeProjets,
  isValidPortfolioRoot,
  getPaths,
  setProjectCover,
  reorderProjectImages,
  deleteProjectImageFile,
  uploadProjectImageFile,
  duplicateProject,
  getBackupsList,
  restoreBackupFile,
  deleteBackupFile,
  generateProjectMarkdown,
  openInExplorer,
  buildPortfolioProject
} from './config.js';
import { CATEGORIES, AVAILABLE_TAGS, AVAILABLE_COMPETENCES } from './constants.js';
import { syncImagesAction } from './actions/sync.js';
import { auditAction } from './actions/audit.js';
import { EMBEDDED_HTML, EMBEDDED_CSS, EMBEDDED_JS } from './embedded-assets.js';
import { normalizeRelativePath } from './utils.js';
import { openInDefaultBrowser } from './window.js';
import {
  getAuthConfig,
  isPasswordSet,
  verifyPassword,
  savePassword,
  disablePassword,
  createSessionToken,
  revokeSessionToken,
  isAuthorized,
  extractToken
} from './auth.js';

const VERSION = '2.3.0';

/**
 * Crée et démarre le serveur HTTP local pour l'interface graphique
 * @param {object} options 
 * @returns {Promise<{server: http.Server, port: number, url: string}>}
 */
export function startServer(options = {}) {
  let { portfolioDir, port = 4899 } = options;
  if (!port) port = 4899;

  return new Promise((resolve, reject) => {
    let lastActiveTime = Date.now();
    let hasClientConnected = false;
    let isTerminating = false;
    let shutdownTimeout = null;

    // Surveillance périodique de l'activité du frontend
    // Tolérance d'inactivité de 15 minutes pour permettre le multitâche sans interruption brutale
    const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
    const heartbeatInterval = setInterval(() => {
      if (isTerminating) return;
      if (hasClientConnected && (Date.now() - lastActiveTime > INACTIVITY_TIMEOUT)) {
        isTerminating = true;
        clearInterval(heartbeatInterval);
        server.close(() => process.exit(0));
      }
    }, 15000);

    const server = http.createServer(async (req, res) => {
      // Toute requête entrante annule un éventuel arrêt programmé (ex: rechargement F5 de la page)
      if (shutdownTimeout) {
        clearTimeout(shutdownTimeout);
        shutdownTimeout = null;
      }
      lastActiveTime = Date.now();
      hasClientConnected = true;

      // Headers CORS de base
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const pathname = parsedUrl.pathname;

      // Helper pour parser le body JSON
      const parseBody = () => new Promise((resolveBody) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            resolveBody(body ? JSON.parse(body) : {});
          } catch {
            resolveBody({});
          }
        });
      });

      // Helper pour répondre en JSON
      const sendJson = (data, status = 200) => {
        res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(data));
      };

      // Helper pour répondre en erreur
      const sendError = (msg, status = 400) => {
        sendJson({ error: msg }, status);
      };

      try {
        /* ─────────────────────────────────────────────
           ROUTES API
        ───────────────────────────────────────────── */

        // 0. POST /api/heartbeat
        if (pathname === '/api/heartbeat' && req.method === 'POST') {
          return sendJson({ ok: true, active: true });
        }

        /* ─────────────────────────────────────────────
           AUTHENTIFICATION & SÉCURITÉ
        ───────────────────────────────────────────── */

        // A1. GET /api/auth/status
        if (pathname === '/api/auth/status' && req.method === 'GET') {
          const hasPassword = isPasswordSet(portfolioDir);
          const authorized = !hasPassword || isAuthorized(req, parsedUrl, portfolioDir);
          return sendJson({
            hasPassword,
            authenticated: authorized
          });
        }

        // A2. POST /api/auth/setup (Configuration initiale d'un code / mot de passe)
        if (pathname === '/api/auth/setup' && req.method === 'POST') {
          const body = await parseBody();
          const pwd = body.password ? String(body.password).trim() : '';
          if (!pwd) {
            return sendError('Veuillez renseigner un code d\'accès ou mot de passe.', 400);
          }
          savePassword(portfolioDir, pwd);
          const token = createSessionToken(body.rememberMe !== false);
          res.setHeader('Set-Cookie', `pm_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${30 * 24 * 3600}`);
          return sendJson({ success: true, token });
        }

        // A3. POST /api/auth/login (Connexion par mot de passe)
        if (pathname === '/api/auth/login' && req.method === 'POST') {
          const body = await parseBody();
          const pwd = body.password ? String(body.password) : '';

          if (!isPasswordSet(portfolioDir)) {
            const token = createSessionToken(true);
            return sendJson({ success: true, token });
          }

          if (verifyPassword(portfolioDir, pwd)) {
            const rememberMe = body.rememberMe !== false;
            const token = createSessionToken(rememberMe);
            const maxAge = rememberMe ? (30 * 24 * 3600) : (24 * 3600);
            res.setHeader('Set-Cookie', `pm_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}`);
            return sendJson({ success: true, token });
          } else {
            return sendError('Mot de passe incorrect', 401);
          }
        }

        // A4. POST /api/auth/logout (Déconnexion)
        if (pathname === '/api/auth/logout' && req.method === 'POST') {
          const token = extractToken(req, parsedUrl);
          if (token) revokeSessionToken(token);
          res.setHeader('Set-Cookie', `pm_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict`);
          return sendJson({ success: true });
        }

        // Contrôle d'accès : toutes les autres routes /api/* nécessitent une session valide si mot de passe configuré
        if (pathname.startsWith('/api/') && !isAuthorized(req, parsedUrl, portfolioDir)) {
          return sendError('Authentification requise', 401);
        }

        // A5. POST /api/auth/change-password
        if (pathname === '/api/auth/change-password' && req.method === 'POST') {
          const body = await parseBody();
          const newPwd = body.newPassword ? String(body.newPassword).trim() : '';
          if (!newPwd) {
            return sendError('Le nouveau code ne peut pas être vide.', 400);
          }
          savePassword(portfolioDir, newPwd);
          return sendJson({ success: true, message: 'Code d\'accès mis à jour avec succès.' });
        }

        // A6. POST /api/auth/remove-password ou /api/auth/reset (Désactivation sans blocage)
        if ((pathname === '/api/auth/remove-password' || pathname === '/api/auth/reset') && req.method === 'POST') {
          disablePassword(portfolioDir);
          const token = createSessionToken(true);
          res.setHeader('Set-Cookie', `pm_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${30 * 24 * 3600}`);
          return sendJson({ success: true, token, message: 'Protection désactivée. Accès libre !' });
        }

        // 1. GET /api/status
        if (pathname === '/api/status' && req.method === 'GET') {
          const projects = getAllProjectsData(portfolioDir);
          let totalImages = 0;
          let totalSteps = 0;
          let completedSteps = 0;

          projects.forEach(p => {
            totalImages += (p.imageCount || 0);
            totalSteps += (p.totalSteps || 0);
            completedSteps += (p.completedSteps || 0);
          });

          return sendJson({
            portfolioDir,
            version: VERSION,
            totalProjects: projects.length,
            etudiantCount: projects.filter(p => p.categorie === 'etudiant').length,
            persoCount: projects.filter(p => p.categorie === 'perso').length,
            totalImages,
            totalSteps,
            completedSteps
          });
        }

        // 2. GET /api/constants
        if (pathname === '/api/constants' && req.method === 'GET') {
          return sendJson({
            categories: CATEGORIES,
            tags: AVAILABLE_TAGS,
            competences: AVAILABLE_COMPETENCES
          });
        }

        // 3. GET /api/projects
        if (pathname === '/api/projects' && req.method === 'GET') {
          const projects = getAllProjectsData(portfolioDir);
          return sendJson({ projects });
        }

        // 4. POST /api/projects (Création)
        if (pathname === '/api/projects' && req.method === 'POST') {
          const body = await parseBody();
          const created = createProjectData(portfolioDir, body);
          return sendJson({ success: true, project: created }, 201);
        }

        // 5. GET /api/projects/:category/:slug
        const projectMatch = pathname.match(/^\/api\/projects\/([a-z0-9-]+)\/([a-z0-9-]+)$/);
        if (projectMatch && req.method === 'GET') {
          const [, category, slug] = projectMatch;
          const relPath = `projets/${category}/${slug}/projet.json`;
          const data = loadProject(portfolioDir, relPath);
          if (!data) return sendError('Projet introuvable', 404);
          return sendJson(data);
        }

        // 6. PUT /api/projects/:category/:slug (Mise à jour)
        if (projectMatch && req.method === 'PUT') {
          const [, category, slug] = projectMatch;
          const body = await parseBody();
          const updated = updateProjectData(portfolioDir, category, slug, body);
          return sendJson({ success: true, project: updated });
        }

        // 7. DELETE /api/projects/:category/:slug (Suppression)
        if (projectMatch && req.method === 'DELETE') {
          const [, category, slug] = projectMatch;
          const mode = parsedUrl.searchParams.get('mode') || 'unindex';
          const result = deleteProjectData(portfolioDir, category, slug, mode);
          return sendJson(result);
        }

        // Actions avancées sur les projets
        const projectActionMatch = pathname.match(/^\/api\/projects\/([a-z0-9-]+)\/([a-z0-9-]+)\/([a-z-]+)$/);
        if (projectActionMatch) {
          const [, category, slug, action] = projectActionMatch;

          // 7a. POST /api/projects/:cat/:slug/set-cover
          if (action === 'set-cover' && req.method === 'POST') {
            const body = await parseBody();
            if (!body.imagePath) return sendError('imagePath requis', 400);
            const updated = setProjectCover(portfolioDir, category, slug, body.imagePath);
            return sendJson({ success: true, project: updated });
          }

          // 7b. POST /api/projects/:cat/:slug/reorder-images
          if (action === 'reorder-images' && req.method === 'POST') {
            const body = await parseBody();
            if (!Array.isArray(body.images)) return sendError('Tableau images requis', 400);
            const updated = reorderProjectImages(portfolioDir, category, slug, body.images);
            return sendJson({ success: true, project: updated });
          }

          // 7c. POST /api/projects/:cat/:slug/delete-image
          if (action === 'delete-image' && req.method === 'POST') {
            const body = await parseBody();
            if (!body.imagePath) return sendError('imagePath requis', 400);
            const updated = deleteProjectImageFile(portfolioDir, category, slug, body.imagePath);
            return sendJson({ success: true, project: updated });
          }

          // 7d. POST /api/projects/:cat/:slug/upload-image
          if (action === 'upload-image' && req.method === 'POST') {
            const body = await parseBody();
            if (!body.filename || !body.data) return sendError('filename et data (base64) requis', 400);
            const result = uploadProjectImageFile(portfolioDir, category, slug, body.filename, body.data);
            return sendJson({ success: true, ...result });
          }

          // 7e. POST /api/projects/:cat/:slug/duplicate
          if (action === 'duplicate' && req.method === 'POST') {
            const body = await parseBody();
            const cloned = duplicateProject(portfolioDir, category, slug, body.newTitle, body.newSlug);
            return sendJson({ success: true, project: cloned }, 201);
          }

          // 7f. GET /api/projects/:cat/:slug/markdown
          if (action === 'markdown' && req.method === 'GET') {
            const relPath = `projets/${category}/${slug}/projet.json`;
            const data = loadProject(portfolioDir, relPath);
            if (!data) return sendError('Projet introuvable', 404);
            const markdown = generateProjectMarkdown(data);
            return sendJson({ success: true, markdown });
          }

          // 7g. POST /api/projects/:cat/:slug/open-folder
          if (action === 'open-folder' && req.method === 'POST') {
            const { projetsDir } = getPaths(portfolioDir);
            const targetFolder = path.join(projetsDir, category, slug);
            if (fs.existsSync(targetFolder)) {
              openInExplorer(targetFolder);
              return sendJson({ success: true, opened: targetFolder });
            } else {
              return sendError('Dossier physique inexistant', 404);
            }
          }
        }

        // 8. POST /api/sync (Synchronisation des images)
        if (pathname === '/api/sync' && req.method === 'POST') {
          const targetSlug = parsedUrl.searchParams.get('slug');
          const syncResult = await syncImagesAction(portfolioDir, { silent: true, targetSlug });
          return sendJson({ success: true, ...syncResult });
        }

        // 9. GET /api/audit (Diagnostic de conformité)
        if (pathname === '/api/audit' && req.method === 'GET') {
          const report = await auditAction(portfolioDir, { silent: true, interactive: false });
          return sendJson(report);
        }

        // 10. POST /api/audit/fix (Réparation automatique)
        if (pathname === '/api/audit/fix' && req.method === 'POST') {
          const body = await parseBody();
          const report = await auditAction(portfolioDir, { silent: true, interactive: false });

          if (body.action === 'fix_orphans' && report.orphanFolders.length > 0) {
            const liste = loadListeProjets(portfolioDir);
            const updated = [...new Set([...liste, ...report.orphanFolders])];

            // S'assurer que le fichier projet.json existe bien pour chaque dossier orphelin
            for (const relPath of report.orphanFolders) {
              const fullPath = path.join(portfolioDir, relPath);
              if (!fs.existsSync(fullPath)) {
                const parts = relPath.split('/');
                const cat = parts[1] || 'perso';
                const slug = parts[2] || 'projet';
                const title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                const defaultProject = {
                  slug,
                  titre: title,
                  description: 'Série importée automatiquement.',
                  categorie: cat,
                  status: 'en_cours',
                  tags: ['Photographie'],
                  competences: [],
                  images: [],
                  reflexion: { contexte: '', difficultes: '', reussites: '', apprentissages: '' },
                  etapes: [],
                  lien: null
                };
                saveProject(portfolioDir, relPath, defaultProject);
              }
            }

            saveListeProjets(portfolioDir, updated);
            await syncImagesAction(portfolioDir, { silent: true });
            return sendJson({ success: true, fixed: report.orphanFolders.length });
          }

          if (body.action === 'clean_missing' && report.missingJsonFiles.length > 0) {
            let liste = loadListeProjets(portfolioDir);
            liste = liste.filter(p => !report.missingJsonFiles.includes(p));
            saveListeProjets(portfolioDir, liste);
            return sendJson({ success: true, removed: report.missingJsonFiles.length });
          }

          return sendError('Action d\'auto-réparation invalide ou non applicable');
        }

        // 11. POST /api/switch-portfolio (Changement de dossier actif)
        if (pathname === '/api/switch-portfolio' && req.method === 'POST') {
          const body = await parseBody();
          const cleanInput = body.path ? String(body.path).trim().replace(/^["']|["']$/g, '') : '';
          const targetPath = cleanInput ? path.resolve(cleanInput) : null;

          if (!targetPath || !isValidPortfolioRoot(targetPath)) {
            return sendError('Dossier invalide : json/liste_projets.json et projets/ sont requis.');
          }

          portfolioDir = targetPath;
          if (typeof options.onPortfolioChanged === 'function') {
            options.onPortfolioChanged(portfolioDir);
          }
          return sendJson({ success: true, portfolioDir });
        }

        // 12. POST /api/backup (Sauvegarde manuelle)
        if (pathname === '/api/backup' && req.method === 'POST') {
          const backupFile = createBackup(portfolioDir);
          return sendJson({ success: true, backupFile });
        }

        // 12b. GET /api/backups (Liste des sauvegardes)
        if (pathname === '/api/backups' && req.method === 'GET') {
          const backups = getBackupsList(portfolioDir);
          return sendJson({ success: true, backups });
        }

        // 12c. POST /api/backups/restore (Restauration d'une sauvegarde)
        if (pathname === '/api/backups/restore' && req.method === 'POST') {
          const body = await parseBody();
          if (!body.filename) return sendError('Nom de fichier requis', 400);
          const result = restoreBackupFile(portfolioDir, body.filename);
          return sendJson({ success: true, ...result });
        }

        // 12d. DELETE /api/backups/:filename (Suppression d'une sauvegarde)
        const backupDeleteMatch = pathname.match(/^\/api\/backups\/([a-zA-Z0-9_.-]+)$/);
        if (backupDeleteMatch && req.method === 'DELETE') {
          const [, filename] = backupDeleteMatch;
          const result = deleteBackupFile(portfolioDir, filename);
          return sendJson({ success: true, ...result });
        }

        // 12e. POST /api/open-portfolio-dir (Ouvrir le portfolio dans l'explorateur)
        if (pathname === '/api/open-portfolio-dir' && req.method === 'POST') {
          openInExplorer(portfolioDir);
          return sendJson({ success: true, opened: portfolioDir });
        }

        // 12f. POST /api/open-site (Ouvrir le site du portfolio dans le navigateur)
        if (pathname === '/api/open-site' && req.method === 'POST') {
          const targetSlug = parsedUrl.searchParams.get('slug');
          let targetUrl = '';
          if (targetSlug) {
            targetUrl = path.join(portfolioDir, 'html', 'projet.html') + `?slug=${encodeURIComponent(targetSlug)}`;
          } else {
            targetUrl = path.join(portfolioDir, 'index.html');
          }
          openInDefaultBrowser(targetUrl);
          return sendJson({ success: true, url: targetUrl });
        }

        // 12g. POST /api/build (Exécuter npm run build)
        if (pathname === '/api/build' && req.method === 'POST') {
          const buildResult = await buildPortfolioProject(portfolioDir);
          return sendJson(buildResult);
        }

        // 13. GET /api/image?path=... (Stream d'images locales)
        if (pathname === '/api/image' && req.method === 'GET') {
          const relImgPath = parsedUrl.searchParams.get('path');
          if (!relImgPath) return sendError('Paramètre path manquant', 400);

          const cleanRel = normalizeRelativePath(relImgPath);
          const fullImgPath = path.resolve(portfolioDir, cleanRel);

          // Sécurité anti Path Traversal
          if (!fullImgPath.startsWith(path.resolve(portfolioDir))) {
            return sendError('Accès interdit', 403);
          }

          if (!fs.existsSync(fullImgPath)) {
            return sendError('Image introuvable', 404);
          }

          const ext = path.extname(fullImgPath).toLowerCase();
          const mimeTypes = {
            '.webp': 'image/webp',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.avif': 'image/avif',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml'
          };

          const contentType = mimeTypes[ext] || 'application/octet-stream';
          res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400'
          });

          const stream = fs.createReadStream(fullImgPath);
          stream.pipe(res);
          return;
        }

        // 14. POST /api/shutdown (Fermeture de l'application)
        if (pathname === '/api/shutdown' && req.method === 'POST') {
          sendJson({ success: true, message: 'Arrêt en cours' });
          if (shutdownTimeout) clearTimeout(shutdownTimeout);
          // Délai de grâce de 5 secondes pour distinguer un rafraîchissement d'onglet F5 d'une fermeture réelle
          shutdownTimeout = setTimeout(() => {
            isTerminating = true;
            clearInterval(heartbeatInterval);
            server.close(() => process.exit(0));
          }, 5000);
          return;
        }

        /* ─────────────────────────────────────────────
           FICHIERS STATIQUES FRONTEND
        ───────────────────────────────────────────── */
        const scriptDir = typeof __dirname !== 'undefined' ? __dirname : null;
        const projectRoot = scriptDir ? path.resolve(scriptDir, '..') : process.cwd();
        const uiDir = path.join(projectRoot, 'ui');

        if (pathname === '/' || pathname === '/index.html') {
          let html = '';
          const diskPath = path.join(uiDir, 'index.html');
          if (fs.existsSync(diskPath)) {
            html = fs.readFileSync(diskPath, 'utf-8');
          } else {
            html = EMBEDDED_HTML;
          }
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(html);
          return;
        }

        if (pathname === '/app.css') {
          let css = '';
          const diskPath = path.join(uiDir, 'app.css');
          if (fs.existsSync(diskPath)) {
            css = fs.readFileSync(diskPath, 'utf-8');
          } else {
            css = EMBEDDED_CSS;
          }
          res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
          res.end(css);
          return;
        }

        if (pathname === '/app.js') {
          let js = '';
          const diskPath = path.join(uiDir, 'app.js');
          if (fs.existsSync(diskPath)) {
            js = fs.readFileSync(diskPath, 'utf-8');
          } else {
            js = EMBEDDED_JS;
          }
          res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
          res.end(js);
          return;
        }

        // Fichier non trouvé
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } catch (err) {
        console.error('Erreur serveur interne :', err);
        sendError(err.message || 'Erreur interne', 500);
      }
    });

    const tryListen = (targetPort) => {
      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE' && targetPort !== 0) {
          console.warn(`[Port ${targetPort} déjà occupé, bascule sur un port dynamique...]`);
          server.removeAllListeners('error');
          tryListen(0);
        } else {
          reject(err);
        }
      });

      server.listen(targetPort, '127.0.0.1', () => {
        const actualPort = server.address().port;
        const url = `http://127.0.0.1:${actualPort}`;
        resolve({ server, port: actualPort, url });
      });
    };

    tryListen(port);
  });
}
