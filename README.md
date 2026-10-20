<div align="center">

# 📷 Sacha GUITTER — Portfolio Photographie & Direction Artistique

### *Une expérience web éditoriale pensée comme une revue photographique grand format.*

[![Site en ligne](https://img.shields.io/badge/Site_en_ligne-GitHub_Pages-2ea44f?style=for-the-badge&logo=githubpages&logoColor=white)](https://sachaguitter.github.io/portfolio_v3/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/fr/docs/Web/JavaScript)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/Licence-MIT_%26_Copyright-000000?style=for-the-badge)](./LICENSE)

[🌐 Consulter le Portfolio](https://sachaguitter.github.io/portfolio_v3/) • [🎨 Direction Artistique](https://sachaguitter.github.io/portfolio_v3/da.html) • [📬 Me Contacter](https://sachaguitter.github.io/portfolio_v3/#chapitre-5)

---

</div>

## 📖 Sommaire

- [À Propos](#-à-propos)
- [Aperçu Visuel & Chapitres](#-aperçu-visuel--chapitres)
- [Fonctionnalités Clés](#-fonctionnalités-clés)
- [Stack Technique](#-stack-technique)
- [Arborescence du Projet](#-arborescence-du-projet)
- [Installation & Démarrage](#-installation--démarrage)
- [Configuration](#-configuration)
- [Déploiement sur GitHub Pages](#-déploiement-sur-github-pages)
- [Accessibilité & SEO](#-accessibilité--seo)
- [Auteur & Réseaux](#-auteur--réseaux)
- [Licence & Droits d'Auteur](#-licence--droits-dauteur)

---

## 🌟 À Propos

Ce projet représente la version 3 du portfolio officiel de **Sacha GUITTER**, photographe et étudiant en **BUT MMI** (Métiers du Multimédia et de l'Internet) à l'IUT de Laval.

Conçu comme une publication papier haut de gamme transposée au format numérique, ce site rompt avec les portfolios de photographie génériques en adoptant :
- Une **grille suisse / éditoriale** rigoureuse et asymétrique.
- La puissance typographique de la fonte variable **Special Gothic**.
- Une hiérarchie d'information structurée en **5 chapitres thématiques**.
- Une intégration poussée de performances web (formats modernes WebP, lazy loading, zéro framework lourd, score Lighthouse optimisé).

---

## 📑 Aperçu Visuel & Chapitres

Le portfolio s'articule autour d'un parcours fluide et immersif :

| Chapitre | Intitulé | Description |
| :--- | :--- | :--- |
| **01** | **À Propos** | Genèse, vision artistique, parcours étudiant en BUT MMI et portrait de terrain. |
| **02** | **Photos** | Galeries animalières, portraits studio/naturel, et reportages événementiels (concerts, galas). |
| **03** | **Arts & Print** | Affiches graphiques, travail typographique, tirages d'art et créations vectorielles. |
| **04** | **MMI & 3D** | Travaux universitaires : modélisation 3D Blender, régie Twitch, hommage à Dorothea Lange, BDE. |
| **05** | **Merci & Contact** | Formulaire de prise de contact direct (EmailJS) et carte interactive des spots de shooting. |
| **DA** | **Direction Artistique** | Page dédiée (`da.html`) détaillant la charte typographique, les couleurs et les tokens CSS. |

---

## ✨ Fonctionnalités Clés

### 🎨 1. Direction Artistique & Système de Design Tokens
- Utilisation de variables CSS normalisées (`style/design-tokens.css`) pour une cohérence chromatique et d'espacement.
- Typographie **Special Gothic** (Regular, Medium, SemiBold, Bold, Expanded) pour des titrages d'impact rappelant les couvertures de magazines.

### 🖼️ 2. Fiches Projets Modulaires (`html/projet.html`)
- Chaque projet dispose d'une fiche complète et dynamique chargée via son slug d'URL (`?slug=nom-du-projet`).
- Contenus et métadonnées centralisés dans des fichiers JSON modulaires (`projets/.../projet.json`).

### 🗺️ 3. Cartographie Interactive des Prises de Vue (Leaflet.js)
- Carte OpenStreetMap stylisée intégrant les coordonnées et repères géographiques des prises de vue (Laval, Sablé-sur-Sarthe, etc.).

### 📬 4. Formulaire de Contact Sans Serveur (EmailJS)
- Transmission instantanée des messages depuis le client sans nécessiter d'infrastructure backend PHP complexe.
- Validation des champs en temps réel, retour visuel à l'envoi et modèles d'emails professionnels (notification admin et confirmation au visiteur) stockés dans `modeles_mails/`.

### 🖱️ 5. Micro-Interactions & Curseur Magnétique
- Curseur sur-mesure (`script/cursor.js`) s'adaptant à l'élément survolé (liens, images, boutons interactifs).
- Défilement fluide, barre de progression de lecture et menu burger animé pour les écrans mobiles.

---

## 🛠️ Stack Technique

<div align="center">

| Domaine | Outil / Librairie | Utilisation |
| :--- | :--- | :--- |
| **Bundler & Outillage** | [Vite 5](https://vitejs.dev/) | Compilation rapide, serveur de dev HMR, copie d'actifs statiques |
| **Structure** | [HTML5 Sémantique](https://developer.mozilla.org/fr/docs/Web/HTML) | Balisage ARIA, skip links, respect des standards W3C |
| **Styles** | [CSS3 Vanilla / Tokens](https://developer.mozilla.org/fr/docs/Web/CSS) | Flexbox, CSS Grid, Custom Properties, Responsive design |
| **Dynamisme** | [JavaScript ES6+](https://developer.mozilla.org/fr/docs/Web/JavaScript) | Chargement asynchrone des projets, interactions DOM |
| **Cartographie** | [Leaflet.js 1.9.4](https://leafletjs.com/) | Affichage de la carte géographique interactive |
| **Service Email** | [EmailJS SDK v4](https://www.emailjs.com/) | Gestion des messages de contact sans serveur backend |
| **Hébergement** | [GitHub Pages](https://pages.github.com/) | Hébergement statique haute disponibilité |
| **CI/CD** | [GitHub Actions](https://github.com/features/actions) | Déploiement continu automatisé à chaque push sur `main` |

</div>

---

## 📁 Arborescence du Projet

```text
portfolio_v3_web/
├── .github/                      # Workflows d'automatisation et templates GitHub
│   ├── ISSUE_TEMPLATE/           # Modèles de tickets (bug, feature request)
│   ├── workflows/
│   │   └── deploy.yml            # CI/CD GitHub Actions pour GitHub Pages
│   └── PULL_REQUEST_TEMPLATE.md  # Modèle standardisé pour les PRs
│
├── dist/                         # Dossier généré pour la production (ignoré par Git)
├── fonts/                        # Polices de caractères locales (Special Gothic)
│
├── html/                         # Pages secondaires
│   ├── mentions-legales.html     # Mentions légales obligatoires
│   ├── politique-confidentialite.html # Politique de gestion des données personnelles
│   └── projet.html               # Planche de présentation dynamique de projet
│
├── image/                        # Médias globaux, icônes et visuels de couverture
│   ├── ico/                      # Favicons et mascottes (mésange)
│   ├── svg/                      # Pictogrammes vectoriels
│   └── titre/                    # Images de headers et couvertures
│
├── json/                         # Données dynamiques
│   ├── infos.json                # Coordonnées, réseaux et textes de contact
│   └── liste_projets.json        # Index des chemins vers les fiches projets
│
├── modeles_mails/                # Modèles HTML préformatés pour EmailJS
│   ├── notification_pour_sacha.html
│   └── confirmation_pour_visiteur.html
│
├── projets/                      # Dossiers des projets (photos, descriptifs, métadonnées)
│   ├── etudiant/                 # Projets académiques BUT MMI (Blender, Dorothea Lange...)
│   └── perso/                    # Séries photographiques personnelles (Animalier, Portrait...)
│
├── script/                       # Scripts JavaScript modulaires
│   ├── carte.js                  # Initialisation et configuration Leaflet
│   ├── contact.js                # Validation et soumission formulaire EmailJS
│   ├── cursor.js                 # Effet de curseur interactif
│   ├── email.config.js           # Identifiants de connexion EmailJS
│   ├── infos.js                  # Injection dynamique des coordonnées
│   ├── nav.js                    # Menu mobile et barre de navigation
│   ├── projets.js                # Chargement dynamique des galeries et fiches
│   └── scroll.js                 # Smooth scroll et indicateurs de lecture
│
├── style/                        # Feuilles de styles CSS
│   ├── design-tokens.css         # Variables de couleurs, typographies et marges
│   ├── fonts.css                 # Déclarations @font-face
│   └── style.css                 # Feuille de style globale du site
│
├── .gitignore                    # Fichiers exclus du suivi de version
├── .nojekyll                     # Désactivation du moteur Jekyll sur GitHub Pages
├── CODE_OF_CONDUCT.md            # Charte de conduite communautaire
├── CONTRIBUTING.md               # Guide pour contribuer au projet
├── da.html                       # Manifeste et présentation de la Direction Artistique
├── index.html                    # Page principale du portfolio
├── LICENSE                       # Licence du code et clause de copyright média
├── package.json                  # Dépendances Node.js et commandes npm
├── README.md                     # Documentation officielle du projet
├── robots.txt                    # Directives pour les robots d'indexation
├── SECURITY.md                   # Politique de sécurité et signalement de failles
├── sitemap.xml                   # Plan du site pour l'indexation SEO
└── vite.config.js                # Configuration de compilation et copie des assets
```

---

## 🚀 Installation & Démarrage

### Prérequis
- [Node.js](https://nodejs.org/) version **18.0.0 ou supérieure**
- [npm](https://www.npmjs.com/) ou [pnpm](https://pnpm.io/)

### 1. Cloner le dépôt
```bash
git clone https://github.com/sachaguitter/portfolio_v3.git
cd portfolio_v3
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Lancer l'environnement de développement
```bash
npm run dev
```
> Le site est accessible instantanément sur `http://localhost:5173/` avec rafraîchissement à chaud (HMR).

### 4. Compiler pour la production
```bash
npm run build
```
> Les fichiers optimisés sont générés dans le dossier `/dist`, prêts à être déployés.

### 5. Prévisualiser le build localement
```bash
npm run preview
```

---

## ⚙️ Configuration

### ✉️ Service de messagerie (EmailJS)
Pour connecter le formulaire de contact à votre propre compte EmailJS :
1. Créez un compte gratuit sur [EmailJS](https://www.emailjs.com/).
2. Ouvrez le fichier [`script/email.config.js`](./script/email.config.js).
3. Renseignez vos identifiants :
```javascript
window.EMAILJS_CONFIG = {
    publicKey:           'VOTRE_PUBLIC_KEY',
    serviceId:           'VOTRE_SERVICE_ID',
    templateId:          'VOTRE_TEMPLATE_ID_NOTIFICATION',
    templateAutoReplyId: 'VOTRE_TEMPLATE_ID_ACCUSE'
};
```

### 📝 Données de profil et liens sociaux
Pour actualiser votre numéro, email ou profil LinkedIn, éditez directement le fichier JSON centralisé [`json/infos.json`](./json/infos.json) :
```json
{
  "email": "votre-email@example.com",
  "phone": "+33 6 00 00 00 00",
  "location": "Laval — Sablé-sur-Sarthe",
  "socials": {
    "linkedin": "https://www.linkedin.com/in/...",
    "instagram": "https://instagram.com/..."
  }
}
```

---

## 🌐 Déploiement sur GitHub Pages

Le projet intègre un pipeline CI/CD automatisé via **GitHub Actions** ([`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)).

### Activation en 2 étapes :
1. Sur GitHub, rendez-vous dans les paramètres du dépôt : **Settings** > **Pages**.
2. Dans la section **Build and deployment** :
   - Sous **Source**, sélectionnez **GitHub Actions**.
3. Tout nouveau commit poussé sur la branche `main` déclenche automatiquement la compilation Vite et la mise en ligne du portfolio sur :
   `https://<votre-pseudo>.github.io/<nom-du-repo>/`

---

## ♿ Accessibilité & SEO

- **Sémantique soignée** : Utilisation stricte des balises `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`.
- **Lien d'évitement** : Un `skip-link` permet aux utilisateurs naviguant au clavier ou au lecteur d'écran d'accéder directement au contenu principal.
- **Performances multimédia** : Images compressées au format moderne **WebP**, dimensions explicitées (`width` et `height`) pour éviter tout saut de mise en page (*Cumulative Layout Shift*).
- **Référencement naturel (SEO)** :
  - Balisage Open Graph (Facebook, LinkedIn) et Twitter Cards complets.
  - Fichier `sitemap.xml` recensant toutes les URLs et planches projets.
  - Fichier `robots.txt` autorisant l'exploration par les moteurs de recherche.

---

## 👤 Auteur & Réseaux

**Sacha GUITTER** — Photographe & Créatif Digital (BUT MMI Laval)

- 📸 **Instagram :** [@sacha.guitter.photo](https://instagram.com/sacha.guitter.photo)
- 💼 **LinkedIn :** [Sacha Guitter](https://www.linkedin.com/in/sachaguitter)
- 📇 **Karde :** [sachaguitterphoto](https://karde.me/sachaguitterphoto/)
- 📧 **Email :** [sachaguitterphoto@gmail.com](mailto:sachaguitterphoto@gmail.com)

---

## 📄 Licence & Droits d'Auteur

- **Code source :** Distribué sous licence **MIT**. Vous êtes libre de vous inspirer de l'architecture technique et du code. Voir le fichier [LICENSE](./LICENSE) pour plus de détails.
- **Photographies, Visuels & Identité :** **Tous droits réservés (Copyright © 2026 Sacha GUITTER)**. Les photographies d'animaux, de portraits, d'événements ainsi que les éléments graphiques personnels ne sont pas libres de droit et ne peuvent être réutilisés sans autorisation écrite explicite.
