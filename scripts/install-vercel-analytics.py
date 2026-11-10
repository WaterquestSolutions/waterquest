"""Install Vercel Web Analytics script once, immediately before each closing body."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

# Vercel Analytics inline script and loader
INIT = 'window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };'
SCRIPT_SRC = '/_vercel/insights/script.js'
EMBED = '<script>' + INIT + '</script><script defer src="' + SCRIPT_SRC + '"></script>'

SCRIPT = re.compile(r'<script\b[^>]*>.*?</script>', re.I | re.S)

changed = 0
pages = sorted((ROOT / 'public').rglob('*.html'))

for page in pages:
    original = page.read_text()
    
    def keep(match):
        block = match.group()
        # Remove existing Vercel Analytics scripts
        if block == '<script>' + INIT + '</script>':
            return ''
        if 'src=' in block and '/_vercel/insights/script.js' in block:
            return ''
        return block
    
    source = SCRIPT.sub(keep, original)
    source, count = re.subn(r'</body>', lambda _: EMBED + '</body>', source, flags=re.I)
    
    if count != 1:
        raise ValueError(f'Expected one closing body: {page}')
    
    # Verify we only have one analytics embed
    assert source.count('/_vercel/insights/script.js') == 1
    
    if source != original:
        page.write_text(source)
        changed += 1

print(f'Vercel Analytics: {len(pages)} HTML pages checked; {changed} updated; one analytics embed immediately before each closing body.')
