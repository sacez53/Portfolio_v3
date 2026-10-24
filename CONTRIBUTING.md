# Guide de Contribution — Portfolio Sacha GUITTER

Merci pour votre intérêt envers le portfolio de **Sacha GUITTER** !

Ce projet est à la fois une vitrine professionnelle, un portfolio d'auteur photographe et un projet académique réalisé dans le cadre du **BUT MMI** (Métiers du Multimédia et de l'Internet à l'IUT de Laval).

Les propositions de corrections de bogues, d'optimisations d'accessibilité, d'améliorations de performance ou de retours typographiques sont chaleureusement accueillies.

---

## 🧭 Sommaire

1. [Règles Fondamentales](#-règles-fondamentales)
2. [Signaler un Problème ou Proposer une Amélioration](#-signaler-un-problème-ou-proposer-une-amélioration)
3. [Environnement de Développement Local](#-environnement-de-développement-local)
4. [Architecture Modulaire des Projets](#-architecture-modulaire-des-projets)
5. [Outil d'Administration `ProjectManager`](#-outil-dadministration-projectmanager)
6. [Charte de Conception & Direction Artistique](#-charte-de-conception--direction-artistique)
7. [Processus de Pull Request & Conventional Commits](#-processus-de-pull-request--conventional-commits)
8. [Droits d'Auteur et Propriété Intellectuelle](#-droits-dauteur-et-propriété-intellectuelle)

---

## ⚖️ Règles Fondamentales

1. **Intégrité de la Direction Artistique** : Respecter scrupuleusement l'esprit éditorial « grand format papier », monochrome, inspiré du graphisme suisse.
2. **Pas de Framework CSS Tiers** : N'ajoutez ni Bootstrap, ni Tailwind, ni framework lourd. Le projet repose sur du CSS Vanilla moderne structuré avec des variables CSS racines (`style/design-tokens.css`).
3. **Vanilla JavaScript Moderne** : Conserver un code JavaScript propre, modulaire et sans dépendance superflue.
4. **Validation Systématique du Build** : Toujours vérifier que `npm run build` s'exécute avec succès avant de soumettre une contribution.

---

## 🐛 Signaler un Problème ou Proposer une Amélioration

Avant d'ouvrir un ticket :
- Consultez les [Issues existantes](https://github.com/sacez53/Portfolio_v3/issues) pour vérifier qu'un signalement identique n'est pas déjà ouvert.
- Si le sujet est nouveau, créez une issue via nos formulaires pré-remplis :
  - **[Signalement de bug](https://github.com/sacez53/Portfolio_v3/issues/new?template=bug_report.md)** pour une anomalie d'affichage, un lien rompu ou un problème fonctionnel.
  - **[Suggestion d'amélioration](https://github.com/sacez53/Portfolio_v3/issues/new?template=feature_request.md)** pour proposer une évolution d'ergonomie ou de contenu.
- Pour une faille de sécurité, merci de vous référer à la politique confidentielle décrite dans [SECURITY.md](./SECURITY.md).

---

## 💻 Environnement de Développement Local

### Prérequis
- [Node.js](https://nodejs.org/) v18+ (LTS recommandé : v20 ou supérieur).
- Git installé et configuré sur votre poste.

### Étapes d'Installation

1. **Forker** le dépôt sur votre compte GitHub personnel :
   [https://github.com/sacez53/Portfolio_v3](https://github.com/sacez53/Portfolio_v3)

2. **Cloner** votre fork localement :
   ```bash
   git clone https://github.com/<votre-pseudo>/Portfolio_v3.git
   cd Portfolio_v3
   ```

3. **Installer les dépendances** :
   ```bash
   npm install
   ```

4. **Lancer le serveur de développement local** :
   ```bash
   npm run dev
   ```
   > Le serveur Vite démarre instantanément avec HMR sur `http://localhost:5173/`.

5. **Tester la compilation de production** :
   ```bash
   npm run build
   npm run preview
   ```

---

## 🗂️ Architecture Modulaire des Projets

Le portfolio n'utilise pas de base de données backend complexe mais une architecture JSON modulaire performante :

- `json/liste_projets.json` : Index contenant la liste ordonnée des chemins vers chaque fiche projet.
- `projets/<categorie>/<slug>/projet.json` : Fiche descriptive indépendante avec métadonnées, analyse réflexive et liste d'images.
- `projets/<categorie>/<slug>/*.webp` : Clichés optimisés associés au projet.

---

## 🛠️ Outil d'Administration `ProjectManager`

Pour administrer les projets sans manipuler manuellement les JSON :
- Lancez `admin.cmd` à la racine ou exécutez `tools/projectmanager.exe`.
- Cet outil permet de créer de nouveaux projets, réordonner les galeries par flèches (`◀` / `▶`), définir l'image de couverture (`⭐ Couv.`), gérer les sauvegardes dans `json/backups/` et auditer les dossiers orphelins.

---

## 🎨 Charte de Conception & Direction Artistique

Toute contribution visuelle ou stylistique doit respecter les standards établis :

| Critère | Règle Obligatoire |
| :--- | :--- |
| **Couleurs** | Strictement monochromes : `#FFFFFF`, `#000000`, surface subtile `#F8F8F8`. |
| **Coins** | Angles droits stricts (`--radius-none: 0px`). Aucun `border-radius` arrondi. |
| **Filets** | Filets noirs nets (`border: 1px solid #000000` ou `2px solid #000000`). |
| **Typographie** | Fonte locale `Special Gothic` (déclarée dans `style/fonts.css`). |
| **Tokens CSS** | Utilisation exclusive des variables de `style/design-tokens.css`. |
| **Images** | Format `.webp` optimisé avec attributs `width`, `height` et `loading="lazy"`. |
| **Accessibilité** | Contraste conforme WCAG AA/AAA, navigation clavier et support `prefers-reduced-motion`. |

Consultez le manifeste complet sur [`da.html`](https://sacez53.github.io/Portfolio_v3/da.html).

---

## 🚀 Processus de Pull Request & Conventional Commits

1. **Créer une branche dédiée** :
   ```bash
   git checkout -b fix/correctif-nav-mobile
   # ou
   git checkout -b feat/ajout-filtre-galerie
   ```

2. **Respecter la convention de commit (Conventional Commits)** :
   - `feat(...)`: Ajout d'une fonctionnalité.
   - `fix(...)`: Correction d'un bug.
   - `style(...)`: Modifications de style ou de mise en page sans altération logique.
   - `docs(...)`: Mise à jour de la documentation.
   - `perf(...)`: Amélioration des performances ou du poids des médias.
   - `refactor(...)`: Restructuration du code sans changement de comportement.
   - `chore(...)`: Tâches de maintenance (dépendances, outillage, CI).

   *Exemple :* `git commit -m "fix(nav): correction du repli du menu tiroir sur écran tactile"`

3. **Valider les tests et le build** :
   ```bash
   npm run build
   ```

4. **Pousser la branche et ouvrir une Pull Request** :
   - Remplir le formulaire standardisé proposé par [`.github/PULL_REQUEST_TEMPLATE.md`](./.github/PULL_REQUEST_TEMPLATE.md).
   - Décrire clairement les modifications et fournir des captures d'écran si l'affichage est modifié.

---

## 📸 Droits d'Auteur et Propriété Intellectuelle

- **Code Source** : Libre et ouvert sous licence [MIT](./LICENSE).
- **Médias & Visuels** : L'ensemble des photographies (animaux, portraits, événements musicaux, galas de danse), tirages d'art et créations graphiques de Sacha GUITTER sont **strictement protégés par le droit d'auteur (Tous droits réservés © 2026 Sacha GUITTER)**.
- Toute réutilisation, reproduction, diffusion publique ou modification non autorisée de ces médias est strictement interdite sans consentement écrit préalable.
