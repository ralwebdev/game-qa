#!/usr/bin/env bash
# Read-only optional metrics, queried from the generator or operator workstation.
set -Eeuo pipefail
: "${LIGHTSAIL_INSTANCE:?Set LIGHTSAIL_INSTANCE}"
: "${AWS_REGION:?Set AWS_REGION}"
: "${START_TIME:?Set START_TIME to UTC ISO-8601}"
: "${END_TIME:?Set END_TIME to UTC ISO-8601}"
for metric in CPUUtilization BurstCapacityPercentage BurstCapacityTime; do
  unit=Percent
  [[ "$metric" == BurstCapacityTime ]] && unit=Seconds
  echo "### $metric"
  aws lightsail get-instance-metric-data --region "$AWS_REGION" --instance-name "$LIGHTSAIL_INSTANCE" --metric-name "$metric" --period "${METRIC_PERIOD:-300}" --unit "$unit" --statistics Average Maximum --start-time "$START_TIME" --end-time "$END_TIME" || echo "Unavailable: $metric (permissions, metric, or unit)" >&2
done
