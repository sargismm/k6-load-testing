import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import { thresholds } from '../config/thresholds.js';
import { checkResponse, buildHeaders, randomSleep } from '../lib/helpers.js';

// k6 – Load Test Configuration
const BASE_URL = __ENV.BASE_URL || 'https://test.k6.io';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 VUs
    { duration: '5m', target: 500 },  // Ramp up to peak 500 VUs
    { duration: '2m', target: 0 },    // Ramp down to 0
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
    'reports/load-test-summary.html': htmlReport(data),
    stdout: textSummary(data, { indent: '  ', enableColors: true }),
  };
}
