// Shared SLA thresholds — used across all test scenarios
// Benchmark targets: p95 < 480ms, 99.8%+ success rate

export const thresholds = {
  // 95th percentile response time must stay below 500ms (SLA requirement)
  'http_req_duration': ['p(95)<500'],

  // Error rate must stay below 1% (≥ 99% success rate)
  'http_req_failed': ['rate<0.01'],

  // 99th percentile for all requests should be under 1 second
  'http_req_duration{scenario:default}': ['p(99)<1000'],
};

// Strict thresholds for CI gates — fail the build if exceeded
export const ciThresholds = {
  'http_req_duration': ['p(95)<500', 'p(99)<1000'],
  'http_req_failed': ['rate<0.01'],
  'http_reqs': ['rate>10'],  // Minimum throughput: at least 10 req/s
};
