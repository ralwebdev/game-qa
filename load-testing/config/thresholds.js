export function thresholds() {
  const result = { http_req_duration: [`p(95)<${__ENV.P95_MS || 2000}`, `p(99)<${__ENV.P99_MS || 4000}`], http_req_failed: [`rate<${__ENV.MAX_FAILURE_RATE || 0.01}`], checks: [`rate>${__ENV.MIN_CHECK_RATE || 0.99}`] };
  if (__ENV.ABORT_ON_ERROR === 'true') result.http_req_failed.push({threshold:`rate<${__ENV.ABORT_FAILURE_RATE || 0.1}`,abortOnFail:true,delayAbortEval:__ENV.ABORT_DELAY || '30s'});
  for (const name of ['profile','dashboard','modules','theory','bugs','cases','feedback']) result[`http_req_duration{endpoint:${name}}`] = [`p(95)<${__ENV.ENDPOINT_P95_MS || __ENV.P95_MS || 2000}`];
  return result;
}
