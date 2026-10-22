# 🛠️ Portfolio Project Manager v2.3 (Desktop GUI & CLI)

> **Application de bureau moderne avec Interface Graphique (GUI)** et mode CLI pour l'administration éditoriale, la gestion de tâches, l'inspection et réorganisation des galeries, l'export Markdown MMI, la sécurité par mot de passe et la maintenance du portfolio de **Sacha GUITTER**.

---

## 📌 Sommaire

1. [Vue d'Ensemble & Nouveautés v2.3](#-vue-densemble--nouveautés-v23)
2. [Sécurité & Authentification par Mot de Passe](#-sécurité--authentification-par-mot-de-passe)
3. [Structure de l'Interface Graphique](#-structure-de-linterface-graphique)
4. [Fonctionnalités Principales](#-fonctionnalités-principales)
5. [Raccourcis Clavier](#-raccourcis-clavier)
6. [Architecture Technique & Node SEA](#-architecture-technique--node-sea)
7. [API REST Locale](#-api-rest-locale)
8. [Prérequis & Installation](#-prérequis--installation)
9. [Compilation & Génération de l'Exécutable (`build.ps1`)](#-compilation--génération-de-lexécutable)
10. [Modes d'Exécution (GUI & Ligne de Commande)](#-modes-dexécution)
11. [Modèle de Données & Sauvegardes](#-modèle-de-données--sauvegardes)
12. [Historique des Versions & Changelog](#-historique-des-versions)

---

## 🌟 Vue d'Ensemble & Nouveautés v2.3

`ProjectManager` propose un arsenal complet d'outils professionnels pour photographe et étudiant BUT MMI :
- **Protection par Mot de Passe & Sécurité renforcée** : sécurisez l'accès à votre gestionnaire de portfolio avec hachage cryptographique `scrypt` salé, écran de verrouillage élégant et support CLI.
- **Gestionnaire de galeries interactif** : réordonnez les photos (`◀` / `▶`), définissez la photo de couverture en 1 clic (`⭐ Couv.`), et supprimez ou déposez des clichés directement par glisser-déposer.
- **Téléversement Drag & Drop** : glissez vos fichiers WebP, JPEG ou PNG directement sur la zone de dépôt pour les importer dans `projets/<cat>/<slug>/` sans ouvrir l'explorateur.
- **Duplication de projet en 1 clic** : clonez un projet existant avec ses étapes, compétences et structure pour gagner du temps.
- **Compilation Vite 1-clic (`Build`)** : compilez votre site en production directement depuis le bouton `🚀 Build` du header avec affichage terminal en direct.
- **Aperçu direct sur le site (`🌐 Site`)** : visualisez instantanément le projet sur le site web local ou ouvrez son dossier dans l'Explorateur Windows.
- **Export Markdown MMI** : générez automatiquement une fiche carnet de bord complète prête pour vos rapports de stage et oraux de BUT MMI (avec bouton Copier et Télécharger `.md`).
- **Gestionnaire complet des sauvegardes** : visualisez l'historique des backups de `liste_projets.json` et restaurez n'importe quelle version antérieure en un clic avec sauvegarde automatique de précaution.
- **Filtres d'avancement rapides** : filtrez vos réalisations par statut (Tous, En cours, Terminés 100%).
- **Deux thèmes visuels intégrés** : *Éditorial Blanc* et *Chambre Noire*.
- **Zéro installation requise** : binaire unique Windows 64-bit autonome (`projectmanager.exe`).

---

## 🔒 Sécurité & Authentification par Mot de Passe

Pour protéger les projets, descriptions éditoriales et médias contre toute modification non autorisée, Project Manager intègre un système d'authentification robuste :

### 1. Fonctionnement
- **Hachage cryptographique** : Dérivation de clé native Node.js `scrypt` (64 octets) avec sel cryptographique aléatoire de 16 octets généré par `crypto.randomBytes`. Le mot de passe n'est jamais stocké en clair.
- **Fichier de configuration** : Stocké localement dans `.pm-auth.json` à la racine du portfolio (automatiquement exclu de Git via `.gitignore`).
- **Sessions & Jetons** : Jetons de session 256 bits (`x-pm-token` et cookies `HttpOnly; SameSite=Strict`) assurant une protection complète contre les attaques CSRF et Path Traversal.
- **Verrouillage instantané** : Bouton de cadenas `🔒` dans la barre supérieure pour verrouiller immédiatement la session.
- **Gestion flexible** : Modification ou désactivation du mot de passe en 1 clic depuis la vue **Paramètres** de l'interface ou directement depuis le menu CLI.
- **Mode CLI & Scripts** : Le mode interactif console (`--cli`) demande le mot de passe avant d'afficher le menu. Pour les scripts automatisés sans interaction (CI/CD ou hooks), l'option `-w, --password <pwd>` est disponible.

---

## 🖥️ Structure de l'Interface Graphique

L'application est organisée en une **Single Page Application (SPA)** fluide et réactive :

### 1. En-tête Supérieur (Top Bar)
- **Titre de l'application** avec numéro de version active.
- **Badge de statut du portfolio** avec indicateur de connexion en temps réel.
- **Sélecteur de dossier actif** : bouton d'accès rapide pour basculer de portfolio à la volée.
- **Bouton Synchroniser** : réactualisation instantanée des galeries d'images en un clic.
- **Basculeur de thème** : passage instantané entre *Éditorial Blanc* et *Chambre Noire*.
- **Bouton Fermer** : arrêt propre du serveur local et fermeture de l'application.

### 2. Menu Latéral (Sidebar)
Menu rétractable permettant de naviguer instantanément entre les vues :
- 🏠 **Tableau de bord** : indicateurs clés, métriques globales et raccourcis d'action.
- 📁 **Mes Projets** : catalogue exhaustif des projets avec double affichage (cartes ou tableau).
- ✨ **Nouveau Projet** : formulaire guidé avec génération automatique de slug et aide contextuelle.
- ✅ **Tâches & Workflow** : suivi visuel de l'avancement global et checklists par projet.
- 🖼️ **Médias & Galeries** : inspecteur visuel des visuels avec visionneuse plein écran (Lightbox).
- 🔍 **Audit & Santé** : diagnostic d'intégrité du portfolio et réparations en 1 clic.
- ⚙️ **Paramètres** : gestion du dossier cible, système de sauvegardes instantanées et journaux.
- ℹ️ **À Propos** : informations sur l'application, crédits et aide-mémoire des raccourcis.

---

## ⚡ Fonctionnalités Principales

### 📁 Gestion Visuelle des Projets
- **Affichage dynamique** : basculez d'un clic entre la **vue Grille (cartes)** et la **vue Tableau (liste détaillée)**.
- **Recherche en temps réel** : filtrage instantané par titre, description, tags ou compétences.
- **Filtres par catégorie** : Tous, Projets Personnels (`perso`), Projets Étudiants BUT MMI (`etudiant`).
- **Tri multi-critères** : tri alphabétique (A-Z / Z-A), par nombre d'images ou par complétion des tâches.
- **Formulaire de création / édition complet** :
  - Métadonnées générales (titre, slug auto-généré, catégorie, description, lien externe).
  - Sélecteur de tags et de compétences BUT MMI sous forme de puces interactives avec ajout personnalisé.
  - Analyse réflexive académique (Contexte, Difficultés rencontrées, Réussites, Apprentissages).
  - Constructeur dynamique d'étapes de conception (ajout, ordonnancement, suppression).
- **Suppression sécurisée** : boîte de dialogue modale proposant le choix entre simple désindexation de `liste_projets.json` ou suppression physique définitive avec confirmation du titre.

### ✅ Tâches & Workflow de Production
- **Jauge de progression globale** : visualisez en pourcentage le taux de finalisation des projets.
- **Checklists interactives** : cochez ou décochez les étapes de conception directement depuis l'interface.
- **Persistance automatique** : chaque case cochée est immédiatement sauvegardée dans le fichier `projet.json` correspondant.
- **Filtres par statut** : filtrez les projets avec tâches en attente ou visualisez uniquement les projets 100% finalisés.

### 🖼️ Inspecteur de Médias & Galeries
- **Grille de vignettes haute fidélité** : affichage direct des images locales (`.webp`, `.png`, `.jpg`, `.avif`).
- **Visionneuse plein écran (Lightbox)** : cliquez sur n'importe quelle vignette pour l'examiner en haute définition avec navigation (Précédente / Suivante / Échap).
- **Synchronisation en un clic** : réanalyse du dossier physique, classement naturel (`naturalSort`) et détection des images de couverture (`cover`).
- **Gestionnaire d'absence de médias** : alertes claires lorsque le dossier d'images d'un projet est vide.

### 🔍 Diagnostic de Santé & Auto-Réparation
- **Contrôle d'intégrité en continu** :
  - Détection des dossiers d'images présents sur le disque mais absents de `liste_projets.json` (dossiers orphelins).
  - Détection des fiches répertoriées dont le fichier `projet.json` est introuvable (erreurs 404).
  - Détection des projets sans aucune image associée.
- **Boutons de réparation en 1 clic** :
  - *Réparer les dossiers orphelins* : ajoute automatiquement les projets manquants à l'index et lance la synchronisation des images.
  - *Nettoyer les références manquantes* : purge les entrées mortes de `liste_projets.json`.

### 🛡️ Sauvegardes & Sécurité des Données
- **Sauvegarde automatique** avant chaque modification, création ou suppression.
- **Bouton "Créer une sauvegarde maintenant"** dans les paramètres.
- **Dossier d'archivage local** : `json/backups/liste_projets_YYYY-MM-DD_HH-mm-ss.json`.
- **Protection anti-traversal** : validation stricte des chemins d'accès pour empêcher toute fuite hors de la racine du portfolio.

---

## ⌨️ Raccourcis Clavier

L'interface supporte les raccourcis clavier standards pour une productivité maximale :

| Raccourci | Action |
| :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>N</kbd> | Ouvrir le formulaire de création de projet |
| <kbd>Ctrl</kbd> + <kbd>F</kbd> | Activer et focaliser la barre de recherche |
| <kbd>Ctrl</kbd> + <kbd>S</kbd> | Enregistrer le formulaire de projet actif |
| <kbd>Ctrl</kbd> + <kbd>B</kbd> | Ouvrir le panneau de sauvegarde instantanée |
| <kbd>Échap</kbd> | Fermer la modale ouverte ou la visionneuse Lightbox |

---

## 🏛️ Architecture Technique & Node SEA

### Structure des Sources

```text
tools/projectmanager/
├── index.js                     # Point d'entrée CLI/GUI, dispatch selon arguments
├── package.json                 # Dépendances et scripts de compilation
├── sea-config.json              # Configuration Node.js SEA (Single Executable Application)
├── build.ps1                    # Script de compilation automatisé
├── admin.cmd                    # Lanceur rapide Windows (double-clic)
├── README.md                    # Documentation complète
│
├── ui/                          # Interface graphique (Frontend)
│   ├── index.html               # Structure HTML de l'application de bureau
│   ├── app.css                  # Feuilles de styles éditoriales et thèmes
│   └── app.js                   # Moteur SPA Vanilla (routeur, état, requêtes API)
│
├── scripts/
│   └── prepare-assets.js        # Compilateur embarquant index.html, app.css et app.js
│
└── src/
    ├── server.js                # Serveur HTTP natif (node:http) et API REST locale
    ├── window.js                # Lanceur de fenêtre Chromium / Edge en mode --app
    ├── embedded-assets.js       # Assets UI générés et encapsulés pour le binaire SEA
    ├── config.js                # Détection dynamique de racine, CRUD JSON, sauvegardes
    ├── constants.js             # Taxonomie, tags, compétences BUT MMI, catégories
    ├── utils.js                 # Slugification, tri naturel des images, chemins
    └── actions/
        ├── create.js            # Assistant de création CLI
        ├── modify.js            # Assistant de modification CLI
        ├── sync.js              # Moteur de synchronisation d'images
        ├── audit.js             # Moteur d'audit et diagnostic de conformité
        └── delete.js            # Moteur de suppression et désindexation
```

### Fonctionnement du Binaire SEA

1. Lors de la compilation, `prepare-assets.js` sérialise les fichiers du dossier `ui/` dans `src/embedded-assets.js`.
2. `esbuild` génère un bundle unique CommonJS `bundle.js`.
3. `node --experimental-sea-config` produit le blob binaire `sea-prep.blob`.
4. `postject` injecte le blob directement à l'intérieur d'une copie de l'exécutable `node.exe`.
5. Au lancement, `projectmanager.exe` démarre un serveur HTTP local sur une adresse d'écoute sécurisée (`127.0.0.1`) avec un port dynamique disponible, puis invoque Microsoft Edge avec le drapeau `--app=http://127.0.0.1:<port>`.
6. En cas de fermeture de la fenêtre, l'application s'arrête automatiquement et libère les ressources.

---

## 🌐 API REST Locale

Le serveur local expose les points d'entrée suivants :

| Méthode | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/status` | Métriques globales (projets, images, complétion des tâches) |
| `GET` | `/api/constants` | Liste des catégories, tags disponibles et compétences MMI |
| `GET` | `/api/projects` | Liste complète de tous les projets avec métadonnées |
| `POST` | `/api/projects` | Création d'un nouveau projet (dossier, `projet.json`, index) |
| `GET` | `/api/projects/:cat/:slug` | Détails complets du fichier `projet.json` spécifié |
| `PUT` | `/api/projects/:cat/:slug` | Mise à jour des informations d'un projet |
| `DELETE` | `/api/projects/:cat/:slug?mode=...` | Désindexation (`unindex`) ou suppression physique (`purge`) |
| `POST` | `/api/sync[?slug=...]` | Synchronisation ordonnée des images |
| `GET` | `/api/audit` | Rapport de santé (dossiers orphelins, 404, galeries vides) |
| `POST` | `/api/audit/fix` | Auto-réparation (`fix_orphans` ou `clean_missing`) |
| `POST` | `/api/switch-portfolio` | Changement à chaud du dossier de portfolio surveillé |
| `POST` | `/api/backup` | Création immédiate d'une sauvegarde de `liste_projets.json` |
| `GET` | `/api/image?path=...` | Flux sécurisé d'une image locale pour prévisualisation |
| `POST` | `/api/shutdown` | Fermeture propre du serveur et arrêt du processus |

---

## 📋 Prérequis & Installation

### Pour l'utilisateur final (Exécution)
- **Système d'exploitation** : Windows 10 ou Windows 11 (64-bit).
- **Navigateur** : Microsoft Edge (inclus par défaut dans Windows) ou Google Chrome.
- **Aucun runtime Node.js requis** : l'exécutable compilé est 100% autonome.

### Pour le développeur (Recompilation)
- **Node.js** : version 18.16.0 ou supérieure (recommandé : 20+ ou 24+ LTS).
- **npm** (inclus avec Node.js).
- **PowerShell 5.1+** (inclus nativement dans Windows).

---

## ⚙️ Compilation & Génération de l'Exécutable

Pour recompiler l'exécutable après une modification du code :

```powershell
# 1. Ouvrir le dossier de l'outil
cd tools/projectmanager

# 2. Exécuter le script de build
.\build.ps1
```

Le script de compilation effectue automatiquement les 7 étapes suivantes :
1. Détection de la version de Node.js.
2. Vérification et installation des dépendances npm.
3. Compilation des assets graphiques (`scripts/prepare-assets.js`).
4. Bundling du code JavaScript avec `esbuild`.
5. Génération du blob Node SEA (`sea-prep.blob`).
6. Clonage de `node.exe` et injection du blob via `postject`.
7. Nettoyage des résidus temporaires et test de validation.

Les exécutables générés sont automatiquement synchronisés dans :
- `tools/projectmanager/projectmanager.exe`
- `tools/projectmanager/PortfolioManager.exe`
- `tools/projectmanager.exe`
- `tools/PortfolioManager.exe`
- `../portfolio_v2/tools/` (si présent sur le système).

---

## 🚀 Modes d'Exécution

### 1. Mode Interface Graphique (Par Défaut)

#### Par double-clic
Double-cliquez sur `projectmanager.exe` ou sur `admin.cmd`. La fenêtre d'application s'ouvre instantanément.

#### En ligne de commande
```powershell
.\tools\projectmanager\projectmanager.exe
```

#### Options du mode graphique
```powershell
# Forcer un port d'écoute spécifique (au lieu d'un port dynamique)
projectmanager.exe --port 8080

# Ouvrir dans votre navigateur par défaut au lieu de la fenêtre application
projectmanager.exe --browser

# Cibler un dossier de portfolio spécifique au démarrage
projectmanager.exe --path "C:\MonPortfolio"
```

---

### 2. Mode Ligne de Commande (CLI / Automatisation)

Pour utiliser le menu console interactif ou exécuter des scripts automatisés :

| Commande | Effet |
| :--- | :--- |
| `projectmanager.exe --cli` | Lance le menu textuel interactif dans le terminal |
| `projectmanager.exe --sync` | Exécute la synchronisation des images sans interaction |
| `projectmanager.exe --audit` | Exécute le diagnostic de santé et affiche le rapport |
| `projectmanager.exe --help` | Affiche l'aide et les options disponibles |
| `projectmanager.exe --version`| Affiche le numéro de version courant |

---

## 💾 Modèle de Données & Sauvegardes

### Schéma d'une fiche projet (`projets/<categorie>/<slug>/projet.json`)

```json
{
  "slug": "photo-animaliere",
  "titre": "La Photo Animalière",
  "description": "Immersion photographique au cœur des forêts mayennaises et sarthoises...",
  "categorie": "perso",
  "tags": [
    "Photographie",
    "Photographie Animalière"
  ],
  "competences": [
    "Lightroom",
    "Prise de vue reflex / hybride",
    "Cadrage",
    "Éditing & Sélection"
  ],
  "images": [
    "projets/perso/photo-animaliere/chevreuil-1.webp",
    "projets/perso/photo-animaliere/chevreuil-2.webp"
  ],
  "reflexion": {
    "contexte": "Série au long cours réalisée en affût fixe...",
    "difficultes": "Faible luminosité en sous-bois à l'aube...",
    "reussites": "Approche respectueuse sans déranger la faune...",
    "apprentissages": "Maîtrise des hauts ISO et de la mise au point prédictive..."
  },
  "etapes": [
    {
      "titre": "Repérage & Traces",
      "desc": "Identification des coulées et des zones de nourrissage.",
      "done": true
    },
    {
      "titre": "Affût matinal",
      "desc": "Installation avant les premières lueurs du jour.",
      "done": false
    }
  ],
  "lien": null
}
```

---

## 📜 Historique des Versions

### Version 2.3.0 (Version Actuelle)
- **Sécurité & Protection par Mot de Passe** :
  - Authentification complète de l'application avec écran d'accueil et de verrouillage éditorial.
  - Hachage cryptographique fort (`scrypt` natif Node.js avec sel aléatoire de 16 octets).
  - Sessions sécurisées avec jetons chiffrés (`x-pm-token` + cookies `HttpOnly`).
  - Bouton de verrouillage instantané (`🔒`) dans la barre supérieure de l'interface graphique.
  - Gestion complète dans l'onglet **Paramètres** (création, modification, désactivation).
  - Protection interactive en ligne de commande (`--cli`) et option `--password <pwd>` pour l'automatisation.
  - Exclusion automatique du fichier secret `.pm-auth.json` dans `.gitignore`.

### Version 2.2.0
- **Gestionnaire Interactif de Galeries & Visuels** :
  - Définition de la photo de couverture en 1 clic (`⭐ Couv.`).
  - Réorganisation intuitive de l'ordre d'affichage des photographies (`◀` / `▶`).
  - Suppression physique sécurisée de photos individuelles avec confirmation.
  - Dépôt de fichiers par glisser-déposer (*Drag & Drop*) et sélecteur multiple de fichiers direct.
- **Duplication & Clonage de Projet** :
  - Clonage instantané d'une fiche projet vers un nouveau slug avec duplication optionnelle des visuels.
- **Générateur & Exportateur Markdown MMI** :
  - Génération de fiche synthétique formatée pour les rapports de stage, oraux et soutenances BUT MMI.
  - Boutons de copie dans le presse-papiers et de téléchargement direct en fichier `.md`.
- **Gestionnaire Avancé de Sauvegardes & Restauration** :
  - Tableau d'historique des sauvegardes de `liste_projets.json` avec dates et tailles.
  - Restauration en un clic avec création automatique d'un instantané de sécurité préalable.
- **Intégration Directe Système & Navigateur** :
  - Bouton `🚀 Build` dans l'en-tête pour lancer `npm run build` avec console de sortie interactive.
  - Bouton `🌐 Site` pour ouvrir instantanément la fiche projet ou la page d'accueil dans le navigateur web.
  - Bouton `📂 Dossier` pour ouvrir l'arborescence Windows Explorer du projet ou du portfolio.

### Version 2.1.0
- **Interface Graphique Complète (Desktop GUI)** :
  - Single Page Application intégrée avec navigation par onglets.
  - Fenêtre autonome sans chrome navigateur via Microsoft Edge / Chromium (`--app`).
  - Thèmes *Éditorial Blanc* et *Chambre Noire*.
- **Gestionnaire de Tâches & Workflow** :
  - Checklists interactives avec progression globale et par projet.
- **Inspecteur de Galeries & Lightbox** :
  - Vignettes en temps réel avec visionneuse zoom plein écran.
- **Auto-réparation** :
  - Résolution des erreurs orphelines et 404 en 1 clic.
- **Compilation SEA Embarquée** :
  - Fusion totale des assets frontaux dans le binaire Windows unique.

### Version 2.0.0
- Restructuration modulaire en architecture propre ES Modules (`src/`).
- Suppression des chemins codés en dur et détection dynamique de la racine du portfolio.
- Tri naturel intelligent des images (`naturalSort`) avec priorité aux visuels `cover`.
- Prise en charge des formats modernes (`.webp`, `.avif`, `.svg`).
- Intégration de Node.js SEA (Single Executable Application) avec `postject`.
- Sauvegardes automatiques horodatées dans `json/backups/`.

---

© Sacha GUITTER — Portfolio Éditorial & Outils de Production. Tous droits réservés.
