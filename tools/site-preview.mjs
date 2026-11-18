import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const projectPath = '/Portfolio_v3';
const directories = ['/about', '/contact', '/privacy'];
const html = 'text/html; charset=utf-8';
const markdown = 'text/markdown; charset=utf-8';

function wantsMarkdown(header = '') {
    const ranges = header.match(/(?:"(?:\\.|[^"\\])*"|[^,"])+/g) ?? [];
    const preferences = ranges.flatMap(range => {
        const [type, ...parameters] = range.toLowerCase().split(';').map(part => part.trim());
        if (!['text/markdown', 'text/html', 'text/*', '*/*'].includes(type)) return [];

        let weight = 1;
        let specificity = type === '*/*' ? 0 : type === 'text/*' ? 2 : 4;
        for (const parameter of parameters) {
            if (/^charset\s*=\s*(?:utf-8|"utf-8")$/.test(parameter)) {
                specificity += 1;
            } else if (/^q=(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(parameter)) {
                weight = Number(parameter.slice(2));
            } else if (parameter) {
                return [];
            }
        }
        return [{ type, weight, specificity }];
    }).sort((a, b) => b.specificity - a.specificity || b.weight - a.weight);

    const preferred = type => preferences.find(range => [type, 'text/*', '*/*'].includes(range.type));
    const md = preferred('text/markdown');
    const page = preferred('text/html');
    return md?.type === 'text/markdown' && md.weight > 0 && md.weight >= (page?.weight ?? 0);
}

function varyOnAccept(res) {
    const vary = res.getHeader('Vary');
    res.setHeader('Vary', vary ? `${vary}, Accept` : 'Accept');
}

export function agentPreview() {
    return {
        name: 'portfolio-agent-preview',
        async configurePreviewServer(server) {
            const dist = resolve(server.config.root, server.config.build.outDir);
            const [home, missing, errorPage] = await Promise.all(
                ['index.md', '404.md', '404.html'].map(file => readFile(resolve(dist, file)))
            );

            function send(req, res, status, type, body) {
                res.writeHead(status, { 'Content-Type': type, 'Content-Length': body.length });
                res.end(req.method === 'HEAD' ? undefined : body);
            }

            server.middlewares.use((req, res, next) => {
                if (req.method !== 'GET' && req.method !== 'HEAD') return next();

                const url = new URL(req.url, 'http://localhost');
                if (url.pathname === projectPath) {
                    res.writeHead(308, { Location: `${projectPath}/${url.search}` });
                    return res.end();
                }
                const prefix = url.pathname.startsWith(`${projectPath}/`) ? projectPath : '';
                const path = url.pathname.slice(prefix.length);
                if (directories.includes(path)) {
                    res.writeHead(308, { Location: `${prefix}${path}/${url.search}` });
                    return res.end();
                }

                if (path === '/index.md') return send(req, res, 200, markdown, home);
                if (path === '/404.md') return send(req, res, 200, markdown, missing);
                if (path === '/' || path === '/index.html') {
                    varyOnAccept(res);
                    if (wantsMarkdown(req.headers.accept)) return send(req, res, 200, markdown, home);
                }
                const directoryIndex = path === '/' || directories.some(dir => `${dir}/` === path);
                req.url = path + (directoryIndex ? 'index.html' : '') + url.search;
                next();
            });

            return () => server.middlewares.use((req, res, next) => {
                if (req.method !== 'GET' && req.method !== 'HEAD') return next();

                varyOnAccept(res);
                return wantsMarkdown(req.headers.accept)
                    ? send(req, res, 404, markdown, missing)
                    : send(req, res, 404, html, errorPage);
            });
        },
    };
}
