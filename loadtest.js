import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Game QA Academy - Safe k6 Load Test
 *
 * Sized for:
 * - AWS Lightsail Ubuntu 2GB RAM
 * - MongoDB Atlas M0 Free Tier (Max 500 connections, Max 100 ops/sec)
 *
 * Safeguards:
 * 1. Target VUs capped at 50 users (staged ramp-up, steady state, and graceful cooldown).
 * 2. Paced think times (2s to 4s) between requests prevent request flooding.
 * 3. Health & performance thresholds protect latency and error budget (95th percentile < 2000ms, failure rate < 1%).
 */

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
const USERNAME = __ENV.TEST_USERNAME || 'dedicated-test-account@example.invalid';
const PASSWORD = __ENV.TEST_PASSWORD || 'password123';
const TARGET_VUS = Number(__ENV.TARGET_VUS || 50);

export const options = {
  stages: [
    { duration: '30s', target: Math.round(TARGET_VUS * 0.2) }, // Ramp up to 10 VUs
    { duration: '60s', target: TARGET_VUS },                   // Ramp up to 50 VUs
    { duration: '120s', target: TARGET_VUS },                  // Sustain 50 VUs
    { duration: '30s', target: 0 },                            // Graceful cooldown
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<4000'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
  summaryTrendStats: ['avg', 'med', 'p(90)', 'p(95)', 'p(99)', 'min', 'max'],
};

// Main read endpoints to load test safely
const ENDPOINTS = [
  { name: 'profile', path: '/api/auth/me' },
  { name: 'dashboard', path: '/api/dashboard' },
  { name: 'modules', path: '/api/modules' },
  { name: 'theory', path: '/api/theory' },
  { name: 'bugs', path: '/api/bugs' },
  { name: 'cases', path: '/api/cases' },
  { name: 'feedback', path: '/api/feedback' },
];

export function setup() {
  const loginUrl = `${BASE_URL}/api/auth/login`;
  const payload = JSON.stringify({ email: USERNAME, password: PASSWORD });
  const params = {
    headers: { 'Content-Type': 'application/json' },
    timeout: '15s',
  };

  const loginRes = http.post(loginUrl, payload, params);
  const cookie = loginRes.cookies.gqa_session && loginRes.cookies.gqa_session[0];

  if (loginRes.status !== 200 || !cookie) {
    throw new Error(
      `Setup login failed with status ${loginRes.status}: ${loginRes.body}. Check TEST_USERNAME and TEST_PASSWORD.`
    );
  }

  // Preflight check each endpoint once before starting load
  const sessionCookie = cookie.value;
  for (const ep of ENDPOINTS) {
    const res = http.get(`${BASE_URL}${ep.path}`, {
      cookies: { gqa_session: sessionCookie },
      timeout: '15s',
    });
    if (res.status !== 200) {
      throw new Error(`Preflight check failed for ${ep.name} (${ep.path}): HTTP ${res.status}`);
    }
  }

  return { sessionCookie };
}

export default function (data) {
  const authHeaders = {
    cookies: { gqa_session: data.sessionCookie },
    timeout: '15s',
  };

  for (const ep of ENDPOINTS) {
    const res = http.get(`${BASE_URL}${ep.path}`, authHeaders);

    check(res, {
      [`${ep.name} status is 200`]: (r) => r.status === 200,
      [`${ep.name} returns JSON`]: (r) =>
        (r.headers['Content-Type'] || '').includes('application/json'),
    });

    // Paced sleep (2.0 to 4.0 seconds) ensures 50 VUs stay well within MongoDB Atlas M0 100 ops/sec limit
    sleep(2.0 + Math.random() * 2.0);
  }
}
