# Portfolio de Sacha GUITTER

Portfolio en HTML, CSS et JavaScript, compilé avec Vite. Les projets photographiques et universitaires ont chacun un dossier avec leur fiche JSON et leurs images.

## Démarrer

Node.js 20 ou plus récent et npm sont nécessaires.

```sh
npm ci
npm run dev
```

Ouvrir l’adresse affichée par Vite, généralement `http://localhost:5173/`.

```sh
npm run build
npm run preview
npm test
```

La compilation produit `dist/`. `npm test` compile le site puis vérifie les pages HTTP, les liens du catalogue et la séparation des fichiers locaux.

## Arborescence

```text
portfolio_v3_web/
├── src/                     Sources du site ; racine web pour Vite
│   ├── index.html           Accueil
│   ├── da.html              Charte graphique
│   ├── about/               Présentation
│   ├── contact/             Coordonnées
│   ├── privacy/             Confidentialité
│   ├── html/                Fiche projet et pages légales
│   ├── script/              JavaScript et configuration EmailJS
│   ├── style/               CSS et variables graphiques
│   ├── json/                Coordonnées et catalogue des projets
│   ├── projets/             Fiches projet.json et images par projet
│   ├── image/               Images communes et icônes
│   ├── fonts/               Polices locales
│   ├── pdf/                 Documents téléchargeables
│   └── …                    robots.txt, sitemap.xml, llms.txt, 404.html
├── content/agent/           Sources Markdown pour index.md et 404.md
├── templates/emails/        Modèles EmailJS HTML et texte
├── docs/                    Documentation et règles de contribution
├── tools/                   Outils locaux
│   ├── build/               Middleware de prévisualisation Vite
│   ├── generate_cv.py       Générateur du CV
│   └── projectmanager/      Gestionnaire de projets
│       └── bin/             Exécutables locaux, ignorés par Git
├── tests/                   Vérifications Node.js
├── output/                  Aperçus locaux, ignorés par Git
├── dist/                    Résultat généré, ignoré par Git
├── admin.cmd                Lanceur du gestionnaire de projets
├── package.json             Commandes et dépendances du site
└── vite.config.js           Entrées HTML et copie des ressources
```

Les chemins du site publié restent identiques : `src/index.html` devient `/index.html`, `src/json/infos.json` devient `/json/infos.json`. Le préfixe `src/` appartient au dépôt, pas aux URL du site. Voir [l’organisation des fichiers](docs/architecture.md).

## Modifier le contenu

- [Coordonnées](src/json/infos.json) : adresse e-mail, téléphone et liens sociaux.
- [Catalogue des projets](src/json/liste_projets.json) : chemins relatifs à la racine web, par exemple `projets/perso/photo-animaliere/projet.json`.
- [Projets](src/projets/) : métadonnées et galeries, réparties entre `perso/` et `etudiant/`.
- [Variables graphiques](src/style/design-tokens.css) : couleurs, typographie et espacements.
- [Configuration EmailJS](src/script/email.config.js) et [modèles d’e-mails](templates/emails/README.md).

Après l’ajout ou le retrait d’un projet, mettre à jour [le sitemap](src/sitemap.xml) et [l’accueil Markdown](content/agent/home.md). Les tests comparent leurs liens au catalogue.

Les modèles d’e-mails sont conservés hors du site publié. Pour modifier les e-mails envoyés, copier les modèles dans EmailJS ; publier le site ne suffit pas.

## Gestionnaire de projets

Double-cliquer sur `admin.cmd`. Le lanceur utilise les sources Node.js, ou l’exécutable de `tools/projectmanager/bin/` si Node.js est absent. Le dossier actif est `src/`. Le gestionnaire accepte aussi la racine du dépôt et la résout vers `src/`.

Les sauvegardes restent dans `src/json/backups/` et le fichier d’authentification reste à la racine du dépôt. Ces fichiers ne sont pas copiés dans `dist/`.

Voir le [guide du gestionnaire](tools/projectmanager/README.md).

## Publication

La configuration GitHub Actions compile le site puis publie uniquement `dist/`. Le fichier `index.html` à la racine du dépôt ouvre `src/index.html` si GitHub Pages publie directement la branche ; il évite alors que le README devienne la page d’accueil. Le build Vite conserve sa propre page d’accueil issue de `src/index.html`. Les commandes restent lancées depuis la racine du dépôt. Les URL publiques existantes sont conservées.

La prévisualisation locale répond aussi en Markdown pour l’accueil et les erreurs 404 selon l’en-tête `Accept`. GitHub Pages ne fournit pas cette négociation ; les versions Markdown restent disponibles via `index.md` et `404.md`.

## Documentation

- [Organisation des fichiers et déplacements](docs/architecture.md)
- [Contribution](docs/CONTRIBUTING.md)
- [Signalement de sécurité](docs/SECURITY.md)
- [Code de conduite](docs/CODE_OF_CONDUCT.md)

Le code est sous [licence MIT](LICENSE). Les photographies et les travaux présentés restent la propriété de leur auteur.
