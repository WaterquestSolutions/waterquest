import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const guides=JSON.parse(fs.readFileSync('scripts/guide-manifest.json','utf8'));
const pages=guides.map(g=>({guide:g,html:fs.readFileSync(path.join('public',g.file),'utf8')}));
const article=n=>pages.find(p=>p.guide.number===n).html;
test('Product identifiers and dimensionless coefficients are not converted as physical quantities',()=>{
 const all=pages.map(p=>p.html).join('');
 assert.doesNotMatch(all,/Series 3L\s*\(0\.793 US gal\)/);
 const p15=fs.readFileSync('public/products/axial-piston-pumps/p15/index.html','utf8');
 assert.match(p15,/PC160-12W/);assert.doesNotMatch(p15,/19W\s*\([\d.]+ hp\)/);assert.doesNotMatch(p15,/100L\s*\([\d.]+ US gal\)/);
});
test('Hypothetical examples do not imply named third-party participation',()=>{
 for(const {html} of pages)assert.doesNotMatch(html,/Musqueam|Algoma Steel/);
});
test('Retired article addresses redirect directly to existing canonical pages',()=>{
 const release=JSON.parse(fs.readFileSync('docs/editorial-release-20261021.json','utf8'));
 const config=JSON.parse(fs.readFileSync('vercel.json','utf8'));
 const migration=JSON.parse(fs.readFileSync('docs/launch-url-migration.json','utf8')); 
 for(const [oldSlug,newSlug] of Object.entries(release.redirects)){
  const redirect=config.redirects.find(r=>r.source===`/knowledge-hub/${oldSlug}/`);
  assert.equal(redirect?.statusCode,301);
  const expected=migration[`/knowledge-hub/${newSlug}/`]||`/knowledge-hub/${newSlug}/`;
  assert.equal(redirect.destination,expected);
  assert.ok(fs.existsSync(`public${expected}index.html`));
  assert.ok(!fs.existsSync(`public/knowledge-hub/${oldSlug}/index.html`));
 }
});
