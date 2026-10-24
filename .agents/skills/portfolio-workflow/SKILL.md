---
name: portfolio-workflow
description: >-
  Procédure de travail pour le cycle de vie du projet portfolio_v3 : installation des dépendances,
  lancement du serveur de développement Vite, compilation de production dist, prévisualisation locale,
  et checklist de vérification qualité avant de terminer une intervention.
---

# Workflow & Cycle de Vie du Portfolio

Ce skill documente les opérations standard pour exécuter, compiler, prévisualiser et vérifier l'intégrité du portfolio de **Sacha GUITTER**.

---

## 1. Installation des Dépendances

Si le dossier `node_modules/` est absent ou si des dépendances ont été modifiées dans `package.json` :

```bash
npm install
```

> [!NOTE]
> Le portfolio adopte une approche minimaliste : la seule dépendance de développement directe est `vite` (version 5.x) pour le bundling multi-pages ultra-rapide et le serveur local HMR.

---

## 2. Lancement du Serveur de Développement

Pour démarrer le serveur de développement local avec rechargement à chaud (HMR) :

```bash
npm run dev
```

- Par défaut, le serveur démarre sur `http://localhost:5173/`.
- Routes principales disponibles en local :
  - `http://localhost:5173/` : page d'accueil principale (`index.html`).
  - `http://localhost:5173/da.html` : page Direction Artistique (charte, grille, tokens).
  - `http://localhost:5173/html/projet.html?slug=photo-animaliere` : fiche de projet dynamique.
  - `http://localhost:5173/html/mentions-legales.html` : mentions légales.
  - `http://localhost:5173/html/politique-confidentialite.html` : politique de confidentialité.

---

## 3. Compilation pour la Production

Pour compiler le projet et générer les fichiers optimisés dans `dist/` :

```bash
npm run build
```

### Fonctionnement du Build Vite
Le fichier `vite.config.js` orchestre la compilation :
1. **Multi-Pages Rollup** : il résout les 5 points d'entrée HTML :
   - `main` (`index.html`)
   - `projet` (`html/projet.html`)
   - `da` (`da.html`)
   - `mentions` (`html/mentions-legales.html`)
   - `politique` (`html/politique-confidentialite.html`)
2. **Synchronisation Statique** : grâce au plugin interne `copy-static-assets`, il copie automatiquement vers `dist/` :
   - `json/` (contenant `liste_projets.json` et `infos.json`)
   - `projets/` (galeries WebP et métadonnées `projet.json`)
   - `image/` (visuels éditoriaux et icônes)
   - `fonts/` (polices Special Gothic)
   - `script/` (scripts JavaScript Vanilla)
   - `style/` (design tokens et feuilles de style)
   - `modeles_mails/` (templates EmailJS)
   - `pdf/` (documents téléchargeables)
   - Fichiers racines SEO & GitHub Pages : `robots.txt`, `sitemap.xml`, `.nojekyll`.

> [!IMPORTANT]
> Ne jamais modifier manuellement les fichiers à l'intérieur de `dist/`. Vos modifications doivent toujours être faites dans les fichiers sources (`index.html`, `style/`, `script/`, etc.), puis compilées via `npm run build`.

---

## 4. Prévisualisation du Build

Pour tester fidèlement le rendu de production généré dans `dist/` avant tout push Git :

```bash
npm run preview
```

---

## 5. Outils d'Administration & Maintenance (`ProjectManager`)

Un utilitaire autonome d'administration éditoriale est disponible dans `tools/projectmanager` :
- **Lancement rapide** : double-cliquez sur `admin.cmd` à la racine ou lancez `tools/projectmanager.exe`.
- **Fonctionnalités** :
  - Authentification sécurisée par mot de passe (hachage scrypt).
  - Gestionnaire de galerie (réorganisation par flèches, choix de la couverture `cover`, glisser-déposer de médias WebP).
  - Diagnostic de santé en continu (détection de dossiers orphelins, références mortes 404).
  - Export de fiches de synthèse Markdown pour les oraux BUT MMI.
  - Déclenchement du build Vite en 1 clic.

---

## 6. Checklist de Fin d'Intervention

Avant de conclure une tâche ou de valider vos modifications, vérifiez systématiquement les points suivants :

1. **Compilation sans erreur** : exécuter `npm run build` et s'assurer que le code de sortie est 0 (`exited with code 0`).
2. **Cohérence du design éditorial** :
   - Les filets noirs (`border: 1px solid #000000`, `2px solid #000000`) sont nets.
   - Les variables de `style/design-tokens.css` sont utilisées pour les couleurs, polices et marges.
   - Aucun coin arrondi (`border-radius`) inattendu n'a été introduit.
3. **Responsive design** : vérifier la compatibilité sur 3 largeurs clés :
   - Mobile étroit (≤ 400px).
   - Tablette (≤ 900px).
   - Desktop (≥ 1280px).
4. **Défilement & Navigation** :
   - Les liens d'ancrage (`#chapitre-1`, `#contact`, etc.) défilent de manière douce et fluide grâce au moteur dans `script/scroll.js`.
   - Le menu tiroir mobile s'ouvre et se referme proprement sur mobile.
5. **Carte Leaflet** : la carte de localisation se charge correctement avec les tuiles OpenStreetMap monochromes sans erreur de clé d'API.
6. **Référencement & Métadonnées** : vérifier que `sitemap.xml` et `robots.txt` sont à jour avec les slugs récents et la date courante.
7. **Hygiène Git & Sécurité** : exécuter `git status` pour s'assurer qu'aucun fichier temporaire, exécutable lourd ou secret (`.pm-auth.json`, `.env`) n'est indûment stagé.
