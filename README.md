# k6 Load Testing Framework

> **Demo project.** This is a reference implementation showing how to structure a k6 performance testing setup. Tests run against [test.k6.io](https://test.k6.io) — a public sandbox — so you can try everything out without needing your own server. Swap `BASE_URL` to point it at your own app when you're ready.

This framework covers three test types (load, stress, spike), streams metrics to InfluxDB, visualizes them in a Grafana dashboard, generates HTML reports, and integrates into CI/CD with automated pass/fail threshold gates.

---

## What it achieves

- **Load test** — verifies the system handles expected traffic: ramp up to 500 VUs, sustain, ramp down
- **Stress test** — finds the breaking point by incrementally increasing load beyond normal capacity
- **Spike test** — simulates a sudden burst (e.g. flash sale) and measures recovery time
- **SLA enforcement** — p95 response time < 500ms and error rate < 1% are checked automatically
- **Observability** — every test run pushes metrics to InfluxDB and surfaces them in a pre-built Grafana dashboard
- **HTML reports** — a self-contained summary report is written to `reports/` after each run
- **CI gate** — GitHub Actions runs tests on every push and fails the build if any threshold is breached

---

## Prerequisites

- [Git](https://git-scm.com)
- [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/) — load testing tool
- [Docker](https://docs.docker.com/get-docker/) + Docker Compose — for InfluxDB and Grafana

Install k6 on macOS:
```bash
brew install k6
```

---

## Setup

**1. Clone the repository**
```bash
git clone https://github.com/your-org/k6-load-testing.git
cd k6-load-testing
```

**2. Start the monitoring stack** (InfluxDB + Grafana)
```bash
docker-compose up -d
```

This starts:
- InfluxDB at `http://localhost:8086` — stores test metrics
- Grafana at `http://localhost:3001` — visualizes them (login: `admin` / `admin`)

Wait a few seconds for both containers to be healthy before running tests.

---

## Running tests

Run any test with plain terminal output:
```bash
k6 run tests/load-test.js
k6 run tests/stress-test.js
k6 run tests/spike-test.js
```

Run with metrics streaming to InfluxDB (requires the monitoring stack to be up):
```bash
k6 run --out influxdb=http://localhost:8086/k6 tests/load-test.js
k6 run --out influxdb=http://localhost:8086/k6 tests/stress-test.js
k6 run --out influxdb=http://localhost:8086/k6 tests/spike-test.js
```

Or use the npm scripts as a shorthand:
```bash
npm run test:load            # plain output
npm run test:load:influx     # + InfluxDB streaming
npm run test:stress:influx
npm run test:spike:influx
```

**Point tests at your own app** by setting `BASE_URL`:
```bash
BASE_URL=https://your-app.com k6 run tests/load-test.js
```

---

## Viewing results

**Terminal** — a summary table is printed at the end of every run showing key metrics and whether thresholds passed or failed.

**HTML report** — after each run a self-contained report is saved to `reports/`. Open it in any browser:
```
reports/load-test-summary.html
reports/stress-test-summary.html
reports/spike-test-summary.html
```

**Grafana dashboard** — open `http://localhost:3001`, navigate to **Dashboards → k6 → k6 Load Testing**. The dashboard auto-refreshes every 10 seconds and shows VU count, request rate, p50/p90/p95/p99 response times, and error rate over time.

---

## CI/CD

The GitHub Actions workflow in `.github/workflows/k6-load-test.yml` runs automatically on every push and pull request to `main`. k6 exits with a non-zero code when any threshold is exceeded, which fails the build.

**Manual runs** — use the "Run workflow" button in the Actions tab to choose the test type (`load`, `stress`, or `spike`) and optionally override the target URL.

**To configure the default target URL** for CI, set a repository variable:
`Settings → Secrets and variables → Actions → Variables → New repository variable`
Name: `BASE_URL`, Value: `https://your-app.com`

HTML reports are uploaded as build artifacts and kept for 30 days.

---

## Project structure

```
k6-load-testing/
├── tests/
│   ├── load-test.js        # 0 → 100 → 500 → 0 VUs over 9 minutes
│   ├── stress-test.js      # Stepped ramp to 500 VUs to find breaking point
│   └── spike-test.js       # Sudden burst: 10 → 500 → 10 VUs
├── config/
│   ├── thresholds.js       # SLA thresholds shared across all tests
│   └── environments.js     # URL + VU cap presets per environment
├── lib/
│   └── helpers.js          # checkResponse, buildHeaders, randomSleep
├── reports/                # HTML reports written here after each run
├── grafana/
│   ├── dashboards/k6-dashboard.json
│   └── provisioning/       # Auto-loaded datasource and dashboard config
├── .github/workflows/
│   └── k6-load-test.yml    # CI/CD pipeline
├── docker-compose.yml
└── package.json
```
