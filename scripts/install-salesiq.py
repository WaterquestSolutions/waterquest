"""Keep the approved SalesIQ embed once, immediately before each closing body."""
from pathlib import Path
import re
ROOT = Path(__file__).resolve().parents[1]
INIT = 'window.$zoho=window.$zoho || {};$zoho.salesiq=$zoho.salesiq||{ready:function(){}}'
URL = 'https://salesiq.zohopublic.com/widget?wc=siq9426f675e698dc79d0fe4c2ecca071e3668f732067735a92f72e9aed6636787e'
EMBED = '<script>'+INIT+'</script><script id="zsiqscript" src="'+URL+'" defer></script>'
SCRIPT = re.compile(r'<script\b[^>]*>.*?</script>',re.I|re.S)
changed = 0
pages = sorted((ROOT/'public').rglob('*.html'))
for page in pages:
    original = page.read_text()
    def keep(match):
        block = match.group()
        if block == '<script>'+INIT+'</script>':
            return ''
        if re.search(r'\bid\s*=\s*[\"\x27]zsiqscript[\"\x27]',block,re.I) or ('src=' in block and 'https://salesiq.zohopublic.com/widget?' in block):
            return ''
        return block
    source = SCRIPT.sub(keep,original)
    source, count = re.subn(r'</body>',lambda _: EMBED+'</body>',source,flags=re.I)
    if count != 1:
        raise ValueError(f'Expected one closing body: {page}')
    assert source.count('id="zsiqscript"') == 1
    if source != original:
        page.write_text(source)
        changed += 1
print(f'SalesIQ: {len(pages)} HTML pages checked; {changed} updated; one approved embed immediately before each closing body.')
