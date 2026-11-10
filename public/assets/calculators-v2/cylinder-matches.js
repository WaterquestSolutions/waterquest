export const cylinders=[[32,16],[32,20],[40,25],[50,25],[50,30],[64,30],[64,40],[80,50],[100,60],[100,80],[125,80]];
// Force screen only. The 160 bar range limit is not a structural/load-holding approval.
export function matchCylinders(v){
 if(!['pressure','back','eff','load','sf'].every(k=>typeof v[k]==='number'&&Number.isFinite(v[k]))||v.pressure<=0||v.pressure>160||v.back<0||v.back>160||v.eff<=0||v.eff>100||v.load<=0||v.sf<1)return [];
 const required=v.load*v.sf;
 return cylinders.map(([bore,rod])=>{const a=Math.PI*bore*bore/4,ann=Math.PI*(bore*bore-rod*rod)/4;return {bore,rod,extension:(v.pressure*a-v.back*ann)*v.eff/1e6,retraction:(v.pressure*ann-v.back*a)*v.eff/1e6,required,url:`/products/water-hydraulic-cylinders/cylinder-${bore}x${rod}/`};}).filter(c=>c.extension>=required).sort((a,b)=>Math.hypot(a.bore-(v.bore||0),a.rod-(v.rod||0))-Math.hypot(b.bore-(v.bore||0),b.rod-(v.rod||0))||a.bore-b.bore||a.rod-b.rod);
}
