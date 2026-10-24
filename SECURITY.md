# Politique de Sécurité — Portfolio Sacha GUITTER

Ce document détaille les engagements de sécurité, les bonnes pratiques de développement et la procédure de divulgation responsable pour le portfolio de **Sacha GUITTER** ainsi que ses outils d'administration associés (`tools/projectmanager`).

---

## 🛡️ Versions Prises en Charge

Seule la dernière version publiée sur la branche principale (`main`) bénéficie d'une maintenance active et de correctifs de sécurité prioritaires.

| Composant | Version Supportée | État |
| :--- | :--- | :--- |
| **Portfolio Web** (`portfolio_v3_web`) | `1.0.x` (branche `main`) | :white_check_mark: Maintenu |
| **Portfolio Project Manager** (`tools/projectmanager`) | `2.3.x` | :white_check_mark: Maintenu |
| Versions antérieures (< 1.0) | Toutes | :x: Non maintenues |

---

## 🔒 Principes et Architecture de Sécurité

### 1. Portfolio Web Statique (Client)
- **Hébergement Statique & Chiffrement TLS** : Le site est hébergé via GitHub Pages avec HTTPS forcé et en-têtes de sécurité stricts.
- **Formulaire Sans Serveur (EmailJS)** :
  - La clé publique (`publicKey`) configurée dans `script/email.config.js` est conçue pour être publique côté client selon la documentation officielle d'EmailJS.
  - La sécurité repose sur la restriction d'origine (*Allowed Origins / Domain Whitelist*) configurée dans le tableau de bord EmailJS (`https://sacez53.github.io` et `http://localhost:5173`).
  - Aucun jeton privé, clé secrète (*Private Key*) ou mot de passe n'est stocké ou transmis par le code front-end.
- **Intégrité des Sous-Ressources (SRI)** : Les bibliothèques externes chargées via CDN (Leaflet.js) intègrent des attributs d'intégrité cryptographique `integrity="sha256-..."` et `crossorigin=""`.
- **Politique de Protection des Données (RGPD)** : Les données saisies dans le formulaire de contact ne sont pas stockées dans une base de données publique et sont exclusivement transmises pour réponse par e-mail direct.

### 2. Outil d'Administration (`ProjectManager Desktop & CLI`)
- **Authentification forte par hachage** : Dérivation de clé native `crypto.scrypt` (64 octets) avec sel cryptographique aléatoire de 16 octets (`crypto.randomBytes`). Le mot de passe n'est jamais conservé en clair.
- **Sessions chiffrées & Cookies sécurisés** : Utilisation de jetons de session cryptographiques aléatoires de 256 bits (`x-pm-token`) et de cookies d'authentification marqués `HttpOnly; SameSite=Strict`.
- **Protection Anti-Traversal** : Résolution et normalisation stricte des chemins de fichiers (`path.resolve`, `path.relative`) pour prévenir toute lecture ou écriture arbitraire en dehors de la racine du portfolio.
- **Exclusion Git** : Le fichier d'authentification `.pm-auth.json` ainsi que tous les fichiers `.auth.json` sont systématiquement exclus du suivi de version via `.gitignore`.
- **Écoute Réseau Locale Exclusive** : Le serveur HTTP intégré se lie exclusivement sur l'interface de bouclage locale `127.0.0.1` (localhost), empêchant tout accès réseau distant non sollicité.

---

## 🚨 Signalement d'une Vulnérabilité

Si vous identifiez une vulnérabilité de sécurité, une fuite involontaire d'identifiant ou une faiblesse technique :

1. **Ne créez pas d'issue ou de discussion publique** sur GitHub afin de protéger les utilisateurs et l'infrastructure.
2. **Contactez directement le responsable** par courrier électronique :
   - 📧 **Email** : [sachaguitterphoto@gmail.com](mailto:sachaguitterphoto@gmail.com)
   - 💬 **Objet** : `[SÉCURITÉ] Signalement de vulnérabilité - Portfolio v3`
3. **Fournissez un descriptif précis comprenant :**
   - La nature de la faille identifiée (ex. injection, problème de contrôle d'accès, fuite de secret).
   - Les étapes détaillées permettant de reproduire l'anomalie (*Proof of Concept*).
   - L'environnement ou navigateur testé.
   - Les préconisations ou correctifs suggérés (si disponibles).

### Délais de Prise en Charge & Résolution

- **Accusé de réception** : Sous 24 à 48 heures ouvrées.
- **Évaluation et confirmation** : Sous 72 heures après réception du signalement complet.
- **Déploiement du correctif** : Dès validation, publication d'un commit correctif sur `main` et notification de la personne à l'origine du signalement.

---

## ⚠️ Pratiques Prohibées

Il est strictement interdit de :
- Tenter d'interrompre ou de dégrader le service (attaques DoS / DDoS sur le site ou les endpoints tiers).
- Exploiter une vulnérabilité à des fins malveillantes ou pour exfiltrer des données personnelles.
- Accéder sans autorisation aux comptes de messagerie ou aux services associés.

Merci pour votre aide précieuse dans le maintien de la sécurité et de la fiabilité de ce portfolio !
