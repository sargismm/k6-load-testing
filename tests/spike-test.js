import http from 'k6/http';
import { sleep, group } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import { thresholds } from '../config/thresholds.js';
import { checkResponse, buildHeaders, randomSleep } from '../lib/helpers.js';

// k6 – Spike Test Configuration
// Simulates a sudden dramatic increase in traffic (e.g., flash sale, news event)
const BASE_URL = __ENV.BASE_URL || 'https://test.k6.io';

export const options = {
  stages: [
    { duration: '1m',  target: 10  },  // Baseline — normal traffic
    { duration: '30s', target: 500 },  // Spike — sudden burst to peak
    { duration: '3m',  target: 500 },  // Hold the spike
    { duration: '1m',  target: 10  },  // Recovery — back to baseline
    { duration: '30s', target: 0   },  // Ramp down
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
    'reports/spike-test-summary.html': htmlReport(data),
    stdout: textSummary(data, { indent: '  ', enableColors: true }),
  };
}
