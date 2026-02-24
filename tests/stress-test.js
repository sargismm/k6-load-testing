import http from 'k6/http';
import { sleep, group } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import { thresholds } from '../config/thresholds.js';
import { checkResponse, buildHeaders, randomSleep } from '../lib/helpers.js';

// k6 – Stress Test Configuration
// Gradually increases load beyond normal capacity to find breaking point
const BASE_URL = __ENV.BASE_URL || 'https://test.k6.io';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Warm up
    { duration: '5m', target: 200 },   // Below normal load
    { duration: '2m', target: 300 },   // Normal load
    { duration: '5m', target: 300 },   // Sustain normal load
    { duration: '2m', target: 400 },   // Above normal load
    { duration: '5m', target: 400 },   // Sustain above normal
    { duration: '2m', target: 500 },   // Peak load
    { duration: '5m', target: 500 },   // Sustain peak load
    { duration: '2m', target: 0 },     // Recovery ramp down
  ],
  thresholds,
};

export default function () {
  group('homepage', () => {
    const res = http.get(`${BASE_URL}/`, buildHeaders());
    checkResponse(res);
    sleep(randomSleep(0.5, 1.5));
  });

  group('secondary page', () => {
    const res = http.get(`${BASE_URL}/contacts.php`, buildHeaders());
    checkResponse(res);
    sleep(randomSleep(0.3, 0.8));
  });
}

export function handleSummary(data) {
  return {
    'reports/stress-test-summary.html': htmlReport(data),
    stdout: textSummary(data, { indent: '  ', enableColors: true }),
  };
}
