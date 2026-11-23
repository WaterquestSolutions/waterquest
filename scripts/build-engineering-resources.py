"""Generate traceable engineering aids from controlled source records, idempotently."""
from pathlib import Path
import html,json,re,urllib.parse
ROOT=Path(__file__).resolve().parents[1];P=ROOT/'public'
H=html.escape
examples=json.loads((ROOT/'scripts/engineering-data/worked-examples.json').read_text())
guides=json.loads((ROOT/'scripts/guide-manifest.json').read_text())
focus=json.loads((ROOT/'scripts/engineering-data/guide-practical-focus.json').read_text())
def patch(path,key,content,anchor):
 s=path.read_text();start='<!-- EQ:'+key+' -->';end='<!-- /EQ:'+key+' -->';s=re.sub(re.escape(start)+'.*?'+re.escape(end),'',s,flags=re.S)
 i=s.find(anchor)
 if i<0:raise ValueError((path,anchor))
 path.write_text(s[:i]+start+content+end+s[i:])
# A filled arithmetic or decision record belongs beside each guide, not in a sales claim.
for g in guides:
 e=examples[g['family']];slug=g['slug'];record='worked-record-'+slug
 content=f'<section class="eq-record" id="{record}" aria-labelledby="{record}-title"><p>Worked project record · Illustrative, not a field result</p><h2 id="{record}-title">{H(e["title"])}</h2><dl>'+''.join(f'<div><dt>{label}</dt><dd>{H(e[key])}</dd></div>' for label,key in [('Given / known','inputs'),('Calculation or review','check'),('Recorded result','result'),('Release decision','decision')])+f'</dl><h3>Apply this guide to your project</h3><p>{H(focus[slug])}</p><p><strong>Record the evidence:</strong> identify the input source, date, units, measurement location, uncertainty, controlling drawing and responsible reviewer. Replace the illustrative values; do not transfer them to a product rating.</p><small>Engineering aid revision 1 · 23 November 2026. Equations use the stated units. This record supplements the guide and its cited technical sources.</small><div class="eq-actions"><button type="button" data-eq-download="{record}">Download this worked record</button><a href="/project-tools/?family={H(g["family"] if g["family"] in ["pump","cylinder","valve","motor","hpu","ro","maintenance"] else "general")}&amp;source={urllib.parse.quote("/knowledge-hub/"+slug+"/",safe="")}">Prepare your own project brief</a></div></section>'
 patch(P/g['file'],'worked-record',content,'</article>')
# Product gateway: a short decision table before the detailed product marketing.
familyrows=[('Pumps','Delivered flow at pressure; speed and inlet supply','Pump curve, water/filtration limits, shaft and port drawing','axial-piston-pumps'),('Cylinders','Both-direction load, geometry, stroke and timing','Force and return-flow checks; buckling, mounts and holding','water-hydraulic-cylinders'),('Motors','Starting/running torque, speed, duty and case pressure','Torque-speed curves, displacement, shaft loads and drain limits','water-hydraulic-motors'),('Valves & controls','Function, normal/fault state, flow and differential pressure','Circuit symbol, loss curve, leakage, actuation and wiring','water-hydraulic-valves'),('Power units','Movement sequence, overlap, standby and site utilities','P&ID, heat balance, electrical scope, FAT/SAT and service access','water-hydraulics-hpu'),('Seawater pumps','Feed chemistry, temperature, boost supply and shutdown','Seawater construction, filtration, drain and flushing envelope','duplex-seawater-pumps'),('RO Power Centre','Feed/permeate/recovery, salinity, pressure and hours','Confirmed operating envelope, recovery curve and kWh/m³ boundary','power-centre-reverse-osmosis'),('Air motors','Starting/running torque-speed point and available air','Confirmed continuous-duty curve, air use, lubrication and controls','armak-air-motors')]
content='<section class="eq-record" id="engineering-comparison"><h2>Start with the engineering duty</h2><p>Maximum catalogue flow, pressure and power are separate limits. Select a complete operating point and current configuration; do not combine unrelated maxima.</p><table><thead><tr><th scope="col">Equipment</th><th scope="col">Start with</th><th scope="col">Evidence needed</th></tr></thead><tbody>'+''.join(f'<tr><th scope="row"><a href="/products/{slug}/">{H(label)}</a></th><td>{H(duty)}</td><td>{H(evidence)}</td></tr>' for label,duty,evidence,slug in familyrows)+'</tbody></table><p><a href="/project-tools/">Prepare a project brief</a> · <a href="/project-tools/">Prepare an equipment brief</a></p></section>'
s=(P/'products/index.html').read_text();anchor='<section class="wqx-section" id="armak-air-motors"'
# Put the compact engineering gateway immediately after the primary hero.
# Use the stable first product section, preserving the existing hero and range.
match=re.search(r'<section\b[^>]*\bid="pumps"',s)
if match:anchor=match.group()
else:anchor='</main>'
patch(P/'products/index.html','comparison',content,anchor)
# Make access tools and readable quality styles available without requiring JS content insertion.
for path in sorted(P.rglob('*.html')):
 if path.is_relative_to(P/'case-studies'):continue
 s=path.read_text()
 if re.search(r'http-equiv=["\']refresh',s,re.I):continue
 if '/assets/engineering-quality/quality.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="/assets/engineering-quality/quality.css?v=20261123"></head>')
 if '/assets/engineering-quality/quality.js' not in s:s=s.replace('</body>','<script defer src="/assets/engineering-quality/quality.js?v=20261123"></script></body>')
 if '<main' in s and '<!-- EQ:page-tools -->' not in s:
  m=re.search(r'<main\b[^>]*>',s);i=m.end();s=s[:i]+'<!-- EQ:page-tools --><nav class="eq-page-tools" aria-label="Engineering resources"><a href="/products/#engineering-comparison">Choose equipment</a><a href="/site-index/">Search the site</a><a href="/project-tools/">Prepare a brief</a></nav><!-- /EQ:page-tools -->'+s[i:]
 path.write_text(s)
print(f'Engineering resources: {len(guides)} worked guide records; shared access tools.')
