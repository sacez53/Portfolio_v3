# Organisation des fichiers

## Chemins sur disque et URL

Vite lit les pages dans `src/` et écrit le site compilé dans `dist/`. Les ressources copiées conservent leur chemin relatif à `src/`. Ainsi, un lien `../image/favicon.png` dans `src/html/projet.html` continue à fonctionner dans `dist/html/projet.html` et sur le site publié.

Les chemins enregistrés dans `src/json/liste_projets.json` et dans les fiches `projet.json` sont relatifs à la racine web. Ils ne doivent pas commencer par `src/`. Les liens absolus du sitemap, des métadonnées et du contenu Markdown gardent les mêmes URL publiques.

| Ancien emplacement dans le dépôt | Nouvel emplacement |
| --- | --- |
| `index.html`, `da.html`, `404.html` | `src/` |
| `about/`, `contact/`, `privacy/`, `html/` | `src/` |
| `script/`, `style/`, `fonts/`, `image/`, `pdf/` | `src/` |
| `json/`, `projets/` | `src/` |
| `robots.txt`, `sitemap.xml`, `llms.txt`, `.nojekyll` | `src/` |
| `agent/` | `content/agent/` |
| `modeles_mails/` | `templates/emails/` |
| `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md` | `docs/` |
| `tools/site-preview.mjs` | `tools/build/site-preview.mjs` |
| Exécutables à la racine et dans `tools/` | `tools/projectmanager/bin/archives/` |
| Exécutables du gestionnaire | `tools/projectmanager/bin/` |

Les copies d’exécutables déjà présentes sont conservées dans les archives. Les prochaines compilations écrivent uniquement dans `tools/projectmanager/bin/`. Le lanceur à la racine reste `admin.cmd` ; celui du gestionnaire lui transmet les arguments.

## Fichiers publiés

`vite.config.js` déclare les entrées HTML. La copie des ressources concerne uniquement `src/json`, `src/projets`, `src/image`, `src/fonts`, `src/script`, `src/style` et `src/pdf`, avec exclusion des dossiers `backups` et des fichiers cachés. Les fichiers de découverte à la racine web sont copiés explicitement. Les sources `content/agent/home.md` et `content/agent/404.md` deviennent `index.md` et `404.md`.

`docs/`, `templates/`, `tools/`, `output/` et les fichiers d’authentification ne sont pas publiés. Ne pas éditer `dist/` à la main.

## Gestionnaire et outils

Le gestionnaire reconnaît la racine du dépôt et `src/`. Les opérations sur les projets utilisent `src/` ; la commande de compilation et l’authentification utilisent la racine du dépôt. Les sauvegardes restent liées au catalogue dans `src/json/backups/`.

Le générateur `tools/generate_cv.py` lit les polices dans `src/fonts/` et écrit ses aperçus dans `output/pdf/`. Le PDF public est dans `src/pdf/`.

Les exemples des skills locaux qui mentionnent `json/`, `projets/`, `script/` ou `style/` désignent les chemins relatifs à la racine web. Ajouter `src/` pour accéder à ces fichiers depuis la racine du dépôt.

## Vérifications après un déplacement

Lancer `npm test`, puis tester les pages via `npm run dev` et `npm run preview`. Vérifier aussi une fiche projet et le téléchargement du CV. Les tests d’organisation contrôlent les fichiers référencés par les pages, les feuilles CSS et le catalogue, ainsi que l’absence des dossiers locaux dans le build.
