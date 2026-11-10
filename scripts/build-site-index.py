"""Build the visitor-facing index from current sitemap routes and page titles."""
from pathlib import Path
import html, json, re
from urllib.parse import urlsplit, unquote
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[1]
public = root / 'public'
origin = 'https://temporary-turbo-nickel-8xnl9g7.vercel.app'
link = '<li><a href="/site-index/">Search the site</a></li>'
runtime = public / 'assets/wq-nav-dropdowns.js'
runtime_source = runtime.read_text()
anchor = '<li><a href="/products/#connection-hardware">Connection hardware</a></li>'
runtime_source = runtime_source.replace(link, "")
assert runtime_source.count(anchor) == 1
runtime.write_text(runtime_source.replace(anchor, anchor + link))
for path in public.rglob('*.html'):
    source = path.read_text()
    source = source.replace("/assets/wq-nav-dropdowns.js?v=20261021-site-index", "/assets/wq-nav-dropdowns.js?v=20261021-footer-order")
    def add_link(match):
        footer = match.group()
        footer = footer.replace(link, "").replace('<li><a href="/site-index/">Site Index</a></li>', "")
        anchor = '<li><a href="/products/#connection-hardware">Connection hardware</a></li>'
        if anchor not in footer:
            anchor = '<li>Connection hardware</li>'
        if anchor not in footer:
            raise ValueError(f'Unrecognised footer: {path}')
        return footer.replace(anchor, anchor + link, 1)
    updated, count = re.subn(r'<footer\b.*?</footer>', add_link, source, flags=re.S)
    if count != 1:
        raise ValueError(f'Expected one footer: {path}')
    if updated != path.read_text():
        path.write_text(updated)

redirects = {r['source']: r['destination'] for r in json.loads((root/'vercel.json').read_text())['redirects'] if ':' not in r['source']}
sections = {key: [] for key in ['Main pages', 'Products', 'Industries', 'Knowledge Hub', 'Engineering calculators', 'Sluice gates', 'Glossary']}
seen = set()
for loc in ET.parse(public/'sitemap.xml').getroot().iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc'):
    route = unquote(urlsplit(loc.text).path)
    for _ in range(10):
        if route not in redirects: break
        route = redirects[route]
    if route in seen or route in {'/site-index/', '/downloads/product-literature/'}: continue
    path = public / route.lstrip('/') / 'index.html'
    if not path.is_file(): continue
    source = path.read_text()
    source = source.replace("/assets/wq-nav-dropdowns.js?v=20261021-site-index", "/assets/wq-nav-dropdowns.js?v=20261021-footer-order")
    if re.search(r'<meta[^>]+(?:noindex|http-equiv=["\']refresh)', source, re.I): continue
    title = re.search(r'<title>(.*?)</title>', source, re.S|re.I)
    if not title: continue
    title = html.unescape(re.sub('<[^>]*>', '', title[1])).strip()
    title = re.sub(r'\s*\|\s*WaterQuest(?: Solutions)?.*$', '', title, flags=re.I)
    seen.add(route)
    section = 'Main pages'
    for prefix, name in [('/products/', 'Products'), ('/industries/', 'Industries'), ('/knowledge-hub/', 'Knowledge Hub'), ('/knowledge-hub/engineering-calculators/', 'Engineering calculators'), ('/sluice-gates/', 'Sluice gates'), ('/knowledge-hub/glossary/', 'Glossary')]:
        if route.startswith(prefix): section = name
    sections[section].append((title, route))

source = (public/'knowledge-hub/glossary/index.html').read_text()
head = source[:source.index('</head>')]
head = re.sub(r'<title>.*?</title>|<meta\b(?![^>]*(?:charset|name="viewport"))[^>]*>|<link\b[^>]*rel="(?:canonical|alternate)"[^>]*>|<script\b[^>]*type="application/ld\+json".*?</script>', '', head, flags=re.S|re.I)
head += '<title>Site Index | WaterQuest Solutions</title><meta name="description" content="Browse WaterQuest products, industries, engineering guides, calculators and company pages."><link rel="canonical" href="'+origin+'/site-index/">'
head += '''<style>
.wq-index{max-width:1160px;margin:0 auto;padding:126px 28px 72px}.wq-index h1{margin:0 0 20px}.wq-index-intro{max-width:760px;margin-bottom:24px}.wq-index a{text-decoration:underline;text-underline-offset:4px}.wq-index a:hover{color:#00EEFF}.wq-index :is(a,summary,button):focus-visible{outline:2px solid #00EEFF;outline-offset:4px}.wq-tree-controls{display:flex;flex-wrap:wrap;gap:12px;margin:0 0 28px}.wq-tree-controls[hidden]{display:none}.wq-tree-controls button{font:inherit;color:#fff;background:#122954;border:1px solid #00a3ad;border-radius:6px;padding:9px 18px;cursor:pointer}.wq-tree-controls button:hover{background:#1b3a61}.wq-tree-root{border:1px solid rgba(0,238,255,.35);border-radius:10px;padding:24px;background:#091428}.wq-tree-home{display:inline-block;font-size:1.25rem;font-weight:800;margin-bottom:12px}.wq-tree,.wq-tree ul{display:block!important;list-style:none;margin:0 0 0 10px;padding:0 0 0 26px}.wq-tree li{position:relative;min-width:0;overflow-wrap:anywhere;padding:7px 0;border-left:1px solid rgba(0,238,255,.4)}.wq-tree li:before{content:"";position:absolute;left:0;top:24px;width:20px;border-top:1px solid rgba(0,238,255,.4)}.wq-tree li:last-child{border-left-color:transparent}.wq-tree li:last-child:after{content:"";position:absolute;left:0;top:0;height:24px;border-left:1px solid rgba(0,238,255,.4)}.wq-tree li>a{display:inline-block;margin-left:28px;padding:5px 0;line-height:1.55}.wq-tree details{margin-left:28px}.wq-tree summary{cursor:pointer;padding:5px 0;font-weight:750;line-height:1.55}.wq-tree summary::marker{color:#00EEFF}.wq-tree details[open]>summary{color:#00EEFF}.wq-tree details>ul{margin:8px 0 8px 0}.wq-tree-overview a{font-weight:650}@media(max-width:700px){.wq-index{padding:110px 16px 48px}.wq-index h1{font-size:2.8rem}.wq-tree-root{padding:18px 12px}.wq-tree,.wq-tree ul{padding-left:10px;margin-left:0}.wq-tree li:before{width:12px}.wq-tree li>a,.wq-tree details{margin-left:19px}}
</style></head>'''
nav = re.search(r'<nav\b.*?</nav>', source, re.S)[0]
footer = re.search(r'<footer\b.*?</footer>', source, re.S)[0]
tail = source[source.index('</footer>')+len('</footer>'):]
labels = {
    '/': 'WaterQuest home', '/about/': 'About', '/contact/': 'Engineering Review',
    '/pilot/': 'Pilot', '/wqs-stainless/': 'WQS Stainless',
    '/industries/water-hydraulics-for-marine-and-coastal-applications/': 'Marine and Coastal',
    '/industries/water-hydraulics-for-marine-and-coastal-applications/bilge-pump/': 'Water-actuated bilge isolation',
    '/industries/water-hydraulics-for-desalination-and-reverse-osmosis-systems/': 'Desalination and Reverse Osmosis',
    '/industries/water-hydraulics-for-odor-control-and-ventilation-systems/': 'Odour Control and Ventilation',
    '/industries/water-hydraulics-for-odor-control-and-ventilation-systems/halo-plant-based-odour-control/': 'Halo — plant-based odour control',
    '/products/': 'Products', '/industries/': 'Industries', '/knowledge-hub/': 'Knowledge Hub',
    '/knowledge-hub/engineering-calculators/': 'Engineering calculators',
    '/knowledge-hub/glossary/': 'Glossary', '/sluice-gates/': 'Sluice gates',
    '/products/axial-piston-pumps/': 'Axial piston pumps',
    '/products/axial-piston-pumps/p1/': 'P1 pump',
    '/products/duplex-seawater-pumps/': 'Duplex seawater pumps',
    '/products/water-hydraulic-cylinders/': 'Water hydraulic cylinders',
    '/products/water-hydraulic-motors/': 'Water hydraulic motors',
    '/products/water-hydraulic-valves/': 'Water hydraulic valves',
    '/products/water-hydraulics-hpu/': 'Hydraulic power units',
    '/products/power-centre-reverse-osmosis/': 'Power Centre reverse osmosis',
}
tree = {'children': {}}
for entries in sections.values():
    for title, route in entries:
        if route == '/': continue
        node = tree
        parts = route.strip('/').split('/')
        for i, part in enumerate(parts):
            prefix = '/' + '/'.join(parts[:i+1]) + '/'
            node = node['children'].setdefault(part, {'route': prefix, 'children': {}})
        node['title'] = title

def render_node(node, depth=0):
    route = node['route']
    label = labels.get(route, node.get('title', route.strip('/').split('/')[-1].replace('-', ' ').capitalize()))
    safe_label = html.escape(label)
    safe_route = html.escape(route, quote=True)
    if not node['children'] and route != '/sluice-gates/':
        return f'<li><a href="{safe_route}">{safe_label}</a></li>'
    opened = ' open' if route == '/products/' else ''
    result = f'<li><details{opened}><summary>{safe_label}</summary><ul>'
    if 'title' in node:
        result += f'<li class="wq-tree-overview"><a href="{safe_route}">{safe_label} overview</a></li>'
    for child in sorted(node['children'].values(), key=lambda n: labels.get(n['route'], n.get('title', n['route'])).casefold()):
        result += render_node(child, depth+1)
    return result + '</ul></details></li>'

main = '''<main id="waterquest-main" class="wq-index"><h1>Site Index</h1><p class="wq-index-intro">Explore the site tree. Expand a section to see its pages, then select a page to open it.</p><div class="wq-tree-controls" hidden><button type="button" data-tree-action="expand">Expand all</button><button type="button" data-tree-action="collapse">Collapse all</button></div><nav class="wq-tree-root" aria-label="Site tree"><a class="wq-tree-home" href="/">WaterQuest home</a><ul class="wq-tree">'''
for node in sorted(tree['children'].values(), key=lambda n: labels.get(n['route'], n.get('title', n['route'])).casefold()):
    main += render_node(node)
main += '''</ul></nav></main><script>
(function(){
  const index=document.querySelector('.wq-index');
  const controls=index.querySelector('.wq-tree-controls');
  controls.hidden=false;
  controls.addEventListener('click',function(event){
    const button=event.target.closest('button[data-tree-action]');
    if(!button)return;
    const expanded=button.dataset.treeAction==='expand';
    index.querySelectorAll('details').forEach(function(branch){branch.open=expanded;});
  });
})();
</script>'''
search_items = ''.join('<li><a href="'+html.escape(route,quote=True)+'">'+html.escape(labels.get(route,title))+'</a><small> '+html.escape(section)+'</small></li>' for section,entries in sections.items() for title,route in entries)
search = '<section class="wqx-card"><label for="site-search">Find a product, topic or tool</label><input id="site-search" type="search" placeholder="Try P60, corrosion or project brief"><p id="site-search-count" role="status"></p><ul id="site-search-results" hidden>'+search_items+'</ul></section>'
main = main.replace('<div class="wq-tree-controls" hidden>',search+'<div class="wq-tree-controls" hidden>',1)
main += """<script>document.getElementById('site-search').addEventListener('input',function(){const q=this.value.trim().toLowerCase();const results=document.getElementById('site-search-results');let n=0;results.querySelectorAll('li').forEach(li=>{li.hidden=!!q&&!li.textContent.toLowerCase().includes(q);if(!li.hidden)n++;});results.hidden=!q;document.querySelector('.wq-tree-root').hidden=!!q;document.querySelector('.wq-tree-controls').hidden=!!q;document.getElementById('site-search-count').textContent=q?n+' matching '+(n===1?'page':'pages'):'Browse all sections below.';});</script>"""
out = public/'site-index/index.html' 
out.parent.mkdir(exist_ok=True)
out.write_text(head+'<body class="wq-audited wq-consistent">'+nav+main+footer+tail)
sitemap = public/'sitemap.xml'
xml = sitemap.read_text()
if origin+'/site-index/' not in xml:
    sitemap.write_text(xml.replace('</urlset>', '<url><loc>'+origin+'/site-index/</loc></url>\n</urlset>'))
print(f'Site Index: {len(seen)} destinations in {sum(bool(v) for v in sections.values())} sections; footer link on every HTML page.')
