import { check } from 'k6';

// Perform standard HTTP response checks
export function checkResponse(res, expectedStatus = 200, maxDuration = 500) {
  return check(res, {
    [`status is ${expectedStatus}`]: (r) => r.status === expectedStatus,
    [`response time < ${maxDuration}ms`]: (r) => r.timings.duration < maxDuration,
  });
}

// Return a random sleep duration between min and max seconds
export function randomSleep(min = 0.5, max = 1.5) {
  return Math.random() * (max - min) + min;
}

// Build default JSON request headers with optional overrides
export function buildHeaders(additionalHeaders = {}) {
  return {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...additionalHeaders,
    },
  };
}

// Log a message prefixed with the current VU and iteration
export function logInfo(message) {
  console.log(`[VU ${__VU} | iter ${__ITER}] ${message}`);
}
