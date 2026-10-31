#!/usr/bin/env bash
set -Eeuo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
case "${1:-}" in smoke|stress) file="$1";; light|medium|high|target) file="$1-load";; *) echo 'Usage: run-tests.sh smoke|light|medium|high|target|stress' >&2; exit 2;; esac
command -v k6 >/dev/null; command -v python3 >/dev/null
mkdir -p "$root/reports/runs"
stamp="$(date -u +%Y%m%dT%H%M%SZ)-$$"
prefix="$root/reports/runs/$stamp"
export LOAD_SCENARIO="$1"
set +e
k6 run --out "json=$prefix-samples.json" --summary-export "$prefix-summary.json" "$root/scenarios/$file.js"
result=$?
export K6_EXIT_CODE="$result"
set -e
if [[ -f "$prefix-summary.json" ]]; then
 args=("$prefix-summary.json" --output "$prefix" --samples "$prefix-samples.json")
 if [[ -n "${MONITOR_CSV:-}" ]]; then args+=(--monitor "$MONITOR_CSV"); fi
 python3 "$root/monitoring/analyze-metrics.py" "${args[@]}" || exit 1
else echo 'No summary produced; no report generated.' >&2; fi
exit "$result"
