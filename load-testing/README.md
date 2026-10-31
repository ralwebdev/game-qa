# Game QA Academy load testing

Run k6 on a **separate load generator**, never the 2 GB application instance. This suite makes one login POST, then GET requests only; it never registers, modifies data, uploads files, issues certificates or calls paid services. It shares one dedicated test account session read-only, so it does not model login concurrency or different users' data sizes. Use authorized, representative staging data. See [project analysis](reports/project-analysis.md) for the actual routes and limitations.

## Setup and safety

Install [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/) and Python 3 on the generator; Bash is required for Linux and PowerShell for Windows. Python 3 and Bash are also needed on Linux for host monitoring. Ensure sufficient generator CPU, network and disk, and check generator saturation independently. Raw k6 samples can be large and contain target URLs and timings; `reports/runs/` is git-ignored. Protect and delete these artifacts according to your policy. Do not save credentials in tracked files. `.env.example` is documentation and is not loaded automatically.

Set `BASE_URL` to a verified origin and `CONFIRM_BASE_URL` to the identical value. `TEST_ENV` defaults to staging, but is a user-provided label: **the script cannot determine whether an arbitrary URL is production**. Verify the target independently; for production set `TEST_ENV=production` and `ALLOW_PRODUCTION=true` only with explicit authorization. Stress is prohibited for production and requires `ALLOW_STRESS=true` plus an explicitly higher `MAX_VUS`. Never mislabel a production target. Use a dedicated account with representative read-only data; login rate limiting is 30 requests per 15 minutes per source IP. Failed preflight stops the run. The account requires access to all seven GET endpoints. The session is reused across VUs, so credential compromise affects the account; use a dedicated staging account.

Linux example (enter credentials securely into environment using your secret manager):

```bash
export BASE_URL=http://localhost:5000 CONFIRM_BASE_URL=http://localhost:5000 TEST_ENV=local
export TEST_USERNAME='dedicated-test-account@example.invalid'
read -rs -p 'Test password: ' TEST_PASSWORD; export TEST_PASSWORD; echo
bash load-testing/scripts/run-tests.sh smoke
bash load-testing/scripts/run-tests.sh light
```

Windows PowerShell:

```powershell
$env:BASE_URL='http://localhost:5000'; $env:CONFIRM_BASE_URL=$env:BASE_URL; $env:TEST_ENV='local'
$env:TEST_USERNAME='dedicated-test-account@example.invalid'
$secret=Read-Host 'Test password' -AsSecureString
$env:TEST_PASSWORD=[System.Net.NetworkCredential]::new('', $secret).Password
./load-testing/scripts/run-tests.ps1 smoke
./load-testing/scripts/run-tests.ps1 light
```

Run `medium`, `high`, and `target` progressively after reviewing each run; defaults are 1/10/25/50/100 VUs and 60/120/180/180/300 seconds respectively, including 20% ramp-up and 20% ramp-down. Stress defaults to 150 VUs over 600 seconds. `MAX_VUS` defaults to 100 (hard ceiling 1000); `PROFILE_VUS` and `DURATION_SECONDS` override a profile. Set `API_BASE_PATH`, `REQUEST_TIMEOUT`, `THINK_MIN_SECONDS`, `THINK_MAX_SECONDS`, `P95_MS`, `P99_MS`, `MAX_FAILURE_RATE`, `MIN_CHECK_RATE`, and `ENDPOINT_P95_MS` as needed. Threshold defaults are starting points, not SLAs. Optional `ABORT_ON_ERROR=true` uses `ABORT_FAILURE_RATE` (default 0.1) after `ABORT_DELAY` (default 30s). k6 exit code is retained, including threshold failure. All runs produce a JSON sample stream and summary, then Markdown/JSON reports. Interrupted or failed runs are not capacity evidence.

## Monitor the server

On the Lightsail host, separately from k6:

```bash
bash load-testing/monitoring/monitor.sh /tmp/lightsail-run.csv
# Ctrl-C after test, then securely copy CSV to the generator.
```

Samples every 5 seconds from procfs include CPU, RAM, swap, load, aggregate Node RSS, disk and kernel OOM kill counter. `MONITOR_INTERVAL` changes the interval. Set `MONITOR_PM2=true` to query PM2 on each sample; this adds overhead. Nginx error-log byte growth is a proxy, not an error count, and requires log access; rotation can make the delta unavailable. Inspect actual errors and kernel `journalctl -k` separately. Empty cells mean unavailable; counters are host-wide. Set `MONITOR_CSV` to a previously collected CSV before running the generator, or regenerate afterwards:

```bash
python3 load-testing/monitoring/analyze-metrics.py load-testing/reports/runs/RUN-summary.json --samples load-testing/reports/runs/RUN-samples.json --monitor /path/to/lightsail-run.csv --output load-testing/reports/runs/RUN
```

Align monitoring timestamps with the run; CSV statistics use the entire supplied file. CPU burst and cloud metrics are optional and not merged automatically. On a machine with AWS CLI credentials and permission, set `LIGHTSAIL_INSTANCE`, `AWS_REGION`, `START_TIME`, `END_TIME` (UTC ISO-8601), and run `bash load-testing/monitoring/aws-metrics.sh` to retrieve available Lightsail CPU and burst metrics. Metric availability, granularity and permissions vary; compare the time window and units. Inspect CloudWatch separately where applicable.

## Atlas, diagnosis and capacity

In Atlas Metrics examine connections, CPU, memory, network and query latency over the test window; inspect existing slow-query/Performance Advisor data and query plans when available. Check pool wait/timeout errors in application logs, and compare existing indexes and `explain` results before proposing indexes. No production profiling or index changes are made. Record Node event-loop delay separately if instrumented; inspect Nginx, OS and network metrics as applicable. HTTP latency alone does not prove which component is slow. CPU above 90% is a prompt to investigate sustained usage and burst balance, not proof by itself. Correlate memory headroom, swap, OOMs, PM2 restarts and disk with response failures.

Reports include request counts/rates, latency percentiles, status distribution, per-endpoint latency and available host statistics. The login and preflight are included in totals. `python load-testing/monitoring/compare-runs.py report1.json report2.json ...` lists the highest observed VU candidate with successful exit and thresholds; compare only equivalent completed runs and manually verify the steady-state period, data, environment, generator capacity and monitoring. VUs are concurrent simulated users, not requests per second. Repeat sustained, representative tests and evaluate p95/p99, errors and resource headroom before asserting capacity. A short 100-VU run alone cannot establish support for 100 simultaneous real users. Consider a larger Lightsail plan only after evidence of sustained host CPU/memory or burst-credit limits, and compare after addressing measured query or application bottlenecks.

Emergency stop: press Ctrl-C on the generator; if needed terminate the k6 process from the generator. Stop host monitoring with Ctrl-C. Coordinate with the operator, inspect errors, and do not proceed to a heavier profile after failure. Request timeouts default to 15 seconds; graceful interruption and report availability depend on k6 receiving the signal. No test is executed by installation.
