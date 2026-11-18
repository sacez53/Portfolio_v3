import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { preview } from 'vite';

const canonical = 'https://sacez53.github.io/Portfolio_v3/';
const projectPath = '/Portfolio_v3/';
const trustPages = ['about/', 'contact/', 'privacy/'];
let server;
let origin;

before(async () => {
    server = await preview({ preview: { host: '127.0.0.1', port: 0 } });
    origin = `http://127.0.0.1:${server.httpServer.address().port}`;
});

after(() => server?.close());

function get(path = '', accept = 'text/html', method = 'GET') {
    return fetch(`${origin}${projectPath}${path}`, { headers: { Accept: accept }, method });
}

function assertRepresentation(response, status, type) {
    assert.equal(response.status, status);
    assert.equal(response.headers.get('content-type').split(';')[0], type);
    assert.match(response.headers.get('vary') ?? '', /(?:^|,\s*)Accept(?:,|$)/i);
}

test('negotiates the homepage and respects Accept weights and exclusions', async () => {
    const cases = [
        ['text/markdown', 'text/markdown', /^# Sacha Guitter/],
        ['TEXT/MARKDOWN; charset="UTF-8"', 'text/markdown', /^# Sacha Guitter/],
        ['text/markdown;q=0.9, text/html;q=0.2', 'text/markdown', /^# Sacha Guitter/],
        ['text/html;q=0.2, text/*;q=0.1, text/markdown;q=0.9', 'text/markdown', /^# Sacha Guitter/],
        ['text/html', 'text/html', /^<!DOCTYPE html>/i],
        ['*/*', 'text/html', /^<!DOCTYPE html>/i],
        ['text/html;q=1, text/markdown;q=0.5', 'text/html', /^<!DOCTYPE html>/i],
        ['text/markdown;q=0, */*', 'text/html', /^<!DOCTYPE html>/i],
        ['text/markdown; charset=iso-8859-1, text/html', 'text/html', /^<!DOCTYPE html>/i],
    ];
    for (const [accept, type, content] of cases) {
        const response = await get('', accept);
        assertRepresentation(response, 200, type);
        assert.match(await response.text(), content, accept);
    }

    for (const url of [`${origin}/`, `${origin}${projectPath}index.html`]) {
        const response = await fetch(url, { headers: { Accept: 'text/markdown' } });
        assertRepresentation(response, 200, 'text/markdown');
        assert.match(await response.text(), /^# Sacha Guitter/);
    }
});

test('returns a real 404 with a helpful body in the selected format', async () => {
    const missing = 'does-not-exist/nested';
    const response = await get(missing, 'text/markdown');
    assertRepresentation(response, 404, 'text/markdown');
    assert.match(response.headers.get('content-type'), /charset=utf-8/i);
    const text = await response.text();
    assert.match(text, /^# Page introuvable\s+[^\r\n]{20,}/);
    assert.match(text, /\]\(https:\/\/sacez53\.github\.io\/Portfolio_v3\/sitemap\.xml\)/);

    const page = await get(missing);
    assertRepresentation(page, 404, 'text/html');
    assert.match(await page.text(), /<h1>Page introuvable<\/h1>/);

    for (const [path, status] of [['', 200], [missing, 404]]) {
        const head = await get(path, 'text/markdown', 'HEAD');
        assertRepresentation(head, status, 'text/markdown');
        assert.ok(Number(head.headers.get('content-length')) > 20);
        assert.equal(await head.text(), '');
    }
});

test('publishes discovery metadata and keeps the portfolio accessible to bot user agents', async () => {
    for (const agent of ['OAI-SearchBot', 'ChatGPT-User', 'GPTBot', 'ClaudeBot', 'PerplexityBot', 'Googlebot']) {
        const response = await fetch(`${origin}${projectPath}`, { headers: { 'User-Agent': agent } });
        assert.equal(response.status, 200, agent);
        await response.arrayBuffer();
    }

    const page = await (await get()).text();
    assert.match(page, /<html lang="fr"[\s>]/i);
    assert.ok(page.includes(`rel="canonical" href="${canonical}"`));
    assert.match(page, /property="og:type" content="website"/);
    assert.ok(page.includes('href="https://github.com/sacez53/Portfolio_v3"'));
    const image = page.match(/property="og:image" content="([^"]+)"/)[1];
    assert.ok(image.startsWith(canonical));
    assert.match((await get(image.slice(canonical.length))).headers.get('content-type'), /^image\//);
    assert.ok(page.includes(`rel="describedby" href="${canonical}llms.txt"`));
    assert.ok(page.includes(`rel="alternate" type="text/markdown" href="${canonical}index.md"`));

    const schema = JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)[1]);
    const site = schema['@graph'].find(item => item['@type'] === 'WebSite');
    const person = schema['@graph'].find(item => item['@type'] === 'Person');
    assert.equal(site.url, canonical);
    assert.equal(person.url, canonical);
    assert.equal(site.author['@id'], person['@id']);
    assert.match(person.name, /Sacha Guitter/i);
    assert.ok(person.description && person.sameAs.length && person.contactPoint.email);
    assert.ok(site.keywords.includes('photographie animalière'));

    for (const path of trustPages) assert.ok(page.includes(`href="./${path}"`) || page.includes(`href="${path}"`));
});

test('serves the trust pages with substantive static content and preserves the old privacy link', async () => {
    const rootRedirect = await fetch(`${origin}/Portfolio_v3?probe=1`, { redirect: 'manual' });
    assert.equal(rootRedirect.status, 308);
    assert.equal(rootRedirect.headers.get('location'), `${projectPath}?probe=1`);
    for (const path of trustPages) {
        const redirect = await fetch(`${origin}${projectPath}${path.slice(0, -1)}`, { redirect: 'manual' });
        assert.equal(redirect.status, 308);
        assert.equal(redirect.headers.get('location'), `${projectPath}${path}`);
        const response = await get(path);
        assert.equal(response.status, 200);
        const page = await response.text();
        assert.match(page, /<h1>[^<]+<\/h1>/);
        assert.ok(page.includes(`rel="canonical" href="${canonical}${path}"`));
        const main = page.match(/<main[^>]*>([\s\S]+?)<\/main>/)[1];
        assert.ok(main.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().length >= 500, path);
        for (const [, resource] of page.matchAll(/(?:href|src)="(\.\.\/[^"#]+)"/g)) {
            const target = new URL(resource, `${origin}${projectPath}${path}`);
            const linked = await fetch(target, { method: 'HEAD' });
            assert.equal(linked.status, 200, target.href);
        }
    }

    const legacy = await get('html/politique-confidentialite.html');
    assert.equal(legacy.status, 200);
    assert.match(await legacy.text(), /http-equiv="refresh" content="0;\s*url=\.\.\/privacy\/"/i);
});

test('publishes robots.txt, sitemap.xml and agent files with working internal links', async () => {
    const robots = await get('robots.txt');
    assert.equal(robots.status, 200);
    assert.match(robots.headers.get('content-type'), /^text\/plain/);
    assert.equal((await robots.text()).replaceAll('\r\n', '\n'), [
        'User-agent: *', 'Disallow: /Portfolio_v3/modeles_mails/',
        'Disallow: /Portfolio_v3/json/backups/', 'Disallow: /Portfolio_v3/tools/',
        '', `Sitemap: ${canonical}sitemap.xml`, '',
    ].join('\n'));

    const sitemap = await get('sitemap.xml');
    assert.equal(sitemap.status, 200);
    assert.match(sitemap.headers.get('content-type'), /^(application|text)\/xml/);
    const xml = await sitemap.text();
    assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>\s*<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
    assert.ok(Buffer.byteLength(xml) < 50 * 1024 * 1024);
    const entries = [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>(\d{4}-\d\d-\d\d)<\/lastmod>[\s\S]*?<\/url>/g)];
    const paths = entries.map(([, url, date]) => {
        assert.ok(url.startsWith(canonical));
        assert.equal(new Date(date).toISOString().slice(0, 10), date);
        return url.slice(canonical.length);
    });

    const catalog = await (await get('json/liste_projets.json')).json();
    const projects = await Promise.all(catalog.map(async path => (await get(path)).json()));
    const projectPages = projects.map(({ slug }) => `html/projet.html?slug=${encodeURIComponent(slug)}`);
    assert.deepEqual(paths.sort(), ['', 'da.html', ...trustPages, ...projectPages].sort());

    const destinations = new Set(paths);
    for (const path of ['llms.txt', 'index.md', '404.md']) {
        const response = await get(path);
        assert.equal(response.status, 200);
        assert.match(response.headers.get('content-type'), path.endsWith('.md') ? /^text\/markdown/ : /^text\/plain/);
        const content = await response.text();
        assert.match(content, /^# [^\r\n]+/);
        if (path === 'llms.txt') {
            assert.match(content, /^# [^\r\n]+\s+> [^\r\n]+/);
            assert.match(content, /Quand consulter ce portfolio/);
            assert.match(content, /\bGET\b/);
            assert.match(content, /https:\/\/github\.com\/sacez53\/Portfolio_v3/);
        }
        const links = [...content.matchAll(/\]\(([^)]+)\)/g)].map(([, href]) => href);
        if (path === 'index.md') {
            const linkedProjects = links.filter(href => href.startsWith(`${canonical}html/projet.html?`));
            assert.deepEqual(linkedProjects.sort(), projectPages.map(page => canonical + page).sort());
        }
        for (const href of links) {
            if (href.startsWith(canonical)) destinations.add(href.slice(canonical.length));
        }
    }
    for (const path of destinations) {
        const response = await get(path, 'text/html', 'HEAD');
        assert.equal(response.status, 200, path || projectPath);
    }
});
