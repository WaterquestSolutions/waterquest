"""Add Vercel Web Analytics to all HTML pages in the head section."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

# Vercel Analytics script for static HTML sites
ANALYTICS_SCRIPT = '''<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>'''

# Pattern to match existing Vercel Analytics scripts
VA_SCRIPT_PATTERN = re.compile(
    r'<script[^>]*>\s*window\.va\s*=.*?</script>\s*<script[^>]*src="/_vercel/insights/script\.js"[^>]*></script>',
    re.I | re.S
)

changed = 0
pages = sorted((ROOT / 'public').rglob('*.html'))

for page in pages:
    original = page.read_text()
    
    # Check if analytics is already present
    if VA_SCRIPT_PATTERN.search(original):
        continue
    
    # Add analytics script right before closing </head> tag
    source, count = re.subn(
        r'</head>',
        lambda _: ANALYTICS_SCRIPT + '\n</head>',
        original,
        flags=re.I
    )
    
    if count != 1:
        raise ValueError(f'Expected one closing head tag: {page}')
    
    if source != original:
        page.write_text(source)
        changed += 1

print(f'Vercel Analytics: {len(pages)} HTML pages checked; {changed} updated; script added to head section.')
