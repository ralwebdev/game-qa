#!/usr/bin/env python3
"""List successful completed test candidates; operator must validate representativeness."""
import argparse,json
from pathlib import Path
ap=argparse.ArgumentParser(); ap.add_argument('reports',nargs='+'); args=ap.parse_args()
candidates=[]
for file in args.reports:
    data=json.loads(Path(file).read_text(encoding='utf-8'))
    peak=data.get('observed_peak_vus'); ts=data.get('thresholds') or {}
    good=data.get('k6_exit_code')==0 and bool(ts) and not data.get('failed_threshold_metrics') and peak
    print(f"{file}: scenario={data.get('scenario')}, peak={peak}, exit={data.get('k6_exit_code')}, threshold failures={data.get('failed_threshold_metrics')}, candidate={bool(good)}")
    if good: candidates.append(peak)
print('Highest observed candidate VUs:',max(candidates) if candidates else 'none established')
print('Candidates require manual verification of steady state, workload, host telemetry, environment, and run completion. Observed VUs are not RPS or sustained capacity.')
