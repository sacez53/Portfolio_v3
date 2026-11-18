import { resolve } from 'path';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { agentPreview } from './tools/site-preview.mjs';

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export default defineConfig({
  base: './',
  root: '.',
  appType: 'mpa',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        projet: resolve(__dirname, 'html/projet.html'),
        da: resolve(__dirname, 'da.html'),
        mentions: resolve(__dirname, 'html/mentions-legales.html'),
        politique: resolve(__dirname, 'html/politique-confidentialite.html'),
        about: resolve(__dirname, 'about/index.html'),
        contact: resolve(__dirname, 'contact/index.html'),
        privacy: resolve(__dirname, 'privacy/index.html'),
      },
    },
  },
  plugins: [
    agentPreview(),
    {
      name: 'copy-static-assets',
      closeBundle() {
        const dist = resolve(__dirname, 'dist');
        const toCopy = ['json', 'projets', 'image', 'fonts', 'script', 'style', 'modeles_mails', 'pdf'];
        toCopy.forEach(dir => copyDir(resolve(__dirname, dir), resolve(dist, dir)));
        ['robots.txt', 'sitemap.xml', '.nojekyll', 'llms.txt', '404.html'].forEach(file => {
          const src = resolve(__dirname, file);
          if (fs.existsSync(src)) {
            fs.copyFileSync(src, resolve(dist, file));
          }
        });
        fs.copyFileSync(resolve(__dirname, 'agent/home.md'), resolve(dist, 'index.md'));
        fs.copyFileSync(resolve(__dirname, 'agent/404.md'), resolve(dist, '404.md'));
      }
    }
  ]
});
