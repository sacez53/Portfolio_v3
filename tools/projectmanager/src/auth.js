import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

/**
 * Module d'authentification et de sécurité pour Portfolio Project Manager
 * Stocke le hachage sécurisé (scrypt + sel aléatoire) dans .pm-auth.json
 */

const SESSIONS = new Map(); // token -> { createdAt, expiresAt, lastUsedAt }
const DEFAULT_SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 jours max

/**
 * Résout le chemin absolu du fichier de configuration d'authentification
 * @param {string|null} portfolioDir 
 * @returns {string}
 */
export function getAuthFilePath(portfolioDir = null) {
  if (portfolioDir) {
    const candidate = path.join(portfolioDir, '.pm-auth.json');
    if (fs.existsSync(candidate)) return candidate;
    const candidateSub = path.join(portfolioDir, 'tools', 'projectmanager', '.pm-auth.json');
    if (fs.existsSync(candidateSub)) return candidateSub;
  }
  const rootCandidate = path.resolve('.pm-auth.json');
  if (fs.existsSync(rootCandidate)) return rootCandidate;

  const toolsCandidate = path.resolve('tools', 'projectmanager', '.pm-auth.json');
  if (fs.existsSync(toolsCandidate)) return toolsCandidate;

  return portfolioDir ? path.join(portfolioDir, '.pm-auth.json') : rootCandidate;
}

/**
 * Récupère la configuration d'authentification active
 * @param {string|null} portfolioDir 
 * @returns {{ enabled: boolean, password?: string, salt?: string, hash?: string, updatedAt?: string }}
 */
export function getAuthConfig(portfolioDir = null) {
  try {
    const filePath = getAuthFilePath(portfolioDir);
    if (!fs.existsSync(filePath)) {
      return { enabled: false };
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    if (!data || data.enabled === false) {
      return { enabled: false };
    }

    // 1. Mot de passe en clair / modifiable directement dans le fichier
    if (typeof data.password === 'string' && data.password.trim().length > 0) {
      return {
        enabled: true,
        password: data.password.trim(),
        updatedAt: data.updatedAt || null
      };
    }

    // 2. Rétro-compatibilité avec le hash scrypt
    if (data.salt && data.hash) {
      return {
        enabled: true,
        salt: data.salt,
        hash: data.hash,
        updatedAt: data.updatedAt || null
      };
    }
  } catch (err) {
    console.error('Erreur de lecture du fichier auth :', err.message);
  }
  return { enabled: false };
}

/**
 * Indique si un mot de passe est actuellement configuré et actif
 * @param {string|null} portfolioDir 
 * @returns {boolean}
 */
export function isPasswordSet(portfolioDir = null) {
  return getAuthConfig(portfolioDir).enabled === true;
}

/**
 * Calcule un hachage scrypt (conservé pour rétro-compatibilité)
 * @param {string} password 
 * @param {string|null} salt 
 * @returns {{ salt: string, hash: string }}
 */
export function hashPassword(password, salt = null) {
  const finalSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, finalSalt, 64).toString('hex');
  return { salt: finalSalt, hash };
}

/**
 * Vérifie si le mot de passe fourni correspond au mot de passe enregistré
 * @param {string|null} portfolioDir 
 * @param {string} password 
 * @returns {boolean}
 */
export function verifyPassword(portfolioDir, password) {
  const config = getAuthConfig(portfolioDir);
  if (!config.enabled) {
    return true; // Aucun mot de passe configuré
  }
  if (!password || typeof password !== 'string') {
    return false;
  }

  // 1. Vérification directe du mot de passe modifiable en fichier
  if (typeof config.password === 'string') {
    return password.trim() === config.password;
  }

  // 2. Vérification par hash sécurisé si présent
  if (config.salt && config.hash) {
    try {
      const computedHash = crypto.scryptSync(password, config.salt, 64).toString('hex');
      const computedBuf = Buffer.from(computedHash, 'hex');
      const targetBuf = Buffer.from(config.hash, 'hex');
      if (computedBuf.length !== targetBuf.length) return false;
      return crypto.timingSafeEqual(computedBuf, targetBuf);
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Enregistre ou met à jour le mot de passe de protection
 * Écrit le mot de passe en clair dans .pm-auth.json pour être modifiable directement
 * @param {string|null} portfolioDir 
 * @param {string} newPassword 
 * @returns {boolean}
 */
export function savePassword(portfolioDir, newPassword) {
  if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 1) {
    throw new Error('Veuillez renseigner un code d\'accès ou mot de passe.');
  }
  const cleanPassword = newPassword.trim();
  const targetPath = getAuthFilePath(portfolioDir);

  const payload = {
    enabled: true,
    password: cleanPassword,
    comment: "Mot de passe modifiable directement dans ce fichier. Laissez vide ou enabled: false pour accès libre.",
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(targetPath, JSON.stringify(payload, null, 2), 'utf-8');
  return true;
}

/**
 * Désactive la protection par mot de passe
 * @param {string|null} portfolioDir 
 * @returns {boolean}
 */
export function disablePassword(portfolioDir) {
  const filePath = getAuthFilePath(portfolioDir);
  try {
    const payload = {
      enabled: false,
      password: "",
      comment: "Mot de passe désactivé. Modifiez le mot de passe et passez enabled: true pour réactiver.",
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erreur désactivation mot de passe :', err.message);
  }
  // Révoquer toutes les sessions
  SESSIONS.clear();
  return true;
}

/**
 * Crée un jeton de session sécurisé
 * @param {boolean} rememberMe 
 * @returns {string}
 */
export function createSessionToken(rememberMe = true) {
  const token = crypto.randomBytes(32).toString('hex');
  const duration = rememberMe ? DEFAULT_SESSION_DURATION : (24 * 60 * 60 * 1000);
  const now = Date.now();
  SESSIONS.set(token, {
    createdAt: now,
    expiresAt: now + duration,
    lastUsedAt: now
  });
  return token;
}

/**
 * Valide un jeton de session
 * @param {string} token 
 * @returns {boolean}
 */
export function validateSessionToken(token) {
  if (!token || typeof token !== 'string') return false;
  const session = SESSIONS.get(token);
  if (!session) return false;
  if (Date.now() > session.expiresAt) {
    SESSIONS.delete(token);
    return false;
  }
  session.lastUsedAt = Date.now();
  return true;
}

/**
 * Détruit un jeton de session
 * @param {string} token 
 */
export function revokeSessionToken(token) {
  if (token) {
    SESSIONS.delete(token);
  }
}

/**
 * Parse les cookies HTTP
 * @param {import('node:http').IncomingMessage} req 
 * @returns {Record<string, string>}
 */
export function parseCookies(req) {
  const list = {};
  const header = req.headers && req.headers.cookie;
  if (header) {
    header.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      const name = (parts[0] || '').trim();
      if (name) {
        list[name] = decodeURIComponent((parts.slice(1).join('=') || '').trim());
      }
    });
  }
  return list;
}

/**
 * Extrait le jeton d'authentification depuis la requête HTTP
 * @param {import('node:http').IncomingMessage} req 
 * @param {URL} parsedUrl 
 * @returns {string|null}
 */
export function extractToken(req, parsedUrl) {
  // 1. Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  // 2. Custom header x-pm-token
  if (req.headers['x-pm-token']) {
    return String(req.headers['x-pm-token']).trim();
  }

  // 3. Cookie pm_token
  const cookies = parseCookies(req);
  if (cookies['pm_token']) {
    return cookies['pm_token'].trim();
  }

  // 4. Query param ?token=...
  if (parsedUrl && parsedUrl.searchParams && parsedUrl.searchParams.has('token')) {
    return parsedUrl.searchParams.get('token').trim();
  }

  return null;
}

/**
 * Vérifie si la requête entrante est autorisée
 * @param {import('node:http').IncomingMessage} req 
 * @param {URL} parsedUrl 
 * @param {string|null} portfolioDir 
 * @returns {boolean}
 */
export function isAuthorized(req, parsedUrl, portfolioDir) {
  if (!isPasswordSet(portfolioDir)) {
    return true; // Pas de mot de passe requis
  }
  const token = extractToken(req, parsedUrl);
  return validateSessionToken(token);
}
