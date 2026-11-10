"""Keep industry content inside the containers that supply its responsive styles."""
from html.parser import HTMLParser
from pathlib import Path

VOID_TAGS = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
             'link', 'meta', 'param', 'source', 'track', 'wbr'}


class LayoutCheck(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.errors = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = attrs.get('class', '').split()
        ancestors = [a for _, a in self.stack]
        if 'ind-section' in classes and not any(a.get('id') == 'industry-main' for a in ancestors):
            self.errors.append('Industry section is outside #industry-main')
        in_section = any('ind-section' in a.get('class', '').split() for a in ancestors)
        in_wrap = any('ind-wrap' in a.get('class', '').split() for a in ancestors)
        if tag in {'h1', 'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'figure'} and in_section and not in_wrap:
            self.errors.append(f'<{tag}> in an industry section is outside .ind-wrap')
        if tag not in VOID_TAGS:
            self.stack.append((tag, attrs))

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index][0] == tag:
                self.stack = self.stack[:index]
                break


public = Path(__file__).resolve().parents[1] / 'public'
errors = []
pages = list(public.rglob('*.html'))
for page in pages:
    check = LayoutCheck()
    check.feed(page.read_text())
    errors.extend(f'{page.relative_to(public)}: {error}' for error in check.errors)
if errors:
    raise SystemExit('\n'.join(errors))
print(f'PASS: industry content containers checked across {len(pages)} HTML pages.')
