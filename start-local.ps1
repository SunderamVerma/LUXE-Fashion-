$ErrorActionPreference = 'Stop'

$mongoBin = 'C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe'
$dbPath = 'C:\data\db'

if (!(Test-Path $dbPath)) {
  New-Item -ItemType Directory -Path $dbPath -Force | Out-Null
}

$mongoListening = Get-NetTCPConnection -LocalPort 27017 -State Listen -ErrorAction SilentlyContinue
if (-not $mongoListening) {
  if (!(Test-Path $mongoBin)) {
    throw 'MongoDB server executable not found at C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe'
  }

  Start-Process -FilePath $mongoBin -ArgumentList "--dbpath `"$dbPath`" --bind_ip 127.0.0.1 --port 27017" -WindowStyle Minimized
  Start-Sleep -Seconds 2
}

Set-Location $PSScriptRoot
npm run dev
