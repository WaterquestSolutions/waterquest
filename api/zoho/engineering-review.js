import {industries,fieldDefinitions,validateReview} from '../../public/assets/engineering-review/schema.js';
const origins=new Set(['https://temporary-turbo-nickel-8xnl9g7.vercel.app','https://waterquest-palette-20261016.vercel.app','https://waterquestsolutions.com','https://www.waterquestsolutions.com']);
export const config={maxDuration:30};
export function mapReview(fields,reference){
 const description=['Engineering review request', 'Reference: '+reference,...fieldDefinitions(fields.industry).filter(([key])=>fields[key]).map(([key,label])=>label+': '+(key==='industry'?industries[fields.industry].label:fields[key])),'NDA requested: '+(fields.ndaRequested?'Yes':'No'),'Contact consent: Yes','Marketing signup: No'].join('\n');
 return {First_Name:fields.firstName,Last_Name:fields.lastName,Email:fields.email,Phone:fields.phone,Designation:fields.role,Description:description,Owner:{id:'5069220000000340001'},Lead_Status:'Not Contacted',WQ_Form_Name:'engineering-review',WQ_Web_Enquiry_ID:reference,WQ_Industry:industries[fields.industry].label,WQ_Organisation:fields.company,WQ_Project_Location:fields.location,WQ_Application:fields.application,WQ_Project_Type:fields.projectType,WQ_Product_Interest:fields.productInterest,WQ_Operating_Pressure:fields.pressure?fields.pressure+' '+fields.pressureUnit:'',WQ_Flow_Rate:fields.flow?fields.flow+' '+fields.flowUnit:'',WQ_Fluid_Source:fields.fluidSource,WQ_Project_Timeline:fields.timeline,WQ_Source_Page:'https://temporary-turbo-nickel-8xnl9g7.vercel.app/contact/',WQ_Site_Section:'Engineering review',WQ_Contact_Consent:true,WQ_Marketing_Consent:false,WQ_NDA_Requested:fields.ndaRequested};
}
export function matchesSaved(record,expected){return Object.entries(expected).every(([key,value])=>key==='Owner'?record?.Owner?.id===value.id:typeof value==='boolean'?record?.[key]===value:String(record?.[key]??'').replaceAll('\r\n','\n')===value);}
function reply(res,status,body){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(body));}
async function read(req){if(req.body&&typeof req.body==='object'&&!Buffer.isBuffer(req.body)){if(Buffer.byteLength(JSON.stringify(req.body))>32000)throw Error('too_large');return req.body;}let raw=typeof req.body==='string'?req.body:Buffer.isBuffer(req.body)?req.body.toString():'';if(!raw)for await(const chunk of req){raw+=chunk.toString();if(Buffer.byteLength(raw)>32000)throw Error('too_large');}if(Buffer.byteLength(raw)>32000)throw Error('too_large');return JSON.parse(raw);}
export function makeHandler({fetcher=fetch,env=process.env}={}){return async function handler(req,res){
 if(req.method!=='POST')return reply(res,405,{ok:false,error:'method_not_allowed'});
 if(req.headers.origin&&!origins.has(req.headers.origin))return reply(res,403,{ok:false,error:'origin_not_allowed'});
 if(!(req.headers['content-type']||'').toLowerCase().startsWith('application/json'))return reply(res,415,{ok:false,error:'json_required'});
 let payload;try{payload=await read(req);}catch(e){return reply(res,e.message==='too_large'?413:400,{ok:false,error:'invalid_submission'});}
 if(payload?.source!=='engineering-review'||typeof payload.reference!=='string'||!/^WQ-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(payload.reference||''))return reply(res,400,{ok:false,error:'invalid_submission'});
 const {fields,errors}=validateReview(payload.fields);if(Object.keys(errors).length)return reply(res,400,{ok:false,error:'invalid_submission',fields:errors});
 const {reference}=payload;
 if(!env.ZOHO_CLIENT_ID||!env.ZOHO_CLIENT_SECRET||!env.ZOHO_REFRESH_TOKEN)return reply(res,503,{ok:false,error:'service_not_configured',reference});
 const expected=mapReview(fields,reference);
 try{
 const tokenResponse=await fetcher('https://accounts.zoho.com/oauth/v2/token',{method:'POST',body:new URLSearchParams({grant_type:'refresh_token',client_id:env.ZOHO_CLIENT_ID,client_secret:env.ZOHO_CLIENT_SECRET,refresh_token:env.ZOHO_REFRESH_TOKEN}),signal:AbortSignal.timeout(7000)});
 const token=await tokenResponse.json();if(!tokenResponse.ok||!token.access_token||(token.api_domain&&token.api_domain!=='https://www.zohoapis.com'))throw Error('oauth');
 const headers={Authorization:'Zoho-oauthtoken '+token.access_token,'Content-Type':'application/json'};
 // Explicit assignment and no automatic emails. Receipt means a verified CRM record, not email delivery.
 const create=await fetcher('https://www.zohoapis.com/crm/v8/Leads',{method:'POST',headers,body:JSON.stringify({data:[expected],trigger:[],skip_feature_execution:[{name:'cadences'},{name:'connected_workflows'}]}),signal:AbortSignal.timeout(7000)});
 const body=await create.json(),result=body?.data?.[0];let id;
 if(create.ok&&result?.status==='success'&&result.code==='SUCCESS')id=result.details?.id;
 else if(result?.code==='DUPLICATE_DATA'&&result.details?.api_name==='WQ_Web_Enquiry_ID')id=result.details?.id;
 if(!/^\d+$/.test(id||''))throw Error('create');
 const readback=await fetcher('https://www.zohoapis.com/crm/v8/Leads/'+id,{headers,signal:AbortSignal.timeout(7000)});
 const saved=await readback.json();if(!readback.ok||saved?.data?.[0]?.id!==id||!matchesSaved(saved.data[0],expected))throw Error('readback');
 return reply(res,200,{ok:true,delivery:'crm_verified',reference,recordId:id});
 }catch{return reply(res,502,{ok:false,error:'delivery_unconfirmed',reference});}
};}
export default makeHandler();
