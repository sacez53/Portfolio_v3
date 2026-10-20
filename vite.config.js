import { resolve } from 'path';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

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
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        projet: resolve(__dirname, 'html/projet.html'),
        da: resolve(__dirname, 'da.html'),
        mentions: resolve(__dirname, 'html/mentions-legales.html'),
        politique: resolve(__dirname, 'html/politique-confidentialite.html'),
      },
    },
  },
  plugins: [
    {
      name: 'copy-static-assets',
      closeBundle() {
        const dist = resolve(__dirname, 'dist');
        const toCopy = ['json', 'projets', 'image', 'fonts', 'script', 'style', 'modeles_mails'];
        toCopy.forEach(dir => copyDir(resolve(__dirname, dir), resolve(dist, dir)));
        ['robots.txt', 'sitemap.xml', '.nojekyll'].forEach(file => {
          const src = resolve(__dirname, file);
          if (fs.existsSync(src)) {
            fs.copyFileSync(src, resolve(dist, file));
          }
        });
      }
    }
  ]
});
