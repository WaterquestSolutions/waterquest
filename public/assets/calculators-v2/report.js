import {displayMeasurements,displayHint} from './display.js';
import {reportLogo} from './brand.js?v=20261015-logo';
import {definitions, validate, sources} from './definitions.js';
import {calculate, convert, unitLabel, conversions} from './engine.js';
const fmt=n=>new Intl.NumberFormat('en-CA',{maximumSignificantDigits:5}).format(Object.is(n,-0)?0:n);
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function createReport(id,values,{us=false,currency='CAD',example=false,date=new Date()}={}){
 const d=definitions[id];
 if(Object.keys(validate(id,values)).length)throw new Error('Correct the highlighted inputs before saving or printing.');
 const result=calculate(id,values),label=u=>unitLabel(u,us,currency);
 const value=(n,u)=>typeof n==='number'?`${fmt(convert(n,u,us))}${u?' '+label(u):''}`:String(n);
 return {id,title:d.title,date:date.toISOString(),mode:`${d.fields.some(f=>conversions[f.unit])?(us?'US customary':'SI metric'):'Financial scenario'}${d.fields.some(f=>f.unit.includes('currency'))?' · '+currency+' (no exchange-rate conversion)':''}`,status:example?'Illustrative example — not project data':'Current project inputs',
 inputs:d.fields.map(f=>({label:f.label,value:f.options?f.options.find(o=>o[0]===values[f.id])[1]:`${Number(convert(values[f.id],f.unit,us).toPrecision(12))}${f.unit?' '+label(f.unit):''}`,hint:displayHint(f.hint,us)})),
 results:result.rows.map(r=>({label:r.label,value:value(r.value,r.unit)})),warnings:result.warnings.map(t=>displayMeasurements(t,us)),notes:result.notes.map(t=>displayMeasurements(t,us)),formula:d.formula,basis:d.reference,
 limitation:d.category==='Costs & carbon'?'Scenario estimate. Confirm input evidence, reporting boundaries and assumptions before using these results.':displayMeasurements('Preliminary calculation. Confirm input evidence, model limits and component ratings before specifying equipment. WaterQuest operating limit: 160 bar, including peaks; use any lower applicable component limit.',us),
 sources:d.refs.map(k=>({title:sources[k][0],url:sources[k][1]})),
 route:`/knowledge-hub/engineering-calculators/${id}-calculator/`};
}
export function reportHTML(r){
 const table=rows=>`<table><thead><tr><th>Parameter</th><th>Value</th></tr></thead><tbody>${rows.map(v=>`<tr><th scope="row">${esc(v.label)}</th><td>${esc(v.value)}</td></tr>`).join('')}</tbody></table>`;
 return `<header><img class="wqc-report-logo" src="${reportLogo}" alt="WaterQuest Solutions logo" width="48" height="48"><div><strong>WaterQuest Solutions</strong><p>ENGINEERING CALCULATION REPORT</p></div></header><h1>${esc(r.title)}</h1><p>${esc(r.mode)} · ${esc(r.date)}</p><p>${esc(r.status)}</p><h2>Inputs used</h2>${table(r.inputs)}<h2>Calculated results</h2>${table(r.results)}${r.warnings.length?'<h2>Warnings</h2>'+r.warnings.map(s=>`<p>${esc(s)}</p>`).join(''):''}<h2>Calculation basis and limits</h2><p>${esc(r.formula)}</p><p>${esc(r.basis)}</p>${r.notes.map(s=>`<p>${esc(s)}</p>`).join('')}<p>${esc(r.limitation)}</p><p>Results display up to five significant digits; displayed digits do not establish measurement or model accuracy.</p><h2>Input guidance</h2>${r.inputs.map(f=>`<p><strong>${esc(f.label)}:</strong> ${esc(f.hint)}</p>`).join('')}<h2>References</h2>${r.sources.map(s=>`<p>${esc(s.title)}<br><a href="${esc(s.url)}">${esc(s.url)}</a></p>`).join('')}<p>Formula/source review: 6 October 2026. Sources explain methods; they do not certify this tool or your design.</p><p>Calculator route: ${esc(r.route)}</p>`;
}
// Shared layout for client downloads and deterministic export regression checks.
export async function createPDF(r,PDFLib,fontkit,fontBytes){
 const {PDFDocument,rgb}=PDFLib,doc=await PDFDocument.create();doc.registerFontkit(fontkit);
 const font=await doc.embedFont(fontBytes,{subset:true}),logo=await doc.embedPng(reportLogo);
 doc.setTitle(r.title);doc.setAuthor('WaterQuest Solutions');doc.setSubject(r.status+'; '+r.mode);
 const width=612,height=792,margin=44,usable=width-2*margin,navy=rgb(.035,.09,.16),aqua=rgb(0,.4,.45);
 let page,y;const pages=[];
 function newPage(){page=doc.addPage([width,height]);pages.push(page);y=height-48;const logoWidth=36,logoHeight=logoWidth*logo.height/logo.width;page.drawImage(logo,{x:margin,y:height-28-logoHeight,width:logoWidth,height:logoHeight});page.drawText('WaterQuest Solutions',{x:margin+48,y,size:13,font,color:navy});page.drawText('ENGINEERING CALCULATION REPORT',{x:margin+48,y:y-15,size:7.5,font,color:aqua});y=height-69;page.drawLine({start:{x:margin,y},end:{x:width-margin,y},thickness:1,color:aqua});y-=22;}
 function ensure(h){if(y-h<48)newPage();}
 function wrap(text,size,w){const lines=[];let line='';for(const word of String(text).split(/\s+/)){if(font.widthOfTextAtSize((line?line+' ':'')+word,size)<=w){line+=(line?' ':'')+word;continue;}if(line)lines.push(line);line='';for(const ch of word){if(font.widthOfTextAtSize(line+ch,size)>w){lines.push(line);line='';}line+=ch;}}if(line)lines.push(line);return lines.length?lines:[''];}
 function paragraph(text,size=9.5,color=navy){const lines=wrap(text,size,usable);ensure(Math.min(lines.length*size*1.5+6,620));for(const line of lines){ensure(size*1.5);page.drawText(line,{x:margin,y,size,font,color});y-=size*1.5;}y-=6;}
 function heading(text,nextText=''){ensure(Math.max(64,33+wrap(nextText,9.5,usable).length*14.25+6));y-=8;paragraph(text,12,aqua);}
 function rows(items){for(const row of items){const left=wrap(row.label,9.5,300),right=wrap(row.value,10,usable-316),h=Math.max(left.length,right.length)*15+12;ensure(h);page.drawRectangle({x:margin,y:y-h+8,width:usable,height:h,color:rgb(.95,.97,.98)});left.forEach((s,i)=>page.drawText(s,{x:margin+6,y:y-i*15,size:9.5,font,color:navy}));right.forEach((s,i)=>page.drawText(s,{x:margin+316,y:y-i*15,size:10,font,color:navy}));y-=h;}}
 newPage();paragraph(r.title,20);paragraph(r.status,11);paragraph(r.mode+' · '+r.date,9);heading('Inputs used');rows(r.inputs);heading('Calculated results');rows(r.results);
 if(r.warnings.length){heading('Warnings');r.warnings.forEach(s=>paragraph(s));}
 heading('Calculation basis and limits',r.formula);paragraph(r.formula);paragraph(r.basis);r.notes.forEach(s=>paragraph(s));paragraph(r.limitation);paragraph('Results display up to five significant digits; displayed digits do not establish measurement or model accuracy.');
 heading('Input guidance');r.inputs.forEach(f=>paragraph(f.label+': '+f.hint));heading('References');r.sources.forEach(s=>{paragraph(s.title);paragraph(s.url,8,aqua);});paragraph('Formula/source review: 6 October 2026. Sources explain methods; they do not certify this tool or your design.');paragraph('Calculator route: '+r.route,8);
 pages.forEach((p,i)=>p.drawText(`${r.title} · ${i+1} / ${pages.length}`,{x:margin,y:25,size:8,font,color:navy}));return doc.save();
}
