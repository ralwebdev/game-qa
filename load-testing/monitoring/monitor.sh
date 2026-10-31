#!/usr/bin/env bash
set -eu
interval="${MONITOR_INTERVAL:-5}"
[[ "$interval" =~ ^[1-9][0-9]*$ ]] || { echo 'Invalid interval' >&2; exit 2; }
out="${1:-lightsail-monitor-$(date -u +%Y%m%dT%H%M%SZ).csv}"
exec python3 - "$out" "$interval" <<'PY'
import csv, datetime, os, re, shutil, subprocess, sys, time
out, interval=sys.argv[1],int(sys.argv[2])
def read(path):
    try:
        with open(path) as f: return f.read()
    except (OSError,UnicodeError): return ''
def cpu():
    try:
        a=list(map(int,read('/proc/stat').splitlines()[0].split()[1:])); return sum(a[:8]),a[3]+a[4]
    except (ValueError,IndexError): return 0,0
def pm2():
    if os.environ.get('MONITOR_PM2')!='true': return '', ''
    try:
        import json
        data=json.loads(subprocess.run(['pm2','jlist'],capture_output=True,text=True,timeout=3,check=True).stdout)
        return sum(x.get('pm2_env',{}).get('status')=='online' for x in data),sum(x.get('pm2_env',{}).get('restart_time',0) for x in data)
    except (OSError,ValueError,subprocess.SubprocessError): return '', ''
def size(path):
    try: return os.stat(path).st_size
    except OSError: return ''
fields=['timestamp_utc','cpu_percent','mem_total_kb','mem_used_kb','mem_available_kb','swap_used_kb','load_1m','node_processes','node_rss_kb','disk_used_percent','pm2_online','pm2_restarts_total','nginx_error_log_bytes','oom_kill_total']
prev=cpu()
try:
    with open(out,'w',newline='') as f:
        w=csv.DictWriter(f,fieldnames=fields); w.writeheader(); f.flush()
        while True:
            time.sleep(interval); cur=cpu(); dt=cur[0]-prev[0]; pct=round(100*(1-(cur[1]-prev[1])/dt),2) if dt>0 else ''; prev=cur
            mem={}
            for line in read('/proc/meminfo').splitlines():
                a=line.split()
                if len(a)>1 and a[1].isdigit(): mem[a[0].rstrip(':')]=int(a[1])
            count=rss=0
            for pid in os.listdir('/proc'):
                if not pid.isdigit() or read('/proc/'+pid+'/comm').strip() not in ('node','nodejs'): continue
                m=re.search(r'^VmRSS:\s+(\d+)',read('/proc/'+pid+'/status'),re.M)
                if m: count+=1; rss+=int(m.group(1))
            disk=shutil.disk_usage('/'); online,restarts=pm2(); oom=re.search(r'^oom_kill\s+(\d+)',read('/proc/vmstat'),re.M); load=read('/proc/loadavg').split()
            w.writerow(dict(timestamp_utc=datetime.datetime.now(datetime.timezone.utc).isoformat(),cpu_percent=pct,mem_total_kb=mem.get('MemTotal',''),mem_used_kb=mem.get('MemTotal',0)-mem.get('MemAvailable',0),mem_available_kb=mem.get('MemAvailable',''),swap_used_kb=mem.get('SwapTotal',0)-mem.get('SwapFree',0),load_1m=load[0] if load else '',node_processes=count,node_rss_kb=rss,disk_used_percent=round(disk.used/disk.total*100,2),pm2_online=online,pm2_restarts_total=restarts,nginx_error_log_bytes=size(os.environ.get('NGINX_ERROR_LOG','/var/log/nginx/error.log')),oom_kill_total=int(oom.group(1)) if oom else '')); f.flush()
except KeyboardInterrupt: pass
PY
