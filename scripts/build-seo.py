"""Generate crawler discovery files from canonical, indexable public HTML pages."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import quote, unquote, urlsplit
from xml.sax.saxutils import escape
import argparse, json, re

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
ORIGIN = 'https://temporary-turbo-nickel-8xnl9g7.vercel.app'

class Metadata(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonicals, self.robots, self.refresh = [], [], []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'link' and 'canonical' in a.get('rel', '').lower().split():
            self.canonicals.append(a.get('href', ''))
        if tag == 'meta' and a.get('name', '').lower() in ('robots', 'googlebot'):
            self.robots.append(a.get('content', '').lower())
        if tag == 'meta' and a.get('http-equiv', '').lower() == 'refresh':
            self.refresh.append(a.get('content', ''))

def build(check=False):
    redirects = {unquote(r['source']): r['destination'] for r in json.loads((ROOT / 'vercel.json').read_text())['redirects'] if ':' not in r['source']}
    urls, errors = [], []
    for path in sorted(PUBLIC.rglob('*.html')):
        relative = path.relative_to(PUBLIC).as_posix()
        route = '/' + (relative[:-10] if relative.endswith('index.html') else relative)
        source = path.read_text()
        meta = Metadata(); meta.feed(source)
        if route in redirects or meta.refresh or any('noindex' in value for value in meta.robots):
            continue
        expected = ORIGIN + quote(route, safe='/')
        if meta.canonicals != [expected]:
            errors.append(f'{route}: expected one canonical {expected}, found {meta.canonicals}')
        urls.append(expected)
    if errors:
        raise SystemExit('\n'.join(errors))
    assert len(urls) == len(set(urls)), 'Duplicate canonical URLs'
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(f'  <url><loc>{escape(url)}</loc></url>\n' for url in sorted(urls)) + '</urlset>\n'
    robots = '# Public content is crawlable by search and AI crawlers.\n# This wildcard includes Googlebot, Bingbot, OAI-SearchBot, GPTBot,\n# ChatGPT-User, ClaudeBot, Claude-SearchBot and PerplexityBot.\nUser-agent: *\nDisallow: /api/\nAllow: /\n\nSitemap: ' + ORIGIN + '/sitemap.xml\n'
    for filename, content in [('sitemap.xml', xml), ('robots.txt', robots)]:
        path = PUBLIC / filename
        if check:
            if not path.exists() or path.read_text() != content:
                raise SystemExit(f'{filename} is stale; run python3 scripts/build-seo.py')
        else:
            path.write_text(content)
    print(f'SEO: {len(urls)} canonical indexable pages; sitemap and robots {"verified" if check else "generated"}.')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(); parser.add_argument('--check', action='store_true')
    build(parser.parse_args().check)
