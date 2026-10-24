---
name: portfolio-project-manager
description: >-
  Guide pratique pour créer, mettre à jour, auditer ou supprimer des projets dans le portfolio.
  À utiliser pour intégrer une nouvelle série photographique ou un projet académique BUT MMI,
  gérer le fichier json/liste_projets.json et les fichiers modulaires projets/<cat>/<slug>/projet.json,
  gérer les visuels WebP et vérifier la fiche dynamique html/projet.html.
---

# Gestion des Projets du Portfolio

Ce skill décrit l'architecture des données modulaires et la méthodologie à suivre pour ajouter, modifier, synchroniser ou auditer des réalisations dans le portfolio de **Sacha GUITTER**.

---

## 1. Architecture Modulaire des Projets

Le portfolio utilise une architecture modulaire décentralisée :

1. **L'Index Global (`json/liste_projets.json`)** :
   Ce fichier liste les chemins d'accès vers chaque fichier de configuration de projet :
   ```json
   [
     "projets/perso/photo-animaliere/projet.json",
     "projets/perso/photo-portrait/projet.json",
     "projets/perso/shooting-charlyne/projet.json",
     "projets/etudiant/affiche-trail/projet.json",
     "projets/etudiant/canette-tyztea-blender/projet.json"
   ]
   ```

2. **La Fiche Projet Modulaire (`projets/<categorie>/<slug>/projet.json`)** :
   Chaque projet réside dans son propre dossier contenant ses images WebP et son fichier de métadonnées respectant le schéma standard :

```json
{
  "slug": "photo-animaliere",
  "titre": "La Photo Animalière",
  "description": "Au cœur de la nature, la photographie animalière est ma passion originelle...",
  "categorie": "perso",
  "status": "en_cours",
  "tags": [
    "Photographie",
    "Animalier",
    "Nature",
    "Affût"
  ],
  "competences": [
    "Affût en milieu naturel",
    "Téléobjectif",
    "Gestion de la lumière naturelle",
    "Lightroom"
  ],
  "images": [
    "projets/perso/photo-animaliere/chevreuil-1.webp",
    "projets/perso/photo-animaliere/ecureuil-roux-acouder-etoile.webp",
    "projets/perso/photo-animaliere/renard.webp"
  ],
  "reflexion": {
    "contexte": "Prises de vue réalisées au cœur des forêts et bocages sarthois et mayennais.",
    "difficultes": "Anticiper les déplacements rapides des animaux et composer avec une lumière changeante.",
    "reussites": "Des attitudes spontanées capturées sans artifice, comme l'écureuil roux accoudé.",
    "apprentissages": "Maîtrise des focales longues, travail sur la vitesse d'obturation et respect des biotopes."
  },
  "etapes": [
    {
      "titre": "01. Repérage",
      "desc": "Analyse des coulées et des zones de passage dans les sous-bois.",
      "status": "completed",
      "done": true
    },
    {
      "titre": "02. L'Affût",
      "desc": "Installation matinale avant le lever du soleil pour une immersion discrète.",
      "status": "completed",
      "done": true
    }
  ]
}
```

---

## 2. Emplacement et Gestion des Médias

Les images de projets sont rangées selon leur catégorie :
- **Séries personnelles** : `projets/perso/<slug>/`
- **Projets étudiants BUT MMI** : `projets/etudiant/<slug>/`

### Règles d'Optimisation des Médias :
1. **Format d'image** : Utiliser exclusivement le format `.webp` pour une compression optimale.
2. **Dimensions & Poids** :
   - Plein écran / couverture : largeur max `1920px`, poids cible `< 300 Ko`.
   - Vues de galerie : largeur max `1200px`, poids cible `< 180 Ko`.
3. **Convention de Nommage** : Noms clairs en minuscules avec tirets (ex. `chevreuil-1.webp`, `porsche-gt3rs-profil.webp`).

---

## 3. Liaison avec le Rendu Web

1. **Page d'Accueil (`index.html`)** :
   - `script/projets.js` interroge `json/liste_projets.json`, charge chaque `projet.json` en parallèle, et injecte dynamiquement les cartes dans `#grid-perso` et `#grid-etudiant`.
2. **Fiche Projet Dédiée (`html/projet.html`)** :
   - Le script lit le paramètre d'URL `?slug=<slug>`.
   - Il sélectionne la fiche correspondante, injecte les métadonnées éditoriales, l'analyse réflexive, les compétences, les étapes et la galerie photographique.

---

## 4. Outil d'Administration Automatisé (`ProjectManager v2.3`)

Pour gérer les projets sans modifier manuellement les fichiers JSON, utilisez l'exécutable autonome :
- **Lancement rapide** : double-cliquer sur `admin.cmd` à la racine ou exécuter `tools/projectmanager.exe`.
- **Fonctionnalités disponibles** :
  - `✨ Créer un nouveau projet` : guide interactif pas à pas avec génération automatique du slug et création du dossier.
  - `✏️ Modifier un projet existant` : mise à jour ciblée (titre, tags, analyse réflexive, étapes de workflow).
  - `🔄 Réorganisation de galerie` : réordonnez les photos (`◀` / `▶`) et définissez la couverture (`⭐ Couv.`).
  - `📥 Téléversement Drag & Drop` : glissez-déposez de nouvelles images directement dans l'interface.
  - `🔍 Diagnostic d'intégrité (Audit)` : détection automatique des dossiers orphelins et des références mortes 404 avec auto-réparation.
  - `📄 Export Markdown MMI` : génération automatique de fiches de compétences prêtes pour les soutenances et rapports de BUT MMI.
  - `🛡️ Sauvegardes instantanées` : archivage automatique de chaque modification dans `json/backups/`.

---

## 5. Procédure de Validation lors de l'Ajout d'un Projet

1. Placer les clichés WebP dans `projets/<categorie>/<nouveau-slug>/`.
2. Créer le fichier `projet.json` avec les informations complètes (ou utiliser `ProjectManager`).
3. Ajouter le chemin `"projets/<categorie>/<nouveau-slug>/projet.json"` dans `json/liste_projets.json`.
4. Mettre à jour `sitemap.xml` en ajoutant la nouvelle URL :
   `<loc>https://sacez53.github.io/Portfolio_v3/html/projet.html?slug=nouveau-slug</loc>`.
5. Exécuter `npm run build` pour compiler et synchroniser les assets avec le dossier `dist/`.
6. Lancer `npm run dev` et tester la fiche à l'adresse `http://localhost:5173/html/projet.html?slug=nouveau-slug`.
