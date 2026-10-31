import { request } from './requests.js';
export function login(c) {
 const r = request('POST', `${c.base}/auth/login`, JSON.stringify({email:__ENV.TEST_USERNAME,password:__ENV.TEST_PASSWORD}), {headers:{'Content-Type':'application/json'},timeout:c.timeout}, 'login');
 const cookie = r.cookies.gqa_session && r.cookies.gqa_session[0];
 if (r.status !== 200 || !cookie) throw new Error('Preflight login failed; inspect credentials and rate limit');
 return cookie.value;
}
