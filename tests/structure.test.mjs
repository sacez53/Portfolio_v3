import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { getRepositoryDir, getSiteDir } from '../tools/projectmanager/src/paths.js';
import { getAuthFilePath } from '../tools/projectmanager/src/auth.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const dist = join(root, 'dist');
const optionalPaper = 'pdf/Portfolio-Sacha-Guitter-Edition-Papier.pdf';
function files(dir) {
    return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const target = join(dir, entry.name);
        return entry.isDirectory() ? files(target) : [target];
    });
}
function assertTarget(base, ref, originFile) {
    if (!ref || /^(?:#|mailto:|tel:|data:|javascript:|https?:|\/\/)/i.test(ref)) return;
    const pathname = decodeURIComponent(ref.split(/[?#]/)[0]).replace(/^\/Portfolio_v3(?=\/|$)/, '');
    if (!pathname) return;
    const target = pathname.startsWith('/') ? resolve(base, '.' + pathname) : resolve(dirname(originFile), pathname);
    const rel = relative(base, target).replaceAll('\\', '/');
    if (base === src && ['index.md', '404.md'].includes(rel)) {
        assert.ok(existsSync(join(root, 'content/agent', rel === 'index.md' ? 'home.md' : rel)));
        return;
    }
    // The printed portfolio already lives outside Git because of its size.
    if (rel === optionalPaper && !existsSync(join(src, optionalPaper))) return;
    assert.ok(existsSync(target), `${relative(root, originFile)} -> ${ref}`);
    if (statSync(target).isDirectory()) assert.ok(existsSync(join(target, 'index.html')), target);
}

test('resolves the source tree and keeps authentication at repository level', () => {
    assert.equal(getSiteDir(root), src);
    assert.equal(getSiteDir(src), src);
    assert.equal(getRepositoryDir(root), root);
    assert.equal(getRepositoryDir(src), root);
    assert.equal(getAuthFilePath(src), getAuthFilePath(root));
});

test('keeps page and CSS resource references valid in sources and production', () => {
    for (const base of [src, dist]) {
        for (const file of files(base).filter(file => /\.(html|css)$/.test(file))) {
            const text = readFileSync(file, 'utf8');
            for (const [, , ref] of text.matchAll(/\b(?:href|src)\s*=\s*(["'])(.*?)\1/g)) assertTarget(base, ref, file);
            for (const [, ref] of text.matchAll(/url\(\s*["']?([^\s)'";]+)["']?\s*\)/g)) assertTarget(base, ref, file);
        }
    }
});

test('keeps catalog, project media and CV paths relative to the web root', () => {
    const catalog = JSON.parse(readFileSync(join(src, 'json/liste_projets.json')));
    for (const base of [src, dist]) {
        for (const ref of catalog) {
            const project = JSON.parse(readFileSync(join(base, ref)));
            for (const image of project.images ?? []) assertTarget(base, image, join(base, 'index.html'));
        }
        const info = JSON.parse(readFileSync(join(base, 'json/infos.json')));
        assertTarget(base, info.cv.url, join(base, 'index.html'));
        assertTarget(base, info.portfolioPapier.url, join(base, 'index.html'));
    }
});

test('keeps local tools, email templates, previews and backups outside production', () => {
    for (const name of ['tools', 'templates', 'modeles_mails', 'docs', 'output', '.pm-auth.json', 'json/backups']) {
        assert.equal(existsSync(join(dist, name)), false, name);
    }
});
