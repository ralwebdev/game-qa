import { sleep } from 'k6';
import { config } from '../config/environments.js';
import { thresholds } from '../config/thresholds.js';
import { endpoints } from '../helpers/test-data.js';
import { request } from '../helpers/requests.js';
import { login } from '../helpers/auth.js';
// M0 Free Tier safety profiles: Max VUs capped at 50, with conservative stages to protect the 100 ops/sec limit
const profiles = {smoke:[1,60],light:[10,120],medium:[20,180],high:[35,180],target:[50,300],stress:[50,300]};
export function makeOptions(profile) {
 const c=config(), [defaultVus,defaultSeconds]=profiles[profile];
 if (profile==='stress' && (c.env==='production' || __ENV.ALLOW_STRESS!=='true')) throw new Error('Stress requires ALLOW_STRESS=true and a non-production environment');
 const max=Number(__ENV.MAX_VUS || 50), vus=Number(__ENV.PROFILE_VUS || defaultVus), seconds=Number(__ENV.DURATION_SECONDS || defaultSeconds);
 if (!Number.isInteger(max)||max<1||max>1000||!Number.isInteger(vus)||vus<1||vus>max||!Number.isInteger(seconds)||seconds<10||seconds>86400) throw new Error('Invalid VU limit or duration');
 const up=Math.floor(seconds*.2), down=Math.floor(seconds*.2);
 return {stages:[{duration:`${up}s`,target:vus},{duration:`${seconds-up-down}s`,target:vus},{duration:`${down}s`,target:0}],thresholds:thresholds(),summaryTrendStats:['avg','med','p(90)','p(95)','p(99)','min','max'],summaryTimeUnit:'ms'};
}
export function setup() {
 const c=config(), cookie=login(c);
 for (const [name,path] of endpoints) {
  const r=request('GET',c.base+path,null,{cookies:{gqa_session:cookie},timeout:c.timeout},name);
  if (r.status!==200 || !(r.headers['Content-Type']||'').includes('application/json')) throw new Error(`Preflight failed for ${name}: ${r.status}`);
 }
 return {cookie};
}
export default function(data) {
 // Default think time adjusted to 2-4s to ensure 50 concurrent VUs stay safely below 100 DB ops/sec on Atlas M0
 const min=Number(__ENV.THINK_MIN_SECONDS || 2), max=Number(__ENV.THINK_MAX_SECONDS || 4);
 if (!Number.isFinite(min)||!Number.isFinite(max)||min<0||max<min||max>300) throw new Error('Invalid think time');
 for (const [name,path] of endpoints) { request('GET',c.base+path,null,{cookies:{gqa_session:data.cookie},timeout:c.timeout},name); sleep(min+Math.random()*(max-min)); }
}
