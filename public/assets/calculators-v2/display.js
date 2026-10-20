import {convert,unitLabel,conversions} from './engine.js';
const fmt=n=>new Intl.NumberFormat('en-CA',{maximumSignificantDigits:5}).format(n);
const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const units=Object.keys(conversions).sort((a,b)=>b.length-a.length).map(escape).join('|');
const measurement=new RegExp(`(-?\\d[\\d,]*(?:\\.\\d+)?(?:e[+-]?\\d+)?)\\s*(${units})(?![\\w/²³])`,'g');
// Apply only to prose about the current scenario. Formula/reference equations retain their declared SI basis.
export function displayMeasurements(text,us=false){
 return us?text.replace(measurement,(_,n,u)=>`${fmt(convert(Number(n.replaceAll(',','')),u,true))} ${unitLabel(u,true)}`):text;
}

export function displayHint(text,us=false){return displayMeasurements(us?text.replace('1 MPa = 10 bar. ','').replace('At standard gravity, 1 tonne mass weighs 9.80665 kN.','At standard gravity, weight in lbf is numerically equal to mass in lb.'):text,us);}
