export function config() {
  const env = (__ENV.TEST_ENV || 'staging').toLowerCase();
  if (!['local','staging','production'].includes(env)) throw new Error('Invalid TEST_ENV');
  const origin = __ENV.BASE_URL || '';
  if (!/^https?:\/\/[^/?#@]+\/?$/.test(origin)) throw new Error('BASE_URL must be an HTTP(S) origin without credentials or a path');
  if (__ENV.CONFIRM_BASE_URL !== origin) throw new Error('Set CONFIRM_BASE_URL to exactly match the verified BASE_URL');
  if (env === 'production' && __ENV.ALLOW_PRODUCTION !== 'true') throw new Error('Production requires ALLOW_PRODUCTION=true');
  const path = __ENV.API_BASE_PATH || '/api';
  if (!/^\/[a-zA-Z0-9/_-]*$/.test(path)) throw new Error('Invalid API_BASE_PATH');
  if (!__ENV.TEST_USERNAME || !__ENV.TEST_PASSWORD) throw new Error('Dedicated test credentials required');
  return { env, base: origin.replace(/\/$/,'') + path.replace(/\/$/,''), timeout: __ENV.REQUEST_TIMEOUT || '15s' };
}
