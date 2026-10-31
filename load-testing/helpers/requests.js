import http from 'k6/http';
import { check } from 'k6';
import { Counter } from 'k6/metrics';
const status = new Counter('response_status');
export function request(method, url, body, params, name) {
  const res = http.request(method, url, body, {...params, redirects:0, tags:{endpoint:name,name}});
  status.add(1, {status:String(res.status),endpoint:name});
  check(res, { [`${name}: HTTP 200`]: r => r.status === 200, [`${name}: JSON`]: r => (r.headers['Content-Type'] || '').includes('application/json') });
  return res;
}
