param([Parameter(Mandatory=$true)][ValidateSet('smoke','light','medium','high','target','stress')][string]$Scenario)
$ErrorActionPreference='Stop'
$root=Split-Path -Parent $PSScriptRoot
$file=if($Scenario -in @('smoke','stress')){$Scenario}else{"$Scenario-load"}
Get-Command k6,python | Out-Null
$out=Join-Path $root 'reports/runs'
New-Item -ItemType Directory -Force -Path $out | Out-Null
$stamp=(Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssZ')+'-'+$PID
$prefix=Join-Path $out $stamp
$env:LOAD_SCENARIO=$Scenario
& k6 run --out "json=$prefix-samples.json" --summary-export "$prefix-summary.json" (Join-Path $root "scenarios/$file.js")
$result=$LASTEXITCODE
$env:K6_EXIT_CODE="$result"
if(Test-Path "$prefix-summary.json") {
 $argsList=@((Join-Path $root 'monitoring/analyze-metrics.py'),"$prefix-summary.json",'--output',$prefix,'--samples',"$prefix-samples.json")
 if($env:MONITOR_CSV){$argsList+=@('--monitor',$env:MONITOR_CSV)}
 & python @argsList
 if($LASTEXITCODE -ne 0){exit 1}
} else {Write-Warning 'No summary produced; no report generated.'}
exit $result
