# Directives et Contexte Projet — Portfolio Sacha Guitter

Ce document sert de guide de référence et de consignes opérationnelles pour tout travail d'assistance IA sur ce projet. Il est automatiquement chargé au démarrage des sessions.

---

## 1. Vue d'Ensemble & Objectifs

- **Projet** : Portfolio éditorial personnel et professionnel de **Sacha GUITTER**.
- **Profil** : Étudiant en BUT MMI (Métiers du Multimédia et de l'Internet à l'IUT de Laval) et photographe animalier / créatif visuel.
- **Direction Artistique** : Édition numérique « format A4 paysage » inspirée directement de la mise en page papier (Affinity Publisher) et du graphisme suisse :
  - Palette monochrome stricte (fonds blancs `#FFFFFF`, surfaces subtiles `#F8F8F8`, typographie et filets noirs `#000000`).
  - Absence d'arrondis superflus (`--radius-none: 0px`).
  - Typographie éditoriale monumentale (`Special Gothic` et `Special Gothic Expanded`).
  - Filets et séparateurs nets (`border: 1px solid #000000`, `border-left: 2px solid #000000`, `border-top: 2px solid #000000`).

---

## 2. Architecture & Points d'Entrée

```text
portfolio_v3_web/
├── src/                  Sources web : HTML, script/, style/, json/, projets/, médias
├── content/agent/        Sources Markdown de l’accueil et de la page 404
├── templates/emails/     Modèles EmailJS
├── docs/                 Documentation du projet
├── tools/                Gestionnaire, outils de build et génération du CV
├── tests/                Tests Node.js
├── output/               Aperçus locaux ignorés par Git
└── dist/                 Site généré par Vite
```

La racine web est `src/`. Les chemins des ressources publiées restent identiques. Les exemples ci-dessous et les skills qui mentionnent un chemin web comme `json/infos.json` doivent être préfixés par `src/` pour un accès sur disque. Voir `docs/architecture.md`.

---

## 3. Stack Technique & Commandes

- **Runtime** : Node.js (v18+) & npm.
- **Bundler** : Vite (`vite: "^5.0.0"`), configuré en mode multi-pages dans `vite.config.js`.
- **Librairies externes (chargées via CDN)** :
  - **Leaflet 1.9.4** (`unpkg.com/leaflet`) + tuiles OpenStreetMap avec filtre CSS monochrome.
  - **EmailJS Browser 4** (`cdn.jsdelivr.net`).
- **Commandes essentielles** :
  ```bash
  # Lancement du serveur de développement local (par défaut sur http://localhost:5173)
  npm run dev

  # Compilation pour la production (génère le dossier dist/ avec synchronisation des assets)
  npm run build

  # Prévisualisation locale du résultat de compilation
  npm run preview
  ```

---

## 4. Règles & Conventions de Travail

1. **Règle d'or du build** :
   Toujours exécuter `npm run build` après chaque modification de code pour s'assurer que le bundler compile sans avertissement bloquant et que le dossier `dist/` est à jour.
2. **Respect strict de la charte graphique** :
   - Ne pas introduire de bibliothèques CSS tierces (ex: Bootstrap, Tailwind).
   - Utiliser systématiquement les variables définies dans `src/style/design-tokens.css` (`var(--line-black)`, `var(--bg)`, `var(--container-pad)`).
   - Pas de coins arrondis sur les cartes, boutons, cadres ou popups (conserver l'esprit d'imprimerie).
3. **Approche Vanilla & Performance** :
   - Conserver un code JavaScript pur (Vanilla ES6+), sans framework superflu.
   - Utiliser des images au format WebP optimisé avec dimensions (`width`, `height`) et `loading="lazy"`.
4. **Accessibilité & Navigation** :
   - Préserver la structure sémantique HTML5 et les attributs ARIA.
   - Respecter le mode `prefers-reduced-motion` pour toutes les animations et transitions.
   - Ne jamais forcer un défilement saccadé ou trop rapide : utiliser le moteur fluide calibré dans `src/script/scroll.js`.
5. **Confidentialité & Sécurité** :
   - Ne jamais copier de jeton, clé privée ou mot de passe dans les fichiers versionnés ou dans la documentation.
   - Ne pas modifier directement les fichiers situés dans `dist/` : ils sont régénérés automatiquement par `npm run build`.

---

## 5. Skills et Procédures Disponibles

Des procédures détaillées réutilisables sont disponibles dans le dossier local `.agents/skills/` :
- **`portfolio-workflow`** (`.agents/skills/portfolio-workflow/SKILL.md`) : procédures de dev, build, prévisualisation et checklist de validation.
- **`portfolio-project-manager`** (`.agents/skills/portfolio-project-manager/SKILL.md`) : guide d'ajout, de mise à jour et d'audit des projets dans `src/json/liste_projets.json` et des galeries d'images.
