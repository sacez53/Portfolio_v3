import { resolve } from 'path';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { agentPreview } from './tools/build/site-preview.mjs';

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === 'backups' || entry.name.startsWith('.')) continue;
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
  root: resolve(__dirname, 'src'),
  publicDir: false,
  appType: 'mpa',
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        projet: resolve(__dirname, 'src/html/projet.html'),
        da: resolve(__dirname, 'src/da.html'),
        mentions: resolve(__dirname, 'src/html/mentions-legales.html'),
        politique: resolve(__dirname, 'src/html/politique-confidentialite.html'),
        about: resolve(__dirname, 'src/about/index.html'),
        contact: resolve(__dirname, 'src/contact/index.html'),
        privacy: resolve(__dirname, 'src/privacy/index.html'),
      },
    },
  },
  plugins: [
    agentPreview(),
    {
      name: 'copy-static-assets',
      closeBundle() {
        const dist = resolve(__dirname, 'dist');
        const toCopy = ['json', 'projets', 'image', 'fonts', 'script', 'style', 'pdf'];
        toCopy.forEach(dir => copyDir(resolve(__dirname, 'src', dir), resolve(dist, dir)));
        ['robots.txt', 'sitemap.xml', '.nojekyll', 'llms.txt', '404.html'].forEach(file => {
          const src = resolve(__dirname, 'src', file);
          if (fs.existsSync(src)) {
            fs.copyFileSync(src, resolve(dist, file));
          }
        });
        fs.copyFileSync(resolve(__dirname, 'content/agent/home.md'), resolve(dist, 'index.md'));
        fs.copyFileSync(resolve(__dirname, 'content/agent/404.md'), resolve(dist, '404.md'));
      }
    }
  ]
});
