// Environment configurations for different deployment targets
// Usage: k6 run -e ENVIRONMENT=staging tests/load-test.js

const environments = {
  local: {
    baseUrl: 'http://localhost:3000',
    maxVUs: 50,
    influxUrl: 'http://localhost:8086/k6',
  },
  staging: {
    baseUrl: 'https://staging.example.com',
    maxVUs: 500,
    influxUrl: 'http://localhost:8086/k6',
  },
  production: {
    baseUrl: 'https://api.example.com',
    maxVUs: 200,
    influxUrl: 'http://localhost:8086/k6',
  },
  // Public k6 test endpoint — safe for smoke/sanity checks
  demo: {
    baseUrl: 'https://test.k6.io',
    maxVUs: 100,
    influxUrl: 'http://localhost:8086/k6',
  },
};

export function getEnvironment() {
  const envName = __ENV.ENVIRONMENT || 'demo';
  const env = environments[envName];
  if (!env) {
    throw new Error(`Unknown environment: "${envName}". Valid options: ${Object.keys(environments).join(', ')}`);
  }
  return env;
}

export const BASE_URL = __ENV.BASE_URL || getEnvironment().baseUrl;
