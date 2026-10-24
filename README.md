<div align="center">

# 📷 Sacha GUITTER — Portfolio Photographie & Direction Artistique

### *Une expérience web éditoriale pensée comme une revue photographique grand format.*

[![Site en ligne](https://img.shields.io/badge/Site_en_ligne-GitHub_Pages-2ea44f?style=for-the-badge&logo=githubpages&logoColor=white)](https://sacez53.github.io/Portfolio_v3/)
[![Dépôt GitHub](https://img.shields.io/badge/GitHub-sacez53%2FPortfolio__v3-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sacez53/Portfolio_v3)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/fr/docs/Web/JavaScript)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/Licence-MIT_%26_Copyright-000000?style=for-the-badge)](./LICENSE)

[🌐 Consulter le Portfolio](https://sacez53.github.io/Portfolio_v3/) • [🎨 Direction Artistique](https://sacez53.github.io/Portfolio_v3/da.html) • [📬 Me Contacter](https://sacez53.github.io/Portfolio_v3/#chapitre-5)

---

</div>

## 📖 Sommaire

- [🌟 À Propos](#-à-propos)
- [📑 Aperçu Visuel & Chapitres](#-aperçu-visuel--chapitres)
- [✨ Fonctionnalités Clés](#-fonctionnalités-clés)
- [🛠️ Stack Technique](#-stack-technique)
- [📁 Arborescence du Projet](#-arborescence-du-projet)
- [🚀 Installation & Démarrage](#-installation--démarrage)
- [⚙️ Configuration](#-configuration)
- [🧰 Outils d'Administration (`ProjectManager v2.3`)](#-outils-dadministration-projectmanager-v23)
- [🌐 Déploiement sur GitHub Pages & CI/CD](#-déploiement-sur-github-pages--cicd)
- [♿ Accessibilité & SEO](#-accessibilité--seo)
- [👤 Auteur & Réseaux](#-auteur--réseaux)
- [📄 Licence & Droits d'Auteur](#-licence--droits-dauteur)

---

## 🌟 À Propos

Ce projet représente la version 3 du portfolio officiel de **Sacha GUITTER**, photographe et étudiant en **BUT MMI** (Métiers du Multimédia et de l'Internet) à l'IUT de Laval.

Conçu comme une publication papier haut de gamme transposée au format numérique, ce site rompt avec les portfolios génériques en adoptant :
- Une **grille suisse / éditoriale** rigoureuse, asymétrique et contrastée.
- La puissance typographique de la fonte variable locale **Special Gothic**.
- Une hiérarchie d'information structurée en **5 chapitres thématiques**.
- Une approche de développement **Vanilla pure** optimisée pour la vitesse (images WebP, lazy loading, zéro framework CSS superflu, score Lighthouse élevé).

---

## 📑 Aperçu Visuel & Chapitres

Le portfolio s'articule autour d'un parcours fluide et immersif :

| Chapitre | Intitulé | Description |
| :--- | :--- | :--- |
| **01** | **À Propos** | Genèse, démarche artistique, formation BUT MMI à Laval et immersion de terrain. |
| **02** | **Photos** | Galeries animalières (chevreuils, passereaux), portraits naturels/studio, et reportages concerts/spectacles. |
| **03** | **Arts & Print** | Affiches typographiques, tirages grand format, compositions graphiques et travail vectoriel. |
| **04** | **MMI & 3D** | Travaux académiques : modélisation 3D Blender (TyzTea), régie Twitch, hommage à Dorothea Lange, couverture BDE. |
| **05** | **Merci & Contact** | Formulaire de prise de contact direct sans serveur (EmailJS) et cartographie interactive des spots de prise de vue. |
| **DA** | **Direction Artistique** | Page dédiée (`da.html`) exposant le manifeste typographique, les contrastes, la grille et les design tokens. |

---

## ✨ Fonctionnalités Clés

### 🎨 1. Système de Design Tokens & Rigueur Monochrome
- Variables CSS normalisées (`style/design-tokens.css`) garantissant l'harmonie des contrastes, marges et filets noirs nets (`border: 1px solid #000000`).
- Typographie monumentale **Special Gothic** (Regular, Medium, SemiBold, Bold, Expanded) conférant un impact d'imprimerie suisse.
- Respect absolu des angles droits (`--radius-none: 0px`).

### 🖼️ 2. Architecture Modulaire des Projets (`html/projet.html`)
- Chaque projet possède son propre sous-dossier dans `projets/<categorie>/<slug>/` contenant son fichier `projet.json` et ses clichés WebP.
- Rendu dynamique piloté par l'URL (`?slug=nom-du-projet`) avec carnet technique, analyse réflexive académique et galerie responsive.

### 🗺️ 3. Cartographie Interactive des Prises de Vue (Leaflet.js)
- Carte OpenStreetMap personnalisée avec filtre CSS monochrome mettant en valeur les zones de création (Laval, Sablé-sur-Sarthe et bocages de l'Ouest).

### 📬 4. Formulaire de Contact Sans Serveur (EmailJS)
- Expédition directe des messages depuis le navigateur client sans infrastructure backend PHP.
- Validation des champs en temps réel, retour visuel et modèles d'e-mails professionnels (notification administrateur et accusé de réception visiteur) stockés dans `modeles_mails/`.

### 🖱️ 5. Micro-Interactions & Navigation Fluide
- Moteur de défilement doux calibré en `easeInOutCubic` (`script/scroll.js`), animations d'apparition progressives (`.reveal`) et menu tiroir mobile responsive.

---

## 🛠️ Stack Technique

<div align="center">

| Domaine | Outil / Librairie | Utilisation |
| :--- | :--- | :--- |
| **Bundler & Outillage** | [Vite 5](https://vitejs.dev/) | Compilation multi-pages, serveur HMR, synchronisation statique |
| **Balisage** | [HTML5 Sémantique](https://developer.mozilla.org/fr/docs/Web/HTML) | Balisage ARIA, skip links d'évitement, conformité W3C |
| **Feuilles de Styles** | [CSS3 Vanilla / Tokens](https://developer.mozilla.org/fr/docs/Web/CSS) | Flexbox, CSS Grid, Custom Properties, Responsive design |
| **Moteur Script** | [JavaScript ES6+](https://developer.mozilla.org/fr/docs/Web/JavaScript) | Chargement asynchrone des projets, interactions DOM |
| **Cartographie** | [Leaflet.js 1.9.4](https://leafletjs.com/) | Affichage de la carte géographique interactive avec filtre monochrome |
| **Service de Messagerie** | [EmailJS SDK v4](https://www.emailjs.com/) | Expédition des messages de contact sans serveur backend |
| **Hébergement** | [GitHub Pages](https://pages.github.com/) | Hébergement statique sécurisé haute performance |
| **CI / CD** | [GitHub Actions](https://github.com/features/actions) | Validation continue des PRs et déploiement automatisé sur `main` |

</div>

---

## 📁 Arborescence du Projet

```text
portfolio_v3_web/
├── .agents/                      # Directives et skills de procédures pour agents IA
│   └── skills/
│       ├── portfolio-workflow/   # Cycle de dev, build Vite et checklists de vérification
│       └── portfolio-project-manager/ # Guide de gestion des projets modulaires
│
├── .github/                      # Configuration GitHub, templates et intégration continue
│   ├── ISSUE_TEMPLATE/           # Modèles standardisés pour bugs et suggestions
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── config.yml
│   ├── workflows/
│   │   ├── ci.yml                # Validation automatique des PRs (build test)
│   │   └── deploy.yml            # Déploiement continu automatisé sur GitHub Pages
│   └── PULL_REQUEST_TEMPLATE.md  # Modèle standardisé de PR avec checklist qualité
│
├── dist/                         # Dossier compilé pour la production (généré par Vite)
├── fonts/                        # Polices Special Gothic (Variable Font et graisses statiques)
│
├── html/                         # Pages HTML secondaires
│   ├── mentions-legales.html     # Mentions légales obligatoires conformes RGPD
│   ├── politique-confidentialite.html # Politique de gestion des données personnelles
│   └── projet.html               # Planche éditoriale dynamique de projet (?slug=...)
│
├── image/                        # Médias globaux, icônes et visuels de couverture
│   ├── edito/                    # Portraits et photos de contexte éditorial
│   ├── ico/                      # Favicon mésange
│   └── titre/                    # Couverture d'en-tête (sacha_cover.webp)
│
├── json/                         # Données dynamiques du site
│   ├── backups/                  # Instantanés horodatés de sécurité (gérés par ProjectManager)
│   ├── infos.json                # Coordonnées, réseaux sociaux et métadonnées de contact
│   └── liste_projets.json        # Index ordonné des chemins vers les fiches projets
│
├── modeles_mails/                # Modèles de courriels préformatés pour EmailJS
│   ├── confirmation_pour_visiteur.html
│   └── notification_pour_sacha.html
│
├── pdf/                          # Documents PDF téléchargeables (CV, plaquette)
│   └── cv-sacha-guitter.pdf
│
├── projets/                      # Répertoires modulaires des réalisations
│   ├── etudiant/                 # Projets académiques BUT MMI (Blender, Dorothea Lange...)
│   └── perso/                    # Séries photographiques (Animalier, Portrait, Concert...)
│
├── script/                       # Scripts JavaScript ES6+ Vanilla
│   ├── carte.js                  # Initialisation et configuration monochrome Leaflet
│   ├── contact.js                # Validation et expédition EmailJS
│   ├── cursor.js                 # Curseur personnalisé optionnel
│   ├── email.config.js           # Configuration publique du service EmailJS
│   ├── infos.js                  # Hydratation dynamique des coordonnées
│   ├── modal-projets.js          # Visionneuse et navigation modale
│   ├── nav.js                    # Menu mobile tiroir et navigation fixe
│   ├── projets.js                # Hydratation dynamique des galeries et fiches
│   └── scroll.js                 # Défilement fluide (easeInOutCubic) et animations .reveal
│
├── style/                        # Feuilles de styles CSS3
│   ├── design-tokens.css         # Variables racines (couleurs, polices, bordures, marges)
│   ├── fonts.css                 # Déclarations @font-face pour Special Gothic
│   └── style.css                 # Feuille de style principale et responsive
│
├── tools/                        # Outils d'administration et maintenance
│   └── projectmanager/           # Application de bureau Desktop GUI & CLI (Node SEA)
│       ├── build.ps1             # Script de compilation du binaire Windows autonome
│       ├── index.js              # Point d'entrée serveur local et CLI
│       ├── ui/                   # Interface graphique SPA de l'administrateur
│       └── README.md             # Documentation complète de ProjectManager
│
├── .gitignore                    # Fichiers exclus du suivi de version Git
├── .nojekyll                     # Désactivation du moteur Jekyll pour GitHub Pages
├── admin.cmd                     # Lanceur rapide Windows (double-clic) pour ProjectManager
├── CODE_OF_CONDUCT.md            # Charte de conduite communautaire (Contributor Covenant 2.1)
├── CONTRIBUTING.md               # Guide complet de contribution au projet
├── da.html                       # Manifeste et présentation de la Direction Artistique
├── GEMINI.md                     # Directives et contexte projet pour l'assistance IA
├── index.html                    # Page principale du portfolio (Hero, Chapitres 1 à 5)
├── LICENSE                       # Licence open-source MIT du code
├── package.json                  # Dépendances Node.js et commandes npm
├── README.md                     # Documentation officielle du projet
├── robots.txt                    # Directives SEO pour les robots d'indexation
├── SECURITY.md                   # Politique de sécurité et signalement responsable
├── sitemap.xml                   # Plan du site XML pour le référencement naturel
└── vite.config.js                # Configuration de compilation multi-pages Vite
```

---

## 🚀 Installation & Démarrage

### Prérequis
- [Node.js](https://nodejs.org/) version **18.0.0 ou supérieure** (LTS recommandé)
- [npm](https://www.npmjs.com/) ou gestionnaire compatible

### 1. Cloner le dépôt
```bash
git clone https://github.com/sacez53/Portfolio_v3.git
cd Portfolio_v3
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Lancer l'environnement de développement
```bash
npm run dev
```
> Le site est disponible sur `http://localhost:5173/` avec rafraîchissement à chaud instantané (HMR).

### 4. Compiler pour la production
```bash
npm run build
```
> Les fichiers optimisés et les actifs statiques sont synchronisés dans le dossier `dist/`.

### 5. Prévisualiser le build localement
```bash
npm run preview
```

---

## ⚙️ Configuration

### ✉️ Service de messagerie (EmailJS)
Pour connecter le formulaire de contact à vos propres identifiants EmailJS :
1. Créez un compte sur [EmailJS](https://www.emailjs.com/).
2. Éditez le fichier [`script/email.config.js`](./script/email.config.js) :
```javascript
window.EMAILJS_CONFIG = {
    publicKey:           'VOTRE_PUBLIC_KEY',
    serviceId:           'VOTRE_SERVICE_ID',
    templateId:          'VOTRE_TEMPLATE_ID_NOTIFICATION',
    templateAutoReplyId: 'VOTRE_TEMPLATE_ID_ACCUSE'
};
```

### 📝 Coordonnées et réseaux sociaux
Pour actualiser votre numéro, email ou liens sociaux, modifiez directement [`json/infos.json`](./json/infos.json) :
```json
{
  "email": "sachaguitterphoto@gmail.com",
  "phone": "+33 7 49 61 09 90",
  "location": "Laval — Sablé-sur-Sarthe",
  "socials": {
    "linkedin": "https://www.linkedin.com/in/sachaguitter",
    "instagram": "https://instagram.com/sacha.guitter.photo",
    "kardeme": "https://karde.me/sachaguitterphoto/"
  }
}
```

---

## 🧰 Outils d'Administration (`ProjectManager v2.3`)

Le portfolio inclut une application d'administration moderne avec **Interface Graphique (Desktop GUI)** et mode CLI pour gérer les projets sans manipuler manuellement de code :

- **Lancement instantané** : double-cliquez sur `admin.cmd` ou exécutez `tools/projectmanager.exe`.
- **Protection par mot de passe** : hachage cryptographique fort `scrypt` avec sel aléatoire, sessions sécurisées et cadenas de verrouillage.
- **Gestionnaire de galeries interactif** : réorganisation de l'ordre des clichés (`◀` / `▶`), désignation de l'image de couverture (`⭐ Couv.`), téléversement par Drag & Drop.
- **Export Markdown MMI** : génération en 1 clic de fiches carnet de bord prêtes pour les soutenances et rapports de BUT MMI.
- **Auto-diagnostic & Intégrité** : audit des dossiers orphelins, détection des erreurs 404 et réparations automatiques.
- **Sauvegardes automatiques** : historisation de `liste_projets.json` dans `json/backups/` avant chaque opération.

Consultez la [documentation complète de ProjectManager](./tools/projectmanager/README.md).

---

## 🌐 Déploiement sur GitHub Pages & CI/CD

Le projet intègre un pipeline CI/CD automatisé via **GitHub Actions** :

1. **Validation Continue ([`.github/workflows/ci.yml`](./.github/workflows/ci.yml))** :
   À chaque Pull Request, les dépendances sont installées et le build Vite est validé pour prévenir toute régression.
2. **Déploiement Continu ([`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml))** :
   À chaque commit poussé sur la branche `main`, le portfolio est automatiquement compilé et déployé sur GitHub Pages à l'adresse :
   [https://sacez53.github.io/Portfolio_v3/](https://sacez53.github.io/Portfolio_v3/)

---

## ♿ Accessibilité & SEO

- **Sémantique soignée** : Balisage strict (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
- **Lien d'évitement (*Skip Link*)** : Permet aux utilisateurs naviguant au clavier ou avec un lecteur d'écran d'accéder immédiatement au contenu principal.
- **Performances multimédia** : Images compressées au format moderne **WebP**, dimensions explicitées (`width` et `height`) pour éviter tout saut de mise en page (*Cumulative Layout Shift*).
- **Référencement naturel (SEO)** :
  - Métadonnées Open Graph et Twitter Cards configurées pour le partage sur les réseaux.
  - Plan de site [`sitemap.xml`](./sitemap.xml) recensant l'intégralité des 13 fiches projets et pages légales.
  - Fichier [`robots.txt`](./robots.txt) optimisé autorisant l'exploration des pages et protégeant les dossiers privés.

---

## 👤 Auteur & Réseaux

**Sacha GUITTER** — Photographe d'Auteur & Créatif Digital (Étudiant en BUT MMI à Laval)

- 📸 **Instagram :** [@sacha.guitter.photo](https://instagram.com/sacha.guitter.photo)
- 💼 **LinkedIn :** [Sacha Guitter](https://www.linkedin.com/in/sachaguitter)
- 📇 **Karde :** [sachaguitterphoto](https://karde.me/sachaguitterphoto/)
- 📧 **Email :** [sachaguitterphoto@gmail.com](mailto:sachaguitterphoto@gmail.com)

---

## 📄 Licence & Droits d'Auteur

- **Code Source** : Distribué sous licence **MIT**. Vous êtes libre de vous inspirer de l'architecture technique et du code. Voir le fichier [LICENSE](./LICENSE).
- **Photographies, Visuels & Identité Artistique** : **Tous droits réservés (Copyright © 2026 Sacha GUITTER)**. Les photographies d'animaux, de portraits, d'événements ainsi que les éléments graphiques personnels ne sont pas libres de droit et ne peuvent être réutilisés sans autorisation écrite explicite.
