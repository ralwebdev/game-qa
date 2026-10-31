#!/usr/bin/env python3
"""Summarize k6 output and optional application-host monitoring without inferring unmeasured causes."""
import argparse,csv,datetime,json,os,sys
from pathlib import Path

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('summary'); ap.add_argument('--output',required=True); ap.add_argument('--samples'); ap.add_argument('--monitor'); args=ap.parse_args()
    with open(args.summary,encoding='utf-8') as f: data=json.load(f)
    metrics=data.get('metrics',{})
    def values(name):
        m=metrics.get(name,{})
        return m.get('values',m)
    thresholds={k:v['thresholds'] for k,v in metrics.items() if v.get('thresholds')}
    failed=[k for k,ts in thresholds.items() if any((v.get('ok') is False if isinstance(v,dict) else v is False) for v in ts.values())]
    status={}; first=last=None; peak=0
    if args.samples:
        with open(args.samples,encoding='utf-8') as f:
            for line in f:
                try: row=json.loads(line)
                except json.JSONDecodeError: continue
                if row.get('type')!='Point': continue
                d=row.get('data',{}); t=d.get('time')
                if t: first=min(first,t) if first else t; last=max(last,t) if last else t
                if row.get('metric')=='response_status':
                    code=d.get('tags',{}).get('status','unknown'); status[code]=status.get(code,0)+1
                if row.get('metric')=='vus': peak=max(peak,d.get('value',0))
    duration=None
    if first and last:
        try: duration=(datetime.datetime.fromisoformat(last.replace('Z','+00:00'))-datetime.datetime.fromisoformat(first.replace('Z','+00:00'))).total_seconds()
        except ValueError: pass
    infra={}
    if args.monitor:
        with open(args.monitor,newline='',encoding='utf-8-sig') as f: rows=list(csv.DictReader(f))
        def nums(col):
            out=[]
            for row in rows:
                try: out.append(float(row[col]))
                except (KeyError,ValueError,TypeError): pass
            return out
        for col,fn in [('cpu_percent',max),('mem_total_kb',max),('mem_used_kb',max),('mem_available_kb',min),('swap_used_kb',max),('load_1m',max),('node_rss_kb',max),('disk_used_percent',max)]:
            a=nums(col); infra[col]=fn(a) if a else None
        for col in ('pm2_restarts_total','oom_kill_total','nginx_error_log_bytes'):
            a=nums(col); infra[col+'_delta']=a[-1]-a[0] if len(a)>1 and a[-1]>=a[0] else None
    findings=[]
    if failed: findings.append('High priority: thresholds failed for '+', '.join(failed)+'; correlate endpoint timing, status codes and telemetry before changing configuration.')
    if (infra.get('oom_kill_total_delta') or 0)>0: findings.append('Critical: OOM kill counter increased; stop testing and inspect kernel logs and memory use.')
    if (infra.get('cpu_percent') or 0)>=90: findings.append('CPU reached at least 90%; correlate sustained CPU and burst capacity with latency before attributing saturation.')
    if infra.get('mem_available_kb') is not None and infra['mem_available_kb']<204800: findings.append('Available RAM fell below 200 MiB; inspect RSS, swap and OOM events.')
    if (infra.get('pm2_restarts_total_delta') or 0)>0: findings.append('PM2 restart count increased; inspect application and PM2 logs.')
    findings.append('Correlate slow endpoints with Atlas query and connection metrics, Node event-loop telemetry, Nginx logs and network timings; these sources are not measured by HTTP latency alone.')
    report={'project':'Game QA Academy MERN','generated_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'environment':os.environ.get('TEST_ENV','staging'),'scenario':os.environ.get('LOAD_SCENARIO','unknown'),'k6_exit_code':int(os.environ['K6_EXIT_CODE']) if os.environ.get('K6_EXIT_CODE','').isdigit() else None,'server_specification':'Lightsail 2 GB RAM (assumed; verify)','sample_window_seconds':duration,'observed_peak_vus':peak or None,'results':{'http_requests':values('http_reqs'),'latency_ms':values('http_req_duration'),'failure_rate':values('http_req_failed'),'checks':values('checks'),'status_codes':status if args.samples else None,'endpoint_latency_ms':{k:values(k) for k in metrics if k.startswith('http_req_duration{endpoint:')}},'thresholds':thresholds,'failed_threshold_metrics':failed,'infrastructure':infra,'findings_and_recommendations':findings,'capacity_assessment':'Not established from one report. Compare complete representative steady-state runs at each concurrency, threshold outcomes, and correlated telemetry. VUs are not requests per second; a short ramp does not prove sustained capacity.','limitations':['Preflight login and endpoint checks contribute to aggregates.','Sample-window duration can differ from the configured stage duration.','Host CSV must be aligned to the run; CPU burst, Atlas and event-loop data are not automatically included.','An interrupted or partial run cannot establish capacity.']}
    prefix=Path(args.output); prefix.parent.mkdir(parents=True,exist_ok=True)
    Path(str(prefix)+'.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    lines=['# Performance report','',f"Generated: {report['generated_at_utc']}",f"Environment: {report['environment']} | Scenario: {report['scenario']}",f"Server: {report['server_specification']}",f"Sample window: {duration} seconds | Observed peak VUs: {report['observed_peak_vus']}",'','## Results','','```json',json.dumps(report['results'],indent=2),'```','','## Thresholds','','```json',json.dumps(thresholds,indent=2),'```','','## Infrastructure','','```json',json.dumps(infra or {'status':'Not supplied'},indent=2),'```','','## Findings and recommendations','']+['- '+x for x in findings]+['','## Capacity assessment','',report['capacity_assessment'],'','## Limitations','']+['- '+x for x in report['limitations']]
    Path(str(prefix)+'.md').write_text('\n'.join(lines)+'\n',encoding='utf-8'); print('Reports:',str(prefix)+'.md',str(prefix)+'.json')
if __name__=='__main__':
    try: main()
    except (OSError,ValueError,KeyError) as e: print('Report failed:',e,file=sys.stderr); sys.exit(1)
