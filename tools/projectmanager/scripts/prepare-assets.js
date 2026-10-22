import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const uiDir = path.join(rootDir, 'ui');
const targetFile = path.join(rootDir, 'src', 'embedded-assets.js');

const html = fs.readFileSync(path.join(uiDir, 'index.html'), 'utf-8');
const css = fs.readFileSync(path.join(uiDir, 'app.css'), 'utf-8');
const js = fs.readFileSync(path.join(uiDir, 'app.js'), 'utf-8');

const content = `/**
 * Assets UI embarqués pour la compilation Node SEA
 * Fichier généré automatiquement — ne pas éditer à la main
 */

export const EMBEDDED_HTML = ${JSON.stringify(html)};
export const EMBEDDED_CSS = ${JSON.stringify(css)};
export const EMBEDDED_JS = ${JSON.stringify(js)};
`;

fs.writeFileSync(targetFile, content, 'utf-8');
console.log('✔ Assets UI compilés et intégrés avec succès dans src/embedded-assets.js');
