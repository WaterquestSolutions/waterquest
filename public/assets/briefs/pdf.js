import { reportLogo } from '../calculators-v2/brand.js';

// Match the calculator reports: Letter pages, embedded logo and Unicode font,
// navy copy, aqua section headings, repeated masthead and numbered footer.
export async function createBriefPDF(brief, PDFLib, fontkit, fontBytes) {
  const { PDFDocument, rgb } = PDFLib;
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(fontBytes, { subset: true });
  const logo = await doc.embedPng(reportLogo);
  doc.setTitle(brief.title); doc.setAuthor('WaterQuest Solutions');
  doc.setSubject(brief.subtitle);
  const width=612, height=792, margin=44, usable=524;
  const navy=rgb(.035,.09,.16), aqua=rgb(0,.4,.45), pale=rgb(.95,.97,.98);
  const pages=[]; let page, y;
  const clean=text=>String(text??'').replace(/\r\n?/g,'\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'');
  function wrap(text,size,w=usable) {
    const lines=[];
    for(const block of clean(text).split('\n')) {
      let line='';
      for(const word of block.split(/\s+/).filter(Boolean)) {
        const candidate=(line?line+' ':'')+word;
        if(font.widthOfTextAtSize(candidate,size)<=w){line=candidate;continue;}
        if(line)lines.push(line);line='';
        for(const ch of word){if(font.widthOfTextAtSize(line+ch,size)>w){lines.push(line);line='';}line+=ch;}
      }
      lines.push(line);
    }
    return lines;
  }
  function newPage(){
    page=doc.addPage([width,height]);pages.push(page);
    const logoHeight=36*logo.height/logo.width;
    page.drawImage(logo,{x:margin,y:height-28-logoHeight,width:36,height:logoHeight});
    page.drawText('WaterQuest Solutions',{x:margin+48,y:height-48,size:13,font,color:navy});
    page.drawText(brief.kind||'PROJECT BRIEF',{x:margin+48,y:height-63,size:7.5,font,color:aqua});
    page.drawLine({start:{x:margin,y:height-69},end:{x:width-margin,y:height-69},thickness:1,color:aqua});
    y=height-91;
  }
  function ensure(h){if(y-h<52)newPage();}
  function paragraph(text,size=9.5,color=navy){
    for(const line of wrap(text,size)){ensure(size*1.5);page.drawText(line,{x:margin,y,size,font,color});y-=size*1.5;}
    y-=6;
  }
  function heading(text){ensure(85);y-=8;paragraph(text,12,aqua);}
  newPage();paragraph(brief.title,20);paragraph(brief.subtitle,10);
  for(const text of brief.intro||[])paragraph(text);
  for(const section of brief.sections){
    if(section.newPage)newPage();heading(section.title);
    for(const field of section.fields){
      if(brief.worksheet){
        const labels=wrap(field.label,9.5);const h=labels.length*14+30;ensure(h);
        page.drawRectangle({x:margin,y:y-h+10,width:usable,height:h,color:pale});
        labels.forEach((line,i)=>page.drawText(line,{x:margin+6,y:y-i*14,size:9.5,font,color:navy}));
        page.drawLine({start:{x:margin+6,y:y-h+17},end:{x:width-margin-6,y:y-h+17},thickness:.4,color:rgb(.65,.7,.74)});
        y-=h+6;
      }else{
        ensure(48);paragraph(field.label,9.5,aqua);
        paragraph(field.value===false?'Not agreed':field.value===true?'Agreed':String(field.value||'Not provided'));
      }
    }
  }
  for(const text of brief.notes||[])paragraph(text,9);
  pages.forEach((p,i)=>p.drawText(`WaterQuest Solutions | ${i+1} / ${pages.length}`,{x:margin,y:25,size:8,font,color:navy}));
  return doc.save();
}

export function pilotBrief(fields,date=new Date()) {
  const labels={name:'Your name',company:'Organisation',email:'Email',phone:'Phone',province:'Province or territory',applicant:'Applicant / host type',application:'Application and site',stage:'Project stage',timeline:'Target timing',message:'What a successful pilot should demonstrate',consent:'Consent to respond to this enquiry'};
  return {title:'Pilot enquiry - personal copy',kind:'PILOT PROJECT BRIEF',subtitle:'This copy does not confirm submission or email delivery.',intro:[`Saved: ${date.toISOString()}`],sections:[{title:'Your pilot brief',fields:Object.entries(labels).map(([key,label])=>({label,value:fields[key]}))}],notes:['Contact: bruce@waterquestsolutions.com | +1 (604) 902-1902','This brief records the information entered. It is not a quotation, funding application or approved engineering design.']};
}
let assetsPromise;
export function loadBriefAssets(){
  function script(src){return new Promise((resolve,reject)=>{const tag=document.createElement('script');tag.src=src;tag.onload=resolve;tag.onerror=()=>{tag.remove();reject(new Error('PDF support could not load. Please try again.'));};document.head.append(tag);});}
  return assetsPromise??=(async()=>{
    if(!window.PDFLib)await script('/assets/calculators-v2/vendor/pdf-lib.min.js');
    if(!window.fontkit)await script('/assets/calculators-v2/vendor/fontkit.umd.min.js');
    const response=await fetch('/assets/calculators-v2/vendor/DejaVuSans.ttf');
    if(!response.ok)throw new Error('PDF font could not load. Please try again.');
    return response.arrayBuffer();
  })().catch(error=>{assetsPromise=null;throw error;});
}
